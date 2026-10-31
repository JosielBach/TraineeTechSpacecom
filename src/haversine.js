const RAIO_TERRA_METROS = 6371000;
const GRAUS_PARA_RADIANOS = Math.PI / 180;

function calcularDistanciaEmMetros(latitude1, longitude1, latitude2, longitude2) {
  const latitude1Radianos = latitude1 * GRAUS_PARA_RADIANOS;
  const latitude2Radianos = latitude2 * GRAUS_PARA_RADIANOS;
  const diferencaLatitude = (latitude2 - latitude1) * GRAUS_PARA_RADIANOS;
  const diferencaLongitude = (longitude2 - longitude1) * GRAUS_PARA_RADIANOS;

  const senoMeiaLatitude = Math.sin(diferencaLatitude / 2);
  const senoMeiaLongitude = Math.sin(diferencaLongitude / 2);
  const termoHaversine =
    senoMeiaLatitude * senoMeiaLatitude +
    Math.cos(latitude1Radianos) * Math.cos(latitude2Radianos) * senoMeiaLongitude * senoMeiaLongitude;

  return 2 * RAIO_TERRA_METROS * Math.atan2(Math.sqrt(termoHaversine), Math.sqrt(1 - termoHaversine));
}

module.exports = { calcularDistanciaEmMetros };
