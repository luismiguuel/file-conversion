import * as net from 'net';
import * as fs from 'fs';
import * as crypto from 'crypto';
import PDFDocument from 'pdfkit';

const HOST  = '127.0.0.1';
const PORT = '5000';

const server = net.createServer(
    (socket) => {console.log("Cliente conectado")}
)