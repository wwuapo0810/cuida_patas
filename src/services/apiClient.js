/**
 * Cliente HTTP único de la aplicación.
 *
 * Todo lo que hable con el backend pasa por acá, para que el token, la URL base
 * y el formato de error se resuelvan en un solo lugar.
 */

import { borrarSesion, leerToken } from "./sesionStorage";

/**
 * URL del backend. Se configura con VITE_API_URL en el archivo .env.
 * El valor por defecto es el puerto que expone docker-compose en local.
 */
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/+$/, "");

/** Error con el código HTTP y el mensaje que devolvió el backend. */
export class ApiError extends Error {
  constructor(status, message, campos = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    /** Errores por campo de @Valid, p. ej. { correo: "no tiene un formato válido" }. */
    this.campos = campos;
  }

  /** true si el problema es de sesión (token ausente, vencido o inválido). */
  get esNoAutorizado() {
    return this.status === 401;
  }
}

/*
 * Cuando el backend responde 401, el token dejó de servir. En vez de que cada
 * pantalla lo maneje, el cliente avisa acá y el AuthContext se suscribe para
 * cerrar la sesión y redirigir a /login.
 */
const suscriptoresSesionExpirada = new Set();

export function alExpirarSesion(callback) {
  suscriptoresSesionExpirada.add(callback);
  return () => suscriptoresSesionExpirada.delete(callback);
}

/**
 * Hace una petición a la API.
 *
 * @param {string} ruta         ruta relativa, p. ej. "/api/mascotas"
 * @param {object} [opciones]
 * @param {string} [opciones.method]    GET por defecto
 * @param {object} [opciones.body]      se serializa a JSON
 * @param {boolean} [opciones.publico]  true en registro/login, que no llevan token
 * @param {AbortSignal} [opciones.signal]  para cancelar si el componente se desmonta
 * @returns {Promise<any>} el JSON de la respuesta, o null si no tiene cuerpo
 * @throws {ApiError}
 */
export async function apiFetch(ruta, { method = "GET", body, publico = false, signal } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (!publico) {
    const token = leerToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    // Cancelación voluntaria: se re-lanza para que quien llamó la ignore.
    if (error.name === "AbortError") throw error;
    // Backend caído, CORS mal configurado o sin red: fetch no da código HTTP.
    throw new ApiError(
      0,
      "No se pudo conectar con el servidor. Verificá que el backend esté corriendo.",
    );
  }

  if (respuesta.status === 204) {
    return null;
  }

  const datos = await leerCuerpo(respuesta);

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      borrarSesion();
      suscriptoresSesionExpirada.forEach((callback) => callback());
    }
    throw new ApiError(
      respuesta.status,
      datos?.message ?? `Error ${respuesta.status} al llamar a la API`,
      datos?.campos ?? {},
    );
  }

  return datos;
}

/** Lee el JSON tolerando respuestas vacías o que no sean JSON (una página de error, por ejemplo). */
async function leerCuerpo(respuesta) {
  const texto = await respuesta.text();
  if (!texto) return null;

  try {
    return JSON.parse(texto);
  } catch {
    return { message: texto };
  }
}
