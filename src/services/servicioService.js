/** Llamadas a /api/servicios (directorio de veterinarias, tiendas, etc.). */

import { apiFetch } from "./apiClient";

export function listarServicios({ signal } = {}) {
  return apiFetch("/api/servicios", { signal });
}
