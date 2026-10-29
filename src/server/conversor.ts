import PDFDocument from 'pdfkit';
import fs from "node:fs"


export default function Conversor(fileName: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument()
        const output = fs.createWriteStream(outputPath)

        output.on("finish", resolve)
        output.on("error", reject)
        doc.on("error", reject)

        doc.pipe(output)
        doc.fontSize(12).text(`${fileName}-${Date.now()}`)
        doc.end()
        })
    

}