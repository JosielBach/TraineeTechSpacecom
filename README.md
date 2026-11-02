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

Os datasets não estão no repositório. Coloque os arquivos `.txt` na pasta `datasets/` e, na raiz do projeto, rode:

```bash
node src/index.js datasets/dataset1.txt
```

O resultado é gravado em `respostas/dataset1.json`, e o terminal mostra a quantidade de encontros e o tempo de execução.

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
