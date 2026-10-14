/**
 * Llamadas a /api/citas. El backend filtra por el usuario del token, así que no
 * hace falta mandar ningún id de usuario.
 */

import { apiFetch } from "./apiClient";

/** GET /api/citas — todas las citas de las mascotas del usuario. */
export function listarCitas({ signal } = {}) {
  return apiFetch("/api/citas", { signal });
}

/**
 * POST /api/citas.
 * @param {{mascotaId, servicioId?, fechaHora, veterinario?, lugar?, motivo?}} datos
 *        fechaHora en formato "2026-10-20T15:30" (hora local, sin zona).
 */
export function crearCita(datos) {
  return apiFetch("/api/citas", { method: "POST", body: datos });
}
