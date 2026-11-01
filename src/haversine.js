const RAIO_TERRA_METROS = 6371000;

function calcularDistanciaEmMetros(latitude1, longitude1, latitude2, longitude2) {
  const latitude1Radianos = latitude1 * Math.PI / 180;
  const latitude2Radianos = latitude2 * Math.PI / 180;
  const diferencaLatitude = (latitude2 - latitude1) * Math.PI / 180;
  const diferencaLongitude = (longitude2 - longitude1) * Math.PI / 180;

  const senoMeiaLatitude = Math.sin(diferencaLatitude / 2);
  const senoMeiaLongitude = Math.sin(diferencaLongitude / 2);
  const termoHaversine =
    senoMeiaLatitude * senoMeiaLatitude +
    Math.cos(latitude1Radianos) * Math.cos(latitude2Radianos) * senoMeiaLongitude * senoMeiaLongitude;

  return 2 * RAIO_TERRA_METROS * Math.asin(Math.sqrt(termoHaversine));
}

module.exports = { calcularDistanciaEmMetros };
