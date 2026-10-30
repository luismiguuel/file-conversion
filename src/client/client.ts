
import * as readline from 'node:readline';
import conectarServidor from './connect.js';

const HOST = '127.0.0.1';
const PORT = 5000;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function perguntar(pergunta: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(pergunta, resolve);
    });
}

console.log('BEM VINDO AO CONVERSOR 2000: TXT PARA PDF');
console.log('---------------------------------------');

try {
    const fileName = await perguntar(
        'Insira o nome do arquivo com .txt no final: '
    );

    await conectarServidor(
        fileName,
        HOST,
        PORT
    );

    console.log('Conversão finalizada com sucesso!');

} catch (error) {
    console.error('Erro na solicitação:', error);
} finally {
    rl.close();
}
