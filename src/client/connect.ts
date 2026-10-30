
import * as net from 'node:net';
import * as fs from 'node:fs';
import * as path from 'node:path';

export default function conectarServidor(
    fileName: string,
    outputPath: string,
    host: string,
    port: number
): Promise<void> {

    return new Promise((resolve, reject) => {
        const socket = net.createConnection({ host, port });

        type Etapa =
            | 'AGUARDANDO_ACEITE'
            | 'RECEBENDO_PDF'
            | 'CONCLUIDO';

        let etapa: Etapa = 'AGUARDANDO_ACEITE';
        let resposta = '';
        let tamanhoPDF: number | null = null;
        let dadosPDF = Buffer.alloc(0);
        let finalizado = false;
        let recebimentoCompleto = false;

        const falhar = (erro: Error) => {
            if (finalizado) return;

            finalizado = true;
            socket.destroy();
            reject(erro);
        };

        const enviarArquivo = async () => {
            try {
                const arquivo = await fs.promises.readFile(fileName);

                const tamanhoArquivo = Buffer.alloc(4);
                tamanhoArquivo.writeUInt32BE(arquivo.length);

                const transferencia = Buffer.concat([
                    tamanhoArquivo,
                    arquivo
                ]);

                etapa = 'RECEBENDO_PDF';

                socket.write(transferencia);

                console.log('Arquivo enviado ao servidor!');
                console.log('Aguardando conversão...');

            } catch (error) {
                falhar(error instanceof Error ? error : new Error(String(error)));
            }
        };

        const receberPDF = async (dados: Buffer) => {
            dadosPDF = Buffer.concat([dadosPDF, dados]);

            if (tamanhoPDF === null) {
                if (dadosPDF.length < 4) return;

                tamanhoPDF = dadosPDF.readUInt32BE(0);
                dadosPDF = dadosPDF.subarray(4);
            }

            if (dadosPDF.length > tamanhoPDF) {
                falhar(new Error('O servidor enviou mais bytes do que o esperado.'));
                return;
            }

            if (dadosPDF.length === tamanhoPDF) {
                recebimentoCompleto = true
                try {
                    await fs.promises.mkdir(path.dirname(outputPath), {
                        recursive: true
                    });

                    await fs.promises.writeFile(outputPath, dadosPDF);

                    finalizado = true;
                    etapa = 'CONCLUIDO';

                    console.log(`PDF salvo em: ${outputPath}`);

                    socket.end();
                    resolve();

                } catch (error) {
                    falhar(error instanceof Error ? error : new Error(String(error)));
                }
            }
        };

        socket.on('connect', () => {
            console.log('Conectado ao servidor!');

            socket.write(`CONVERT txt pdf ${path.basename(fileName)}\n`);
        });

        socket.on('data', (dados: Buffer) => {
            if (etapa === 'AGUARDANDO_ACEITE') {
                resposta += dados.toString('utf-8');

                const fimCabecalho = resposta.indexOf('\n');

                if (fimCabecalho === -1) return;

                const mensagem = resposta.slice(0, fimCabecalho).trim();

                if (mensagem === 'ACCEPT') {
                    console.log('Solicitação aceita pelo servidor!');

                    etapa = 'RECEBENDO_PDF';

                    void enviarArquivo();
                    return;
                }

                falhar(new Error(`Solicitação rejeitada: ${mensagem}`));
                return;
            }

            if (etapa === 'RECEBENDO_PDF') {
                void receberPDF(dados);
            }
        });

        socket.on('error', (error) => {
            falhar(error);
        });

        socket.on('close', () => {
            console.log('Conexão encerrada.');

            if (!finalizado && !recebimentoCompleto) {
                falhar(new Error('Conexão encerrada antes da conclusão da transferência.'));
            }
        });
    });
}
