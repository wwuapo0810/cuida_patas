import { useCallback, useState } from "react";

/**
 * Estado de envío de un formulario contra la API: si se está enviando, el
 * mensaje de error general y los errores por campo que devuelve @Valid.
 *
 * @returns {{enviando, error, erroresCampo, enviar, fallar}}
 *   enviar(accion)  ejecuta la petición; devuelve su resultado, o undefined si falló
 *   fallar(mensaje) muestra un error de validación propio sin llamar a la API
 */
export function useEnvioFormulario() {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [erroresCampo, setErroresCampo] = useState({});

  const enviar = useCallback(async (accion) => {
    setEnviando(true);
    setError(null);
    setErroresCampo({});

    try {
      return await accion();
    } catch (errorApi) {
      setError(errorApi.message);
      setErroresCampo(errorApi.campos ?? {});
      return undefined;
    } finally {
      setEnviando(false);
    }
  }, []);

  const fallar = useCallback((mensaje, campos = {}) => {
    setError(mensaje);
    setErroresCampo(campos);
  }, []);

  return { enviando, error, erroresCampo, enviar, fallar };
}
