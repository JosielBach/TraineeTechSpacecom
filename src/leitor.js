const fs = require('fs');

const QUEBRA_LINHA = 10;
const RETORNO_CARRO = 13;
const ASPAS = 34;
const VIRGULA = 44;
const MENOS = 45;
const PONTO = 46;
const ZERO = 48;
const NOVE = 57;
const PONTO_E_VIRGULA = 59;
const TAMANHO_PEDACO = 1024 * 1024;

async function* lerPedacos(caminhoArquivo) {
  yield* fs.createReadStream(caminhoArquivo, { highWaterMark: TAMANHO_PEDACO });
  yield Buffer.from([QUEBRA_LINHA]);
}

function procurarByte(dados, byte, inicio) {
  for (let i = inicio; i < dados.length; i++) {
    if (dados[i] === byte) return i;
  }
  return -1;
}

function lerTexto(dados, inicio, fim) {
  if (inicio === fim) return '';
  if (dados[inicio] === ASPAS) return dados.toString('latin1', inicio + 1, fim - 1);
  return dados.toString('latin1', inicio, fim);
}

function ehMesmoTexto(texto, dados, inicio, fim) {
  if (dados[inicio] === ASPAS) {
    inicio++;
    fim--;
  }
  if (texto === null || texto.length !== fim - inicio) return false;

  for (let i = 0; i < texto.length; i++) {
    if (texto.charCodeAt(i) !== dados[inicio + i]) return false;
  }
  return true;
}

function lerInteiro(dados, inicio, fim) {
  let valor = 0;
  for (let i = inicio; i < fim; i++) valor = valor * 10 + dados[i] - ZERO;
  return valor;
}

function lerDecimal(dados, inicio, fim) {
  const negativo = dados[inicio] === MENOS;
  let digitos = 0;
  let casasDecimais = 0;
  let depoisDoPonto = false;

  for (let i = negativo ? inicio + 1 : inicio; i < fim; i++) {
    if (dados[i] === PONTO) {
      depoisDoPonto = true;
    } else {
      digitos = digitos * 10 + dados[i] - ZERO;
      if (depoisDoPonto) casasDecimais++;
    }
  }

  const valor = digitos / 10 ** casasDecimais;
  return negativo ? -valor : valor;
}

function lerIds(dados, inicio, fim) {
  const ids = [];
  let id = 0;
  let temDigito = false;

  for (let i = inicio; i < fim; i++) {
    if (dados[i] >= ZERO && dados[i] <= NOVE) {
      id = id * 10 + dados[i] - ZERO;
      temDigito = true;
    } else if (dados[i] === VIRGULA) {
      ids.push(id);
      id = 0;
      temDigito = false;
    }
  }
  if (temDigito) ids.push(id);

  return ids;
}

function processarLinhas(dados, estado, gruposCompletos) {
  let inicioLinha = 0;
  let fimLinha = procurarByte(dados, QUEBRA_LINHA, 0);

  while (fimLinha !== -1) {
    const fimConteudo = dados[fimLinha - 1] === RETORNO_CARRO ? fimLinha - 1 : fimLinha;

    if (estado.ehCabecalho) {
      estado.ehCabecalho = false;
    } else if (fimConteudo > inicioLinha) {
      const fimId = procurarByte(dados, PONTO_E_VIRGULA, inicioLinha);
      const fimFaccao = procurarByte(dados, PONTO_E_VIRGULA, fimId + 1);
      const fimTimestamp = procurarByte(dados, PONTO_E_VIRGULA, fimFaccao + 1);
      const fimLatitude = procurarByte(dados, PONTO_E_VIRGULA, fimTimestamp + 1);
      const fimLongitude = procurarByte(dados, PONTO_E_VIRGULA, fimLatitude + 1);
      const fimMedidaProtetiva = procurarByte(dados, PONTO_E_VIRGULA, fimLongitude + 1);

      if (!ehMesmoTexto(estado.timestampAtual, dados, fimFaccao + 1, fimTimestamp)) {
        if (estado.timestampAtual !== null) gruposCompletos.push([estado.timestampAtual, estado.posicoesDoTimestamp]);
        estado.timestampAtual = lerTexto(dados, fimFaccao + 1, fimTimestamp);
        estado.posicoesDoTimestamp = [];
      }

      estado.posicoesDoTimestamp.push({
        id: lerInteiro(dados, inicioLinha, fimId),
        faccao: lerTexto(dados, fimId + 1, fimFaccao),
        latitude: lerDecimal(dados, fimTimestamp + 1, fimLatitude),
        longitude: lerDecimal(dados, fimLatitude + 1, fimLongitude),
        idsAgressores: lerIds(dados, fimMedidaProtetiva + 1, fimConteudo),
      });
    }

    inicioLinha = fimLinha + 1;
    fimLinha = procurarByte(dados, QUEBRA_LINHA, inicioLinha);
  }

  return inicioLinha;
}

async function* lerPosicoesPorTimestamp(caminhoArquivo) {
  const estado = { ehCabecalho: true, timestampAtual: null, posicoesDoTimestamp: [] };
  let resto = Buffer.alloc(0);

  for await (const pedaco of lerPedacos(caminhoArquivo)) {
    const dados = resto.length > 0 ? Buffer.concat([resto, pedaco]) : pedaco;
    const gruposCompletos = [];
    const inicioResto = processarLinhas(dados, estado, gruposCompletos);

    yield* gruposCompletos;
    resto = dados.subarray(inicioResto);
  }

  if (estado.timestampAtual !== null) yield [estado.timestampAtual, estado.posicoesDoTimestamp];
}

module.exports = { lerPosicoesPorTimestamp };
