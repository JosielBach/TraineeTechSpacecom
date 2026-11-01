const fs = require('fs');
const readline = require('readline');

async function* lerPosicoesPorTimestamp(caminhoArquivo) {
  const linhas = readline.createInterface({ input: fs.createReadStream(caminhoArquivo), crlfDelay: Infinity });
  let ehCabecalho = true;
  let timestampAtual = null;
  let posicoesDoTimestamp = [];

  for await (const linha of linhas) {
    if (ehCabecalho) {
      ehCabecalho = false;
      continue;
    }
    if (linha === '') continue;

    const [id, faccao, timestampComAspas, latitude, longitude, medidaProtetiva, idsRestricao] = linha.split(';');
    const posicao = {
      id: Number(id),
      faccao,
      latitude: Number(latitude),
      longitude: Number(longitude),
      ehVitima: medidaProtetiva === 'true',
      idsAgressores: idsRestricao ? idsRestricao.replaceAll('"', '').split(',').map(Number) : [],
    };

    const timestamp = timestampComAspas.replaceAll('"', '');
    if (timestamp !== timestampAtual) {
      if (timestampAtual !== null) yield [timestampAtual, posicoesDoTimestamp];
      timestampAtual = timestamp;
      posicoesDoTimestamp = [];
    }
    posicoesDoTimestamp.push(posicao);
  }

  if (timestampAtual !== null) yield [timestampAtual, posicoesDoTimestamp];
}

module.exports = { lerPosicoesPorTimestamp };
