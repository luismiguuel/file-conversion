# File Conversion

Sistema distribuído de conversão de arquivos utilizando o modelo cliente-servidor e sockets TCP.

## Objetivo

Permitir que múltiplos clientes enviem arquivos `.txt` para um servidor centralizado, que realiza a conversão para `.pdf` e devolve o resultado ao cliente correspondente.

## Tecnologias

- Node.js
- TypeScript
- Sockets TCP (`net`)
- PDFKit

## Execução

Instale as dependências:

```bash
npm install
```

Compile o projeto:

```bash
npm run build
```

Inicie o servidor em um terminal:

```bash
npm run server
```

Inicie o cliente em outro terminal:

```bash
npm run client
```

## Estrutura

```text
src/
├── client/
│   └── cliente.ts
└── server/
    └── servidor.ts
```