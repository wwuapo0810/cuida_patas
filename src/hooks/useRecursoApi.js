import { useCallback, useEffect, useState } from "react";

/**
 * Carga datos de la API manejando los tres estados (cargando / error / listo),
 * para que las pantallas no repitan el mismo useEffect con try/catch.
 *
 * @param {(opciones: {signal: AbortSignal}) => Promise<any>} cargar
 *        función que hace la petición. Debe estar memorizada con useCallback, o
 *        el efecto se dispararía en cada render.
 * @param {{activo?: boolean}} [opciones]
 *        activo en false deja la carga en pausa (por ejemplo mientras todavía no
 *        se sabe el id del usuario).
 *
 * @returns {{datos: any, cargando: boolean, error: Error|null, recargar: () => void}}
 */
export function useRecursoApi(cargar, { activo = true } = {}) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(activo);
  const [error, setError] = useState(null);
  // Cambiar este número vuelve a disparar el efecto: es el botón "Reintentar".
  const [intento, setIntento] = useState(0);

  const recargar = useCallback(() => setIntento((valor) => valor + 1), []);

  useEffect(() => {
    if (!activo) {
      setCargando(false);
      return undefined;
    }

    const controlador = new AbortController();
    let vigente = true;

    setCargando(true);
    setError(null);

    cargar({ signal: controlador.signal })
      .then((resultado) => {
        if (vigente) setDatos(resultado);
      })
      .catch((errorApi) => {
        // AbortError solo significa que el componente se desmontó.
        if (!vigente || errorApi.name === "AbortError") return;
        setError(errorApi);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, [cargar, activo, intento]);

  return { datos, cargando, error, recargar };
}
