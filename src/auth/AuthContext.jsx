import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { alExpirarSesion } from "../services/apiClient";
import * as authService from "../services/authService";
import { borrarSesion, guardarSesion, leerSesion } from "../services/sesionStorage";

/**
 * Estado de la sesión, disponible para toda la aplicación.
 *
 * Expone:
 *   usuario     objeto del usuario autenticado, o null
 *   cargando    true mientras se valida el token guardado al abrir la app
 *   entrar      ({correo, contrasena}) => Promise
 *   registrarse ({nombre, correo, contrasena, telefono}) => Promise
 *   salir       () => void
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Se inicializa con lo que haya en localStorage para que al recargar la página
  // no se vea un parpadeo hacia /login antes de confirmar la sesión.
  const [usuario, setUsuario] = useState(() => leerSesion()?.usuario ?? null);
  const [cargando, setCargando] = useState(() => leerSesion() !== null);

  const salir = useCallback(() => {
    borrarSesion();
    setUsuario(null);
  }, []);

  /*
   * El token guardado puede haber vencido o haber sido firmado con otro secreto
   * (por ejemplo si alguien reinició el backend con otro JWT_SECRET). Se confirma
   * contra el backend antes de dar la sesión por buena.
   */
  useEffect(() => {
    if (leerSesion() === null) {
      setCargando(false);
      return;
    }

    const controlador = new AbortController();

    authService
      .obtenerUsuarioActual({ signal: controlador.signal })
      .then((usuarioActual) => setUsuario(usuarioActual))
      .catch((error) => {
        if (error.name === "AbortError") return;
        // 401: el token ya no sirve. Otro error (backend caído) también deja sin
        // sesión, porque no hay forma de verificarla.
        salir();
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });

    return () => controlador.abort();
  }, [salir]);

  /* Si cualquier petición recibe un 401, la sesión se cierra en toda la app. */
  useEffect(() => alExpirarSesion(() => setUsuario(null)), []);

  const entrar = useCallback(async (credenciales) => {
    const respuesta = await authService.iniciarSesion(credenciales);
    guardarSesion(respuesta);
    setUsuario(respuesta.usuario);
    return respuesta.usuario;
  }, []);

  const registrarse = useCallback(async (datos) => {
    const respuesta = await authService.registrar(datos);
    guardarSesion(respuesta);
    setUsuario(respuesta.usuario);
    return respuesta.usuario;
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, entrar, registrarse, salir }),
    [usuario, cargando, entrar, registrarse, salir],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (contexto === null) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return contexto;
}
