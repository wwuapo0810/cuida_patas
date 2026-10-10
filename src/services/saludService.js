/**
 * Llamadas a los endpoints de salud de una mascota.
 *
 * Los tres listados vienen del backend con el campo 'estado' ya calculado
 * (AL_DIA / POR_VENCER / VENCIDO / SIN_FECHA), así que el frontend no repite
 * esa lógica: solo la traduce a texto y color (ver utils/salud.js).
 */

import { apiFetch } from "./apiClient";

export function listarVacunas(mascotaId, { signal } = {}) {
  return apiFetch(`/api/mascotas/${encodeURIComponent(mascotaId)}/vacunas`, { signal });
}

export function listarDesparasitaciones(mascotaId, { signal } = {}) {
  return apiFetch(`/api/mascotas/${encodeURIComponent(mascotaId)}/desparasitaciones`, { signal });
}

export function listarMedicamentos(mascotaId, { signal } = {}) {
  return apiFetch(`/api/mascotas/${encodeURIComponent(mascotaId)}/medicamentos`, { signal });
}

/**
 * Trae los tres listados de una mascota en paralelo.
 *
 * Se usa Promise.all y no tres esperas seguidas porque las peticiones son
 * independientes: con 2 mascotas serían 6 llamadas, en serie se notaría.
 */
export async function listarSaludDeMascota(mascotaId, { signal } = {}) {
  const [vacunas, desparasitaciones, medicamentos] = await Promise.all([
    listarVacunas(mascotaId, { signal }),
    listarDesparasitaciones(mascotaId, { signal }),
    listarMedicamentos(mascotaId, { signal }),
  ]);

  return { vacunas, desparasitaciones, medicamentos };
}
