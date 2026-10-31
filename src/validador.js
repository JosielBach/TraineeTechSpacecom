const fs = require('fs');

function criarChave(encontro) {
  const [id1, id2] = encontro.monitoradosEncontro;
  return `${encontro.tipo}|${encontro.timestamp}|${Math.min(id1, id2)}|${Math.max(id1, id2)}`;
}

function compararEncontros(encontrosGerados, encontrosEsperados) {
  const chavesPendentes = new Set(encontrosEsperados.map(criarChave));
  const sobrando = [];
  let corretos = 0;

  for (const encontro of encontrosGerados) {
    const chave = criarChave(encontro);
    if (chavesPendentes.delete(chave)) corretos++;
    else sobrando.push(chave);
  }

  return { corretos, faltando: [...chavesPendentes], sobrando };
}

if (require.main === module) {
  const [caminhoGerado, caminhoEsperado] = process.argv.slice(2);
  const encontrosGerados = JSON.parse(fs.readFileSync(caminhoGerado, 'utf8'));
  const encontrosEsperados = JSON.parse(fs.readFileSync(caminhoEsperado, 'utf8'));

  console.log(compararEncontros(encontrosGerados, encontrosEsperados));
}

module.exports = { compararEncontros };
