/**
 * Guarda la sesión (token + datos del usuario) en localStorage.
 *
 * Está aparte del contexto de React a propósito: la capa de servicios necesita
 * leer el token para firmar las peticiones, y si lo tomara del contexto se
 * armaría una dependencia circular entre servicios y componentes.
 *
 * Todos los accesos van dentro de try/catch: en modo incógnito o con el
 * almacenamiento bloqueado, localStorage lanza excepción en vez de devolver null.
 */

const CLAVE = "cuidapatas.sesion";

/**
 * @returns {{token: string, expiraEn: number, usuario: object} | null}
 */
export function leerSesion() {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return null;

    const sesion = JSON.parse(crudo);
    if (!sesion?.token) return null;

    // Token vencido: se descarta antes de intentar usarlo.
    if (sesion.expiraEn && Date.now() >= sesion.expiraEn) {
      borrarSesion();
      return null;
    }

    return sesion;
  } catch {
    // JSON corrupto o almacenamiento inaccesible: se trata como "sin sesión".
    return null;
  }
}

export function leerToken() {
  return leerSesion()?.token ?? null;
}

/**
 * Guarda la respuesta de /api/auth/login o /api/auth/registro.
 *
 * Convierte la vigencia relativa que manda el backend (segundos) en una marca de
 * tiempo absoluta, que es lo único comparable después de recargar la página.
 */
export function guardarSesion({ token, expiraEnSegundos, usuario }) {
  const sesion = {
    token,
    expiraEn: Date.now() + expiraEnSegundos * 1000,
    usuario,
  };

  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(sesion));
  } catch {
    // Sin persistencia la sesión igual funciona, pero se pierde al recargar.
  }

  return sesion;
}

export function borrarSesion() {
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    // Nada que hacer: el estado en memoria se limpia de todas formas.
  }
}
