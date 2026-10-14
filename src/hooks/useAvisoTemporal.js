import { useEffect, useState } from "react";

/**
 * Mensaje de confirmación que se borra solo ("Registro guardado", etc.).
 * @returns {[string|null, (mensaje: string|null) => void]}
 */
export function useAvisoTemporal(duracionMs = 4000) {
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    if (!mensaje) return undefined;
    const temporizador = setTimeout(() => setMensaje(null), duracionMs);
    return () => clearTimeout(temporizador);
  }, [mensaje, duracionMs]);

  return [mensaje, setMensaje];
}
