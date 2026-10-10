/**
 * Traduce los datos de salud del backend a lo que muestran las tablas.
 *
 * El estado (AL_DIA / POR_VENCER / VENCIDO / SIN_FECHA) lo calcula el backend en
 * EstadoSaludService; acá solo se le pone texto y color para no tener dos
 * implementaciones de la misma regla que puedan quedar desalineadas.
 */

import { diasHasta, formatearEnum } from "./formato";

/** Clases de color de los badges, tal como ya existen en styles.css. */
const TONOS = {
  AL_DIA: "good",
  POR_VENCER: "warning",
  VENCIDO: "danger",
  SIN_FECHA: "neutral",
};

/**
 * Etiqueta y color del badge de estado.
 *
 * Para POR_VENCER se muestran los días restantes ("Vence en 7 días"), igual que
 * en el diseño del prototipo.
 */
export function describirEstado(estado, fechaReferencia) {
  const tono = TONOS[estado] ?? "neutral";

  if (estado === "POR_VENCER") {
    const dias = diasHasta(fechaReferencia);
    if (dias === 0) return { etiqueta: "Vence hoy", tono };
    if (dias === 1) return { etiqueta: "Vence mañana", tono };
    if (dias !== null) return { etiqueta: `Vence en ${dias} días`, tono };
  }

  const etiquetas = {
    AL_DIA: "Al día",
    VENCIDO: "Vencido",
    SIN_FECHA: "Sin próxima fecha",
  };

  return { etiqueta: etiquetas[estado] ?? formatearEnum(estado), tono };
}

/**
 * Color del avatar de cada mascota.
 *
 * El prototipo le daba un color fijo a cada mascota de ejemplo. Con datos reales
 * se reparte la misma paleta de forma estable por posición en el listado, así
 * una mascota conserva su color entre recargas.
 */
const PALETA = ["orange", "teal"];

export function tonoDeMascota(indice) {
  return PALETA[indice % PALETA.length];
}

/**
 * Unifica vacunas y desparasitaciones en las filas de la tabla
 * "Vacunas y desparasitación", que comparten columnas pero vienen de endpoints
 * y DTOs distintos.
 *
 * @returns filas con forma común, ordenadas por próxima fecha (lo más urgente arriba)
 */
export function construirFilasSalud(mascotas) {
  const filas = [];

  mascotas.forEach(({ mascota, tono, salud }) => {
    salud.vacunas.forEach((vacuna) => {
      filas.push({
        id: `vacuna-${vacuna.id}`,
        categoria: "Vacunas",
        mascotaId: mascota.id,
        mascotaNombre: mascota.nombre,
        tono,
        tipo: `Vacuna ${vacuna.nombre}`,
        fecha: vacuna.fechaAplicacion,
        proximaFecha: vacuna.proximaFecha,
        estado: vacuna.estado,
      });
    });

    salud.desparasitaciones.forEach((item) => {
      filas.push({
        id: `desparasitacion-${item.id}`,
        categoria: "Desparasitación",
        mascotaId: mascota.id,
        mascotaNombre: mascota.nombre,
        tono,
        // El tipo es INTERNA / EXTERNA; el producto es opcional.
        tipo: `Desparasitación ${formatearEnum(item.tipo).toLowerCase()}`,
        detalle: item.producto,
        fecha: item.fecha,
        proximaFecha: item.proximaFecha,
        estado: item.estado,
      });
    });
  });

  return filas.sort(porProximaFecha);
}

/** Filas de la tabla de medicamentos. */
export function construirFilasMedicamentos(mascotas) {
  const filas = [];

  mascotas.forEach(({ mascota, tono, salud }) => {
    salud.medicamentos.forEach((medicamento) => {
      filas.push({
        id: `medicamento-${medicamento.id}`,
        mascotaId: mascota.id,
        mascotaNombre: mascota.nombre,
        tono,
        nombre: medicamento.nombre,
        dosis: medicamento.dosis,
        frecuenciaHoras: medicamento.frecuenciaHoras,
        fechaFin: medicamento.fechaFin,
        estado: medicamento.estado,
      });
    });
  });

  return filas.sort((a, b) => porProximaFecha(
    { proximaFecha: a.fechaFin },
    { proximaFecha: b.fechaFin },
  ));
}

/** "Cada 24 horas" -> "1 vez al día", que es como lo mostraba el prototipo. */
export function describirFrecuencia(frecuenciaHoras) {
  if (!frecuenciaHoras) return "—";
  if (frecuenciaHoras === 24) return "1 vez al día";
  if (frecuenciaHoras < 24) return `Cada ${frecuenciaHoras} horas`;

  const dias = frecuenciaHoras / 24;
  if (Number.isInteger(dias)) return `Cada ${dias} días`;

  return `Cada ${frecuenciaHoras} horas`;
}

/** Cuenta los registros por estado para las tarjetas de resumen. */
export function resumirEstados(filasSalud, filasMedicamentos) {
  const todas = [...filasSalud, ...filasMedicamentos];

  return {
    alDia: todas.filter((fila) => fila.estado === "AL_DIA").length,
    porVencer: todas.filter((fila) => fila.estado === "POR_VENCER").length,
    vencidos: todas.filter((fila) => fila.estado === "VENCIDO").length,
    // "Activo" = todavía no venció. SIN_FECHA cuenta como activo: es un
    // tratamiento sin fecha de fin definida.
    medicamentosActivos: filasMedicamentos.filter((fila) => fila.estado !== "VENCIDO").length,
  };
}

/** Los registros sin próxima fecha van al final, no al principio. */
function porProximaFecha(a, b) {
  if (!a.proximaFecha) return 1;
  if (!b.proximaFecha) return -1;
  return a.proximaFecha.localeCompare(b.proximaFecha);
}
