import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "./AuthContext";

/**
 * Envuelve las pantallas que exigen sesión. Sin sesión redirige a /login.
 *
 * Guarda la ruta que se intentaba abrir en el state de la navegación, para
 * devolver al usuario ahí después de iniciar sesión en vez de mandarlo siempre
 * a la misma pantalla.
 */
export default function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  // Mientras se valida el token guardado no se puede decidir: redirigir acá
  // expulsaría a un usuario con sesión válida cada vez que recarga la página.
  if (cargando) {
    return <PantallaCargando />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ destino: location.pathname }} />;
  }

  return children;
}

function PantallaCargando() {
  return (
    <main className="pantalla-cargando">
      <span className="spinner" aria-hidden="true" />
      <p>Verificando tu sesión…</p>
    </main>
  );
}
