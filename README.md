# Detecção de Encontros

Programa em Node.js que processa dados de geolocalização e detecta pessoas monitoradas a menos de 20 metros uma da outra no mesmo timestamp.

Cada encontro é classificado como:

- `protetiva`: um agressor e sua respectiva vítima.
- `faccao`: dois monitorados da mesma facção.
- `generico`: qualquer outro encontro.

## Lógica

1. **Leitura:** o arquivo é lido linha a linha, e as posições são agrupadas por timestamp. Cada grupo é processado assim que termina, antes de o próximo ser lido.
2. **Comparação:** dentro de cada grupo, cada par de posições é comparado uma única vez. Posições de timestamps diferentes nunca são comparadas.
3. **Filtro:** pares com diferença de latitude acima do limite são descartados sem calcular a distância.
4. **Distância:** os demais pares passam pela fórmula de Haversine, com raio da Terra de 6.371.000 m. É encontro quando a distância é menor que 20 metros.
5. **Classificação:** o encontro é `protetiva` se um dos dois consta como agressor do outro, `faccao` se ambos têm a mesma facção e `generico` nos demais casos.
6. **Saída:** ao final, todos os encontros são gravados em um único JSON.

## Requisitos

- Node.js (testado na versão 24.14.0). O projeto não tem dependências externas.

## Como rodar

Os datasets não estão no repositório, por causa do tamanho. Baixe os arquivos `dataset1.txt` a `dataset7.txt` de `https://bucket-projeto-trainee.s3.sa-east-1.amazonaws.com/`, coloque-os na pasta `datasets/` e, na raiz do projeto, rode:

```bash
node src/index.js datasets/dataset1.txt
```

O resultado é gravado em `respostas/dataset1.json`, e o terminal mostra a quantidade de encontros e o tempo de execução.

## Resultados

Os JSONs gerados para os 7 datasets estão em `respostas/dataset1.json` a `respostas/dataset7.json`.

| Dataset | Encontros |
|---|---|
| 1 | 4 |
| 2 | 6 |
| 3 | 10 |
| 4 | 15 |
| 5 | 21 |
| 6 | 27 |
| 7 | 35 |

Nos datasets 1 e 2, a saída é idêntica às respostas de exemplo, sem nenhum encontro faltando ou sobrando.

## Como validar

Para comparar a saída com um arquivo de respostas de exemplo, coloque-o na pasta `respostas/` e rode:

```bash
node src/validador.js respostas/dataset1.json respostas/respostas1.json
```

O validador mostra os encontros corretos, os que estão faltando e os que estão sobrando.

## Estrutura

- `src/index.js`: executa o programa e grava o JSON de saída.
- `src/leitor.js`: lê o dataset em streaming, um timestamp por vez.
- `src/detector.js`: compara as posições e classifica os encontros.
- `src/haversine.js`: calcula a distância em metros.
- `src/validador.js`: compara a saída com as respostas de exemplo.

## Decisões

- **Leitura em streaming:** permite processar arquivos grandes sem carregá-los inteiros na memória. Depende de os datasets estarem ordenados por timestamp.
- **Leitura manual dos bytes:** o arquivo é lido em pedaços de 1 MB, e os campos são convertidos direto dos bytes, sem `readline` nem `split`. Nos datasets 3 a 7, o tempo total caiu de cerca de 37 s para 16 s. Depende do formato definido no enunciado: coordenadas em notação científica, por exemplo, não são suportadas.
- **Filtro por latitude:** pares com mais de 0,00018° de diferença de latitude (cerca de 20,015 m) não podem ser um encontro, então não passam pelo cálculo de Haversine.
- **Um registro por par:** cada par gera um único encontro por timestamp, com o tipo mais específico, como nas respostas de exemplo.

## Por que esta é a melhor abordagem

- **Exatidão primeiro:** como falso positivo tira ponto, cada etapa foi validada contra as respostas de exemplo. O filtro por latitude é matematicamente seguro: a distância entre dois pontos nunca é menor que a causada só pela diferença de latitude. As distâncias reproduzem as do exemplo até a última casa decimal.
- **Escala com o tamanho do arquivo:** a leitura em streaming usa memória constante e processa até o dataset 7, de 609 MB, que não caberia em uma única string no Node.
- **Simples onde o problema é pequeno:** cada timestamp tem no máximo 120 posições, então comparar todos os pares é mais simples e rápido que montar estruturas espaciais, como grades ou árvores.
- **Otimizada onde o tempo realmente é gasto:** cada otimização foi guiada por medição e pelo profiler do Node, e só foi aceita se gerasse saídas idênticas byte a byte. O tempo total dos datasets 3 a 7 caiu de cerca de 92 s, na primeira versão completa, para cerca de 16 s.
- **Sem dependências externas:** usa só recursos nativos do Node, sem nada para instalar.
