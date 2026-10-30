# File Conversion — Conversor TXT para PDF

Projeto desenvolvido para a **APS 01 de Introdução aos Sistemas Distribuídos e Redes de Computadores (CIN0143)**, do Centro de Informática da UFPE, conforme a especificação da **Equipe 05**.

## Sobre o projeto

O sistema permite converter arquivos `.txt` em `.pdf` por meio de uma arquitetura **cliente-servidor**, utilizando **sockets TCP**. O cliente envia um arquivo de texto ao servidor, que realiza a conversão e devolve o PDF gerado. O cliente, então, salva o resultado em disco.

O servidor aceita múltiplas conexões, tratando cada cliente por meio de seu próprio socket. Os arquivos PDF temporários recebem identificadores únicos, evitando conflitos entre conversões simultâneas.

## Tecnologias utilizadas

- **Node.js** e **TypeScript**;
- Módulo nativo **`node:net`** para comunicação TCP;
- **PDFKit** para geração dos documentos PDF;
- Módulos nativos **`node:fs`**, **`node:path`** e **`node:crypto`** para manipulação dos arquivos e isolamento das conversões.

## Pré-requisitos

- Node.js atualizado (recomenda-se a versão 22 ou superior);
- npm;
- Git, caso queira clonar o repositório.

## Como executar

### 1. Baixar o projeto

```bash
git clone https://github.com/luismiguuel/file-conversion.git
cd file-conversion
```

### 2. Instalar as dependências

Na pasta raiz do projeto, execute:

```bash
npm install
```

O `npm install` instala as dependências declaradas no `package.json`, incluindo o `tsx` utilizado pelos scripts de execução.

### 3. Iniciar o servidor

Abra um terminal na raiz do projeto e execute:

```bash
npm run server
```

O servidor ficará escutando em **`127.0.0.1:5000`**. Mantenha esse terminal aberto enquanto utilizar o sistema.

### 4. Iniciar o cliente

Em **outro terminal**, também na raiz do projeto, execute:

```bash
npm run client
```

### 5. Converter um arquivo

Coloque o arquivo `.txt` que deseja converter **na raiz do projeto**. O repositório já inclui o arquivo `teste.txt`, que pode ser usado como exemplo.

Quando o cliente solicitar o nome do arquivo, digite:

```text
Insira o nome do arquivo com .txt no final: teste.txt
```

O cliente enviará o arquivo ao servidor, aguardará a conversão e salvará o resultado em:

```text
convertidos/teste.pdf
```

A pasta `convertidos/` é criada automaticamente quando necessário.

## Funcionamento da comunicação

1. O cliente abre uma conexão TCP com o servidor em `127.0.0.1:5000`.
2. Envia a solicitação `CONVERT txt pdf <nome_do_arquivo>`.
3. O servidor verifica o formato solicitado e responde com `ACCEPT` ou `REJECT`.
4. Se a solicitação for aceita, o cliente envia o tamanho do arquivo (4 bytes, inteiro sem sinal em *big-endian*) e, em seguida, seus bytes.
5. O servidor recebe o arquivo completo e utiliza o PDFKit para gerar o PDF em um arquivo temporário com identificador único.
6. O servidor devolve o tamanho do PDF (também em 4 bytes) e os bytes do documento.
7. O cliente recebe o conteúdo, salva o PDF na pasta `convertidos/` e informa a conclusão da operação.

A comunicação TCP preserva a ordem dos bytes transmitidos. O protocolo implementado delimita os arquivos utilizando seus tamanhos, evitando depender da divisão dos dados em pacotes ou eventos de recebimento.

## Múltiplos clientes

O servidor utiliza `net.createServer()` e mantém o estado de cada transferência associado à conexão correspondente. Isso permite atender solicitações de diferentes clientes de maneira concorrente. Para testar, mantenha o servidor ligado e abra dois ou mais terminais, executando em cada um:

```bash
npm run client
```

Cada cliente pode selecionar um arquivo `.txt`. No servidor, os PDFs intermediários são nomeados com UUIDs e removidos após o processamento. O resultado de cada conversão é enviado pelo socket do cliente que fez a solicitação.

> Observação: os clientes executados a partir de uma mesma cópia do projeto compartilham a pasta `convertidos/`. Se dois clientes converterem arquivos com o mesmo nome, seus resultados locais poderão ter o mesmo caminho e um poderá sobrescrever o outro.

## Estrutura do projeto

```text
file-conversion/
├── src/
│   ├── client/
│   │   ├── cliente.ts      # Interface de linha de comando
│   │   └── connect.ts      # Comunicação TCP e salvamento do PDF
│   └── server/
│       ├── servidor.ts     # Servidor TCP e controle das requisições
│       └── conversor.ts    # Conversão de texto para PDF com PDFKit
├── teste.txt               # Arquivo de exemplo
├── package.json            # Dependências e scripts
├── package-lock.json
├── tsconfig.json            # Configuração do TypeScript
├── temp/                    # Arquivos temporários do servidor
└── convertidos/             # PDFs recebidos pelo cliente
```

As pastas `temp/` e `convertidos/` são utilizadas durante a execução, conforme necessário. Não é preciso gerar a pasta `dist/` para rodar o projeto.

## Problemas comuns

- **`ECONNREFUSED 127.0.0.1:5000`:** verifique se o servidor está em execução antes de iniciar o cliente.
- **`Cannot find module ...`:** execute `npm install` e verifique se a dependência `tsx` está instalada e os scripts estão configurados no `package.json`.
- **Arquivo não encontrado (`ENOENT`):** coloque o `.txt` na raiz do projeto e informe seu nome corretamente.
- **Porta 5000 já utilizada:** encerre o processo que está usando a porta ou ajuste `HOST`/`PORT` nos arquivos do cliente e servidor.
- **Conversão não suportada:** o projeto implementa exclusivamente a conversão de `txt` para `pdf`.

## Limitações atuais

- O endereço do servidor e a porta estão fixos em `127.0.0.1:5000`, portanto o projeto está configurado por padrão para execução local. Para utilizá-lo entre máquinas diferentes, é necessário ajustar os endereços e permitir a conexão na rede.
- A interface do cliente realiza uma conversão por execução.
- Os arquivos de texto são interpretados como UTF-8 e convertidos para um PDF de texto simples; não há preservação de formatação avançada.