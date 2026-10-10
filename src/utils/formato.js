/**
 * Formateo de los datos que vienen de la API al texto que ya mostraba el
 * prototipo ("28 jul 2026", "3 años", "28 kg").
 */

const FORMATO_FECHA = new Intl.DateTimeFormat("es-CR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * "2026-07-28" -> "28 jul 2026".
 * @param {string | null | undefined} fechaIso fecha ISO que manda el backend (LocalDate)
 */
export function formatearFecha(fechaIso) {
  if (!fechaIso) return "—";

  const fecha = parsearFecha(fechaIso);
  if (!fecha) return "—";

  // Intl agrega un punto en algunos meses ("jul." / "ago."): se quita para que
  // quede igual que en el diseño original.
  return FORMATO_FECHA.format(fecha).replace(/\./g, "");
}

/**
 * Días desde hoy hasta la fecha dada. Negativo si ya pasó.
 * Se compara a medianoche para que "faltan 0 días" signifique "es hoy".
 */
export function diasHasta(fechaIso) {
  const fecha = parsearFecha(fechaIso);
  if (!fecha) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fecha.setHours(0, 0, 0, 0);

  return Math.round((fecha - hoy) / 86_400_000);
}

/** Edad en años/meses a partir de la fecha de nacimiento. */
export function calcularEdad(fechaNacimientoIso) {
  const nacimiento = parsearFecha(fechaNacimientoIso);
  if (!nacimiento) return null;

  const hoy = new Date();
  let meses =
    (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth());

  // Si todavía no llegó el día del mes, ese mes no se cumplió.
  if (hoy.getDate() < nacimiento.getDate()) {
    meses -= 1;
  }

  if (meses < 0) return null;
  if (meses < 12) {
    return meses === 1 ? "1 mes" : `${meses} meses`;
  }

  const anios = Math.floor(meses / 12);
  return anios === 1 ? "1 año" : `${anios} años`;
}

/** 28.00 -> "28 kg"; 5.50 -> "5.5 kg". El backend manda BigDecimal como string. */
export function formatearPeso(peso) {
  if (peso === null || peso === undefined || peso === "") return null;

  const numero = Number(peso);
  if (Number.isNaN(numero)) return null;

  return `${numero} kg`;
}

/** Los enums del backend llegan en MAYUSCULA_CON_GUIONES. */
export function formatearEnum(valor) {
  if (!valor) return "—";

  const texto = valor.replaceAll("_", " ").toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Las fechas LocalDate llegan como "2026-07-28". Construirlas con
 * new Date("2026-07-28") las interpreta en UTC y en Costa Rica (UTC-6) la fecha
 * se corre un día hacia atrás, así que se arman por componentes.
 */
function parsearFecha(fechaIso) {
  if (!fechaIso) return null;

  const partes = String(fechaIso).slice(0, 10).split("-").map(Number);
  if (partes.length !== 3 || partes.some(Number.isNaN)) return null;

  const [anio, mes, dia] = partes;
  return new Date(anio, mes - 1, dia);
}
