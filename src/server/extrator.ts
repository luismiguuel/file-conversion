import PDFDocument from 'pdfkit';
import fs from "node:fs"

export default function Extrator(file:string, fileSize:number){
    
    try {
        const arquivo = fs.readFileSync(file)
        const tamanhoArquivo = arquivo.length

        return arquivo

    } catch(error){
        console.log(error)
    }
    
}