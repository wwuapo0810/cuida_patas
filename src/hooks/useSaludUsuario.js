import { useCallback } from "react";

import { useAuth } from "../auth/AuthContext";
import { listarMascotas } from "../services/mascotaService";
import { listarSaludDeMascota } from "../services/saludService";
import { tonoDeMascota } from "../utils/salud";

import { useRecursoApi } from "./useRecursoApi";

/**
 * Trae las mascotas del usuario autenticado junto con sus registros de salud.
 *
 * Son dos pasos encadenados: primero las mascotas (hace falta saber los ids) y
 * después la salud de todas en paralelo.
 *
 * @returns {{datos: Array<{mascota, tono, salud}> | null, cargando, error, recargar}}
 */
export function useSaludUsuario() {
  const { usuario } = useAuth();
  const usuarioId = usuario?.id;

  const cargar = useCallback(
    async ({ signal }) => {
      const mascotas = await listarMascotas(usuarioId, { signal });

      const salud = await Promise.all(
        mascotas.map((mascota) => listarSaludDeMascota(mascota.id, { signal })),
      );

      // El tono se asigna por posición para que cada mascota conserve su color.
      return mascotas.map((mascota, indice) => ({
        mascota,
        tono: tonoDeMascota(indice),
        salud: salud[indice],
      }));
    },
    [usuarioId],
  );

  // Sin usuarioId no hay nada que pedir: puede pasar en el primer render.
  return useRecursoApi(cargar, { activo: Boolean(usuarioId) });
}
