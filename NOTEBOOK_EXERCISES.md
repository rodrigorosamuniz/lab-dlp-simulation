# Exercicios Do Notebook De Codificacoes E Hashes

## Objetivo

Praticar conceitos de codificacao e hash usando o notebook `notebooks/lab_codificacoes_hashes.ipynb`.

Ao final, o aluno deve conseguir diferenciar representacao reversivel de resumo criptografico, interpretar saidas e explicar usos basicos em seguranca da informacao.

## Preparacao

Abra o notebook conforme o [Guia do Notebook](NOTEBOOK_GUIDE.md).

Execute a celula principal pelo menos uma vez usando:

```text
seguranca
```

Anote as saidas geradas.

## Exercicio 1: Primeira Execucao

Execute o notebook com o texto:

```text
laboratorio
```

Responda:

1. Quais saidas foram geradas?
2. Quais saidas parecem codificacoes?
3. Quais saidas parecem hashes?
4. Alguma saida permite reconhecer facilmente o texto original?

Resultado esperado:

- o notebook gera representacoes diferentes para o mesmo texto;
- codificacoes e hashes nao devem ser interpretados como a mesma coisa.

## Exercicio 2: Maiusculas E Minusculas

Execute o notebook duas vezes:

```text
seguranca
```

```text
Seguranca
```

Compare as saidas.

Responda:

1. As saidas foram iguais ou diferentes?
2. Uma unica letra maiuscula alterou o hash?
3. O que isso mostra sobre sensibilidade a pequenas mudancas?

Resultado esperado:

- os hashes mudam quando o texto muda;
- `seguranca` e `Seguranca` sao entradas diferentes.

## Exercicio 3: Pequena Alteracao No Texto

Execute o notebook com:

```text
senha123
```

Depois execute com:

```text
senha124
```

Responda:

1. A diferenca visual entre os textos e pequena?
2. A diferenca entre os hashes tambem parece pequena?
3. Por que essa propriedade e importante para integridade?

Resultado esperado:

- pequenas alteracoes na entrada geram hashes muito diferentes;
- isso ajuda a detectar alteracoes em arquivos, mensagens ou registros.

## Exercicio 4: Codificacao Nao E Criptografia

Execute o notebook com:

```text
dados publicos
```

Observe as codificacoes geradas.

Responda:

1. Codificar o texto torna a informacao secreta?
2. Uma pessoa que conhece o algoritmo consegue reverter a codificacao?
3. Por que Base64 nao deve ser tratado como criptografia?

Resultado esperado:

- codificacao muda a representacao;
- codificacao nao garante confidencialidade;
- Base64 nao protege segredo.

## Exercicio 5: Hash Nao E Codificacao

Execute o notebook com:

```text
mensagem de teste
```

Observe os hashes gerados.

Responda:

1. O hash permite recuperar diretamente o texto original?
2. Por que hashes sao usados para comparacao de integridade?
3. O que acontece se duas pessoas calcularem o mesmo hash para o mesmo texto?

Resultado esperado:

- hash nao e feito para ser revertido;
- a mesma entrada deve produzir o mesmo hash;
- hashes ajudam a verificar se algo foi alterado.

## Exercicio 6: Entrada Vazia Ou Muito Curta

Execute o notebook com uma entrada curta:

```text
a
```

Se o notebook permitir, teste tambem uma entrada vazia apenas pressionando `Enter`.

Responda:

1. O notebook gera hash para texto curto?
2. O tamanho do hash muda conforme o tamanho da entrada?
3. O que isso mostra sobre funcoes de hash?

Resultado esperado:

- hashes possuem tamanho de saida definido pelo algoritmo;
- a saida nao cresce proporcionalmente ao texto de entrada.

## Exercicio 7: Comparar SHA-256 E SHA-512

Execute o notebook com:

```text
comparacao de algoritmos
```

Responda:

1. Qual saida e maior: SHA-256 ou SHA-512?
2. O numero no nome do algoritmo tem relacao com o tamanho da saida?
3. Em quais situacoes pode fazer sentido escolher algoritmos de hash mais fortes?

Resultado esperado:

- SHA-512 produz saida maior que SHA-256;
- o tamanho do resumo depende do algoritmo.

## Exercicio 8: Uso Em Segurança Da Informacao

Escolha um texto qualquer ficticio e execute o notebook.

Depois responda:

1. Qual saida voce usaria para transportar texto em um formato seguro para sistemas?
2. Qual saida voce usaria para verificar integridade?
3. Qual saida voce nao usaria para esconder segredo?
4. O que ainda faltaria para armazenar senha de forma segura em producao?

Resultado esperado:

- codificacao pode ajudar em transporte/representacao;
- hash pode ajudar em integridade;
- Base64 nao deve ser usado para esconder segredo;
- armazenamento seguro de senha exige controles adicionais, como salt e algoritmos apropriados para senha.

## Consolidacao Individual

Preencha a tabela:

| Conceito | E reversivel? | Protege confidencialidade? | Uso tipico |
| --- | --- | --- | --- |
| Base64 |  |  |  |
| URL encoding |  |  |  |
| SHA-256 |  |  |  |
| SHA-512 |  |  |  |

Depois escreva, com suas palavras:

1. A diferenca entre codificacao e hash.
2. Um exemplo de uso correto de codificacao.
3. Um exemplo de uso correto de hash.
4. Um erro comum ao confundir codificacao com seguranca.
