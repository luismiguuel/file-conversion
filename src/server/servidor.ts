
import * as net from 'node:net';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import Conversor from './conversor.js';

const HOST = '127.0.0.1';
const PORT = 5000;
const TEMP_DIR = path.resolve('temp');

const server = net.createServer((socket) => {
    console.log('Cliente conectado!');

    let requisicaoRecebida = false;
    let dadosRequisicao = Buffer.alloc(0);

    let tamanhoArquivo: number | null = null;
    let dadosArquivo = Buffer.alloc(0);
    let processando = false;

    const receberArquivo = (dados: Buffer) => {
        if (processando) return;

        dadosArquivo = Buffer.concat([dadosArquivo, dados]);

        if (tamanhoArquivo === null) {
            if (dadosArquivo.length < 4) return;

            tamanhoArquivo = dadosArquivo.readUInt32BE(0);
            dadosArquivo = dadosArquivo.subarray(4);
        }

        if (dadosArquivo.length > tamanhoArquivo) {
            socket.destroy(new Error('Tamanho do arquivo excedido.'));
            return;
        }

        if (dadosArquivo.length === tamanhoArquivo) {
            processando = true;
            socket.pause();

            void converterEEnviar();
        }
    };

    const converterEEnviar = async () => {
        const nomeBase = path.parse(nomeArquivo).name;
        const localArquivo = path.join(
            TEMP_DIR,
            `${nomeBase}-${randomUUID()}.pdf`
        );

        try {
            await fs.promises.mkdir(TEMP_DIR, { recursive: true });

            await Conversor(dadosArquivo, localArquivo);

            const pdf = await fs.promises.readFile(localArquivo);

            const tamanhoPDF = Buffer.alloc(4);
            tamanhoPDF.writeUInt32BE(pdf.length);

            socket.end(Buffer.concat([tamanhoPDF, pdf]));

            console.log(`Conversão concluída: ${nomeBase}.pdf`);

        } catch (error) {
            console.error('Erro durante a conversão:', error);
            socket.destroy();
        } finally {
            await fs.promises.rm(localArquivo, { force: true });
        }
    };

    let nomeArquivo = '';

    socket.on('data', (dados: Buffer) => {
        if (!requisicaoRecebida) {
            dadosRequisicao = Buffer.concat([dadosRequisicao, dados]);

            const fimCabecalho = dadosRequisicao.indexOf(10);

            if (fimCabecalho === -1) return;

            const mensagem = dadosRequisicao
                .subarray(0, fimCabecalho)
                .toString('utf-8')
                .trim();

            const restante = dadosRequisicao.subarray(fimCabecalho + 1);

            const partes = mensagem.match(
                /^CONVERT\s+(\S+)\s+(\S+)\s+(.+)$/
            );

            if (!partes) {
                socket.end('REJECT Solicitação inválida\n');
                return;
            }

            const formatoOrigem = partes[1];
            const formatoDestino = partes[2];
            nomeArquivo = path.basename(partes[3]!);

            if (
                formatoOrigem !== 'txt' ||
                formatoDestino !== 'pdf' ||
                !nomeArquivo
            ) {
                socket.end('REJECT Conversão não suportada\n');
                return;
            }

            requisicaoRecebida = true;

            console.log(`Solicitação recebida: ${nomeArquivo}`);

            socket.write('ACCEPT\n');

            dadosRequisicao = Buffer.alloc(0);

            if (restante.length > 0) {
                receberArquivo(restante);
            }

            return;
        }

        receberArquivo(dados);
    });

    socket.on('error', (error) => {
        console.error('Erro na conexão:', error);
    });

    socket.on('close', () => {
        console.log('Cliente desconectado!');
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Servidor executando em ${HOST}:${PORT}`);
});
