import fs from "node:fs"

export default function Extrator(file:string){
    
    try {
        const arquivo = fs.readFileSync(file)
        const tamanhoArquivo = arquivo.length

        return tamanhoArquivo

    } catch(error){
        console.log(error)
    }
    
}