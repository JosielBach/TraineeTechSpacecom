const fs = require('fs');
const path = require('path');
const { lerPosicoesPorTimestamp } = require('./leitor');
const { detectarEncontros } = require('./detector');

async function executar() {
  const caminhoDataset = process.argv[2];
  const inicio = performance.now();

  const encontros = [];
  for await (const [timestamp, posicoes] of lerPosicoesPorTimestamp(caminhoDataset)) {
    encontros.push(...detectarEncontros(timestamp, posicoes));
  }

  const caminhoSaida = path.join('respostas', `${path.parse(caminhoDataset).name}.json`);
  fs.writeFileSync(caminhoSaida, JSON.stringify(encontros, null, 2));

  console.log(`${encontros.length} encontros em ${(performance.now() - inicio).toFixed(1)} ms: ${caminhoSaida}`);
}

executar();
