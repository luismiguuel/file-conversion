import PDFDocument from 'pdfkit';
import fs from "node:fs"



export default function Conversor(file:string, fileName:string){
    const doc = new PDFDocument()

    doc.pipe(fs.createWriteStream(`${fileName}`))
    doc.fontSize(12).text(file)
    doc.end()
}