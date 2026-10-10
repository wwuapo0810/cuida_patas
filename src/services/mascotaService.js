/** Llamadas a los endpoints de /api/mascotas. */

import { apiFetch } from "./apiClient";

/**
 * GET /api/mascotas?usuarioId=... — mascotas activas del usuario.
 *
 * El usuarioId es obligatorio desde el frontend: sin él el backend devuelve las
 * mascotas de todos los usuarios, que no es lo que ninguna pantalla necesita.
 */
export function listarMascotas(usuarioId, { signal } = {}) {
  return apiFetch(`/api/mascotas?usuarioId=${encodeURIComponent(usuarioId)}`, { signal });
}

/** GET /api/mascotas/{id} — una mascota del usuario autenticado. */
export function obtenerMascota(mascotaId, { signal } = {}) {
  return apiFetch(`/api/mascotas/${encodeURIComponent(mascotaId)}`, { signal });
}
