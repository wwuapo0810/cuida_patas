/** Llamadas a los endpoints de /api/auth. */

import { apiFetch } from "./apiClient";

/**
 * POST /api/auth/registro — crea la cuenta y devuelve token + usuario.
 * Es público: no lleva token.
 */
export function registrar({ nombre, correo, contrasena, telefono }) {
  return apiFetch("/api/auth/registro", {
    method: "POST",
    publico: true,
    body: { nombre, correo, contrasena, telefono: telefono || null },
  });
}

/** POST /api/auth/login — valida credenciales y devuelve token + usuario. */
export function iniciarSesion({ correo, contrasena }) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    publico: true,
    body: { correo, contrasena },
  });
}

/**
 * GET /api/auth/yo — datos del usuario del token.
 * Sirve para comprobar al recargar la página que el token guardado sigue válido.
 */
export function obtenerUsuarioActual({ signal } = {}) {
  return apiFetch("/api/auth/yo", { signal });
}
