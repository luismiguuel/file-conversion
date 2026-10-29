import * as net from 'net';
import * as fs from 'fs';
import * as readline from 'readline'


const HOST = '127.0.0.1';
const PORT = '5000';

const rl = readline.createInterface({
    input : process.stdin,
    output: process.stdout
})

console.log("BEM VINDO AO CONVERSOR 2000: TXT PARA PDF")
console.log("---------------------------------------")
console.log("")
const fileName = await new Promise<string>((resolve) => rl.question("Insira o nome do arquivo, juntamente do formato .txt no final (Ex.: resposta.txt): ", (resposta: string) => {
    console.log("Nome infomado!")
    resolve(resposta)
    rl.close()
}))

const outputPath = await new Promise<string>((resolve) => rl.question("Caminho: ", (resposta) => {
    console.log("Caminho informado!")
    resolve(resposta)
    rl.close()
}))

