const { calcularDistanciaEmMetros } = require('./haversine');

const DISTANCIA_LIMITE_METROS = 20;
const DIFERENCA_MAXIMA_LATITUDE_GRAUS = 0.00018;

function classificarEncontro(posicao1, posicao2) {
  if (posicao1.idsAgressores.includes(posicao2.id) || posicao2.idsAgressores.includes(posicao1.id)) return 'protetiva';
  if (posicao1.faccao && posicao1.faccao === posicao2.faccao) return 'faccao';
  return 'generico';
}

function detectarEncontros(timestamp, posicoes) {
  const encontros = [];

  for (let i = 0; i < posicoes.length; i++) {
    for (let j = i + 1; j < posicoes.length; j++) {
      const posicao1 = posicoes[i];
      const posicao2 = posicoes[j];
      if (Math.abs(posicao1.latitude - posicao2.latitude) > DIFERENCA_MAXIMA_LATITUDE_GRAUS) continue;

      const distanciaMetros = calcularDistanciaEmMetros(
        posicao1.latitude,
        posicao1.longitude,
        posicao2.latitude,
        posicao2.longitude,
      );

      if (distanciaMetros < DISTANCIA_LIMITE_METROS) {
        encontros.push({
          tipo: classificarEncontro(posicao1, posicao2),
          monitoradosEncontro: [posicao1.id, posicao2.id],
          timestamp,
          posicoes: {
            [posicao1.id]: { lat: posicao1.latitude, lon: posicao1.longitude },
            [posicao2.id]: { lat: posicao2.latitude, lon: posicao2.longitude },
          },
          distanciaMetros,
        });
      }
    }
  }

  return encontros;
}

module.exports = { detectarEncontros };
