const fs = require('fs');

function lerPosicoesPorTimestamp(caminhoArquivo) {
  const linhas = fs.readFileSync(caminhoArquivo, 'utf8').split(/\r?\n/);
  const posicoesPorTimestamp = new Map();

  for (let indiceLinha = 1; indiceLinha < linhas.length; indiceLinha++) {
    if (linhas[indiceLinha] === '') continue;

    const [id, faccao, timestampComAspas, latitude, longitude, medidaProtetiva, idsRestricao] =
      linhas[indiceLinha].split(';');
    const posicao = {
      id: Number(id),
      faccao,
      latitude: Number(latitude),
      longitude: Number(longitude),
      ehVitima: medidaProtetiva === 'true',
      idsAgressores: idsRestricao ? idsRestricao.replaceAll('"', '').split(',').map(Number) : [],
    };

    const timestamp = timestampComAspas.replaceAll('"', '');
    const posicoesDoTimestamp = posicoesPorTimestamp.get(timestamp);
    if (posicoesDoTimestamp) posicoesDoTimestamp.push(posicao);
    else posicoesPorTimestamp.set(timestamp, [posicao]);
  }

  return posicoesPorTimestamp;
}

module.exports = { lerPosicoesPorTimestamp };
