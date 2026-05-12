# Guia Do Notebook De Codificacoes E Hashes

Este guia mostra como rodar e usar o notebook `lab_codificacoes_hashes.ipynb`.

O objetivo do notebook e demonstrar, de forma pratica, diferencas entre codificacoes e funcoes de hash usadas em seguranca da informacao.

## Arquivo

O notebook esta em:

```text
notebooks/lab_codificacoes_hashes.ipynb
```

## Pre-requisitos

Escolha uma das opcoes abaixo:

- VS Code com extensao Jupyter;
- Jupyter Notebook;
- JupyterLab.

Tambem e necessario ter Python instalado. O notebook usa apenas bibliotecas padrao do Python, entao nao precisa instalar pacotes extras para executar as celulas atuais.

## Como Baixar O Repositorio

```bash
git clone https://github.com/rodrigorosamuniz/lab-dlp-simulation.git
cd lab-dlp-simulation
```

## Opcao 1: Rodar Pelo VS Code

1. Abra a pasta `lab-dlp-simulation` no VS Code.
2. Instale a extensao `Jupyter`, caso ainda nao tenha.
3. Abra o arquivo `notebooks/lab_codificacoes_hashes.ipynb`.
4. Selecione um interpretador Python quando o VS Code pedir.
5. Clique em `Run All` ou execute as celulas uma por uma.

## Opcao 2: Rodar Pelo Jupyter Notebook

Instale o Jupyter, se necessario:

```bash
python -m pip install notebook
```

Suba o Jupyter:

```bash
jupyter notebook
```

No navegador, abra:

```text
notebooks/lab_codificacoes_hashes.ipynb
```

## Opcao 3: Rodar Pelo JupyterLab

Instale o JupyterLab, se necessario:

```bash
python -m pip install jupyterlab
```

Suba o JupyterLab:

```bash
jupyter lab
```

No navegador, abra:

```text
notebooks/lab_codificacoes_hashes.ipynb
```

## Como Usar O Notebook

1. Leia a primeira celula Markdown para entender o objetivo.
2. Execute a celula de codigo.
3. Digite um texto quando o notebook pedir.
4. Compare as saidas geradas.
5. Rode novamente com textos diferentes.

Use exemplos simples para comecar:

```text
seguranca
```

```text
Seguranca
```

```text
senha123
```

```text
senha124
```

## O Que Observar

Durante a execucao, observe:

- codificacoes transformam a representacao do texto;
- codificacoes podem ser revertidas quando o algoritmo e conhecido;
- hashes geram resumos de tamanho fixo;
- hashes nao foram feitos para serem revertidos;
- pequenas mudancas no texto geram hashes muito diferentes;
- hashes sao usados para integridade, comparacao e armazenamento seguro de verificadores, mas nao substituem criptografia.

## Cuidados Didaticos

Nao use senhas reais, tokens reais, CPFs, emails pessoais ou qualquer dado sensivel no notebook. Use apenas exemplos ficticios.

Este notebook e demonstrativo. Ele nao implementa armazenamento seguro de senhas, salt, pepper, KDF, criptografia simetrica ou assinatura digital.
