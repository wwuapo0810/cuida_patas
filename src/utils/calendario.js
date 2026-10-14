/**
 * Cálculos de la vista de calendario mensual. Todo se maneja con claves
 * "AAAA-MM-DD" en hora local, igual que las fechas que manda el backend.
 */

const NOMBRE_MES = new Intl.DateTimeFormat("es-CR", { month: "long", year: "numeric" });
const MES_CORTO = new Intl.DateTimeFormat("es-CR", { month: "short" });
const HORA = new Intl.DateTimeFormat("es-CR", { hour: "numeric", minute: "2-digit" });

/** Date -> "2026-10-14" (sin pasar por UTC, que correría el día). */
export function claveFecha(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** Clave de hoy, para resaltar el día actual y separar citas pasadas de futuras. */
export function claveHoy() {
  return claveFecha(new Date());
}

/** "octubre de 2026" -> "Octubre 2026". */
export function nombreDelMes(anio, mes) {
  const texto = NOMBRE_MES.format(new Date(anio, mes, 1)).replace(" de ", " ");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Las 6 semanas que se dibujan para un mes, empezando en lunes. Incluye los días
 * del mes anterior y del siguiente que completan la grilla (marcados 'fuera').
 */
export function construirMes(anio, mes) {
  const primero = new Date(anio, mes, 1);
  // getDay(): 0 = domingo. Se corre para que la semana empiece en lunes.
  const desfase = (primero.getDay() + 6) % 7;
  const inicio = new Date(anio, mes, 1 - desfase);

  return Array.from({ length: 42 }, (_, indice) => {
    const fecha = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + indice);
    return {
      clave: claveFecha(fecha),
      dia: fecha.getDate(),
      fuera: fecha.getMonth() !== mes,
    };
  });
}

/**
 * Separa un LocalDateTime del backend ("2026-10-17T10:30:00") en sus partes, sin
 * convertir de zona horaria: la hora que se guardó es la que se muestra.
 */
export function partesFechaHora(fechaHoraIso) {
  const [fecha, hora = "00:00"] = String(fechaHoraIso).split("T");
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const [horas, minutos] = hora.split(":").map(Number);
  const local = new Date(anio, mes - 1, dia, horas, minutos);

  return {
    clave: fecha,
    dia: String(dia).padStart(2, "0"),
    mesCorto: MES_CORTO.format(local).replace(".", "").toUpperCase(),
    hora: HORA.format(local),
  };
}
