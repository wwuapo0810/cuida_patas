import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Crown,
  Edit3,
  Heart,
  Home,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  PawPrint,
  Phone,
  Pill,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "./auth/AuthContext";
import RutaProtegida from "./auth/RutaProtegida";
import { useAvisoTemporal } from "./hooks/useAvisoTemporal";
import { useEnvioFormulario } from "./hooks/useEnvioFormulario";
import { useRecursoApi } from "./hooks/useRecursoApi";
import { useSaludUsuario } from "./hooks/useSaludUsuario";
import { crearCita, listarCitas } from "./services/citaService";
import { listarMascotas, obtenerMascota } from "./services/mascotaService";
import {
  crearDesparasitacion,
  crearMedicamento,
  crearVacuna,
  listarSaludDeMascota,
} from "./services/saludService";
import { listarServicios } from "./services/servicioService";
import {
  claveFecha,
  claveHoy,
  construirMes,
  nombreDelMes,
  partesFechaHora,
} from "./utils/calendario";
import {
  calcularEdad,
  formatearEnum,
  formatearFecha,
  formatearPeso,
} from "./utils/formato";
import {
  construirFilasMedicamentos,
  construirFilasSalud,
  describirEstado,
  describirFrecuencia,
  resumirEstados,
  tonoDeMascota,
} from "./utils/salud";

const navItems = [
  { label: "Inicio", icon: Home, to: "/inicio" },
  { label: "Mis mascotas", icon: UsersRound, to: "/mascotas" },
  { label: "Salud", icon: Heart, to: "/salud" },
  { label: "Citas", icon: CalendarDays, to: "/citas" },
  { label: "Directorio", icon: MapPin, to: "/directorio" },
  { label: "Configuración", icon: Settings, to: "/configuracion" },
];

// La barra inferior del celular tiene lugar para cinco; Configuración queda en el menú ☰.
const mobileNavItems = navItems.slice(0, 5);

/*
 * Vacunas, desparasitaciones, medicamentos y citas salen del backend. El
 * arreglo de servicios del directorio sigue siendo de ejemplo: esa pantalla
 * todavía no usa GET /api/servicios.
 */
const services = [
  {
    type: "Veterinaria",
    name: "Veterinaria San Rafael",
    distance: "1.2 km",
    address: "San Rafael, San José",
    rating: "4.8",
    reviews: "126 reseñas",
    tone: "teal",
  },
  {
    type: "Guardería",
    name: "Guardería PataFeliz",
    distance: "2.4 km",
    address: "Curridabat",
    rating: "4.6",
    reviews: "58 reseñas",
    tone: "orange",
  },
  {
    type: "Veterinaria",
    name: "Clínica Vet. Los Yoses",
    distance: "3.1 km",
    address: "Los Yoses",
    rating: "4.7",
    reviews: "94 reseñas",
    tone: "teal",
  },
  {
    type: "Guardería",
    name: "Hotel Canino Huellitas",
    distance: "4.0 km",
    address: "Tres Ríos",
    rating: "4.5",
    reviews: "41 reseñas",
    tone: "orange",
  },
];

function Logo({ inverse = false }) {
  return (
    <div className={`logo ${inverse ? "logo--inverse" : ""}`}>
      <span className="logo__mark" aria-hidden="true">
        <PawPrint size={18} strokeWidth={2.5} />
      </span>
      <span>CuidaPatas</span>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <Logo inverse />
      <nav aria-label="Navegación principal">
        <p className="sidebar__group">GENERAL</p>
        {navItems.slice(0, 2).map((item) => (
          <SidebarItem key={item.label} {...item} />
        ))}
        <p className="sidebar__group">CUIDADO</p>
        {navItems.slice(2, 5).map((item) => (
          <SidebarItem key={item.label} {...item} />
        ))}
        <p className="sidebar__group">CUENTA</p>
        <SidebarItem {...navItems[5]} />
        <BotonCerrarSesion />
      </nav>
    </aside>
  );
}

/**
 * Cierra la sesión: borra el token y manda a /login.
 *
 * Usa el mismo estilo .nav-item que el resto del menú para no romper el diseño
 * de la barra lateral.
 */
function BotonCerrarSesion() {
  const { usuario, salir } = useAuth();
  const navigate = useNavigate();

  function handleSalir() {
    salir();
    navigate("/login", { replace: true });
  }

  return (
    <button className="nav-item nav-item--salir" type="button" onClick={handleSalir}>
      <LogOut size={18} />
      <span>
        Cerrar sesión
        {usuario && <small>{usuario.correo}</small>}
      </span>
    </button>
  );
}

function SidebarItem({ label, icon: Icon, to, disabled }) {
  if (disabled) {
    return (
      <span className="nav-item nav-item--disabled" aria-disabled="true">
        <Icon size={18} />
        {label}
      </span>
    );
  }

  return (
    <NavLink
      className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}
      to={to}
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

function MobileNavigation() {
  return (
    <nav className="mobile-nav" aria-label="Navegación móvil">
      {mobileNavItems.map(({ label, icon: Icon, to }) => (
        <NavLink
          key={label}
          to={to}
          className={({ isActive }) => `mobile-nav__item ${isActive ? "is-active" : ""}`}
        >
          <Icon size={20} />
          <span>{label === "Mis mascotas" ? "Mascotas" : label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-shell">
      <Sidebar />
      <header className="mobile-header">
        <Logo />
        <button
          className="icon-button"
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen && (
          <div className="mobile-menu">
            {navItems.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) => (isActive ? "is-active" : "")}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </header>
      <main key={location.pathname} className="app-main">
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
}

function PageHeading({ title, subtitle, action }) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

function PrimaryButton({ children, icon: Icon = Plus, type = "button", onClick, disabled = false }) {
  return (
    <button className="button button--primary" type={type} onClick={onClick} disabled={disabled}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

/** Error de validación devuelto por el backend para un campo concreto. */
function ErrorCampo({ mensaje }) {
  if (!mensaje) return null;
  return <small className="error-campo">{mensaje}</small>;
}

/** Confirmación verde que aparece unos segundos después de guardar algo. */
function AvisoExito({ mensaje }) {
  if (!mensaje) return null;
  return (
    <p className="aviso-exito" role="status">
      <Check size={16} /> {mensaje}
    </p>
  );
}

/**
 * Ventana modal para los formularios de alta.
 *
 * Se monta con un portal en <body>: .app-main tiene una animación con transform,
 * y eso haría que un position: fixed quede atrapado dentro del contenido.
 */
function Modal({ titulo, subtitulo, onCerrar, children }) {
  useEffect(() => {
    function alPresionarTecla(event) {
      if (event.key === "Escape") onCerrar();
    }

    // Mientras el modal está abierto la página de fondo no debe desplazarse.
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", alPresionarTecla);

    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, [onCerrar]);

  return createPortal(
    <div
      className="modal-fondo"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCerrar();
      }}
    >
      <section className="modal panel" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <header className="modal__header">
          <div>
            <h2 id="modal-titulo">{titulo}</h2>
            {subtitulo && <p>{subtitulo}</p>}
          </div>
          <button className="icon-button" type="button" aria-label="Cerrar" onClick={onCerrar}>
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}

/** Etiqueta + control + error de un formulario. 'ancho' ocupa las dos columnas. */
function Campo({ etiqueta, opcional = false, error, ancho = false, children }) {
  return (
    <label className={`campo ${ancho ? "campo--ancho" : ""}`}>
      <span>
        {etiqueta}
        {opcional && <span className="label-opcional"> (opcional)</span>}
      </span>
      {children}
      <ErrorCampo mensaje={error} />
    </label>
  );
}

/** Error general y botones Cancelar / Guardar, al pie de cada formulario modal. */
function PieFormulario({ error, enviando, textoGuardar, onCancelar }) {
  return (
    <>
      {error && (
        <p className="form-error" role="alert">
          <CircleAlert size={16} /> {error}
        </p>
      )}
      <div className="modal__acciones">
        <button className="button button--outline" type="button" onClick={onCancelar}>
          Cancelar
        </button>
        <PrimaryButton type="submit" icon={Check} disabled={enviando}>
          {enviando ? "Guardando…" : textoGuardar}
        </PrimaryButton>
      </div>
    </>
  );
}

/** Convierte un FormData en objeto, con los campos vacíos como null. */
function leerFormulario(formulario) {
  return Object.fromEntries(
    [...new FormData(formulario)].map(([clave, valor]) => {
      const texto = String(valor).trim();
      return [clave, texto === "" ? null : texto];
    }),
  );
}

/**
 * Pantalla de acceso. Mismo diseño del prototipo; lo que cambia es que ahora los
 * dos formularios hablan con /api/auth/login y /api/auth/registro.
 */
function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, entrar, registrarse } = useAuth();

  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [erroresCampo, setErroresCampo] = useState({});

  /*
   * Si RutaProtegida redirigió hasta acá, vuelve a la pantalla que se quería
   * abrir. Si no, la primera pantalla de la aplicación es Inicio.
   */
  const destino = location.state?.destino ?? "/inicio";

  // Cubre dos casos: recién inició sesión, o ya tenía sesión y abrió /login a mano.
  useEffect(() => {
    if (usuario) {
      navigate(destino, { replace: true });
    }
  }, [usuario, destino, navigate]);

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo);
    setError(null);
    setErroresCampo({});
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setErroresCampo({});
    setEnviando(true);

    const datos = Object.fromEntries(new FormData(event.currentTarget));

    try {
      if (modo === "login") {
        await entrar({ correo: datos.correo, contrasena: datos.contrasena });
      } else {
        await registrarse({
          nombre: datos.nombre,
          correo: datos.correo,
          contrasena: datos.contrasena,
          telefono: datos.telefono,
        });
      }
      // La redirección la hace el useEffect de arriba al cambiar 'usuario'.
    } catch (errorApi) {
      setError(errorApi.message);
      setErroresCampo(errorApi.campos ?? {});
    } finally {
      setEnviando(false);
    }
  }

  const esRegistro = modo === "registro";

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Logo inverse />
        <div className="auth-story__copy">
          <span className="eyebrow">• Vacuna al día</span>
          <h1>El cuidado de tu mascota, siempre a una pata de distancia.</h1>
          <p>
            Centraliza vacunas, citas veterinarias y recordatorios de tus mascotas en un
            solo lugar, sin depender de la memoria.
          </p>
        </div>
        <div className="auth-story__footer">
          <div className="auth-stats" aria-label="Beneficios de CuidaPatas">
            <div><strong>+3</strong><span>Registros por mascota</span></div>
            <div><strong>0</strong><span>Instalaciones necesarias</span></div>
            <div><strong>24/7</strong><span>Recordatorios activos</span></div>
          </div>
          <blockquote>
            <span className="avatar" aria-hidden="true" />
            <div>
              “Ya no se me olvida la desparasitación de Max. La notificación me llega justo
              a tiempo.”
              <cite>María Fernández — Propietaria de Max y Luna</cite>
            </div>
          </blockquote>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="segmented segmented--wide" aria-label="Acceso">
            <button
              className={esRegistro ? "" : "is-selected"}
              type="button"
              onClick={() => cambiarModo("login")}
            >
              Iniciar sesión
            </button>
            <button
              className={esRegistro ? "is-selected" : ""}
              type="button"
              onClick={() => cambiarModo("registro")}
            >
              Crear cuenta
            </button>
          </div>
          <div className="auth-form__heading">
            <h2>{esRegistro ? "Creá tu cuenta" : "Bienvenido de nuevo"}</h2>
            <p>
              {esRegistro
                ? "Registrate para llevar el control de salud de tus mascotas."
                : "Ingresá tus datos para ver el estado de tus mascotas."}
            </p>
          </div>

          {/* key: fuerza a React a recrear el formulario al cambiar de modo, así no
              arrastra lo que el usuario ya había escrito en la otra pestaña. */}
          <form className="auth-form" key={modo} onSubmit={handleSubmit}>
            {esRegistro && (
              <label>
                Nombre completo
                <span className="input-with-icon">
                  <UsersRound size={17} />
                  <input
                    type="text"
                    name="nombre"
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder="María Fernández"
                  />
                </span>
                <ErrorCampo mensaje={erroresCampo.nombre} />
              </label>
            )}

            <label>
              Correo electrónico
              <span className="input-with-icon">
                <Mail size={17} />
                <input
                  type="email"
                  name="correo"
                  required
                  maxLength={160}
                  autoComplete="email"
                  placeholder="tucorreo@ejemplo.com"
                />
              </span>
              <ErrorCampo mensaje={erroresCampo.correo} />
            </label>

            <label>
              Contraseña
              <span className="input-with-icon">
                <LockKeyhole size={17} />
                <input
                  type="password"
                  name="contrasena"
                  required
                  /* El backend exige 8 como mínimo: validarlo también acá evita un
                     viaje al servidor para un error evitable. */
                  minLength={esRegistro ? 8 : undefined}
                  maxLength={72}
                  autoComplete={esRegistro ? "new-password" : "current-password"}
                  placeholder={esRegistro ? "Mínimo 8 caracteres" : "••••••••"}
                />
              </span>
              <ErrorCampo mensaje={erroresCampo.contrasena} />
            </label>

            {esRegistro && (
              <label>
                Teléfono <span className="label-opcional">(opcional)</span>
                <span className="input-with-icon">
                  <Phone size={17} />
                  <input
                    type="tel"
                    name="telefono"
                    maxLength={30}
                    autoComplete="tel"
                    placeholder="8888-8888"
                  />
                </span>
                <ErrorCampo mensaje={erroresCampo.telefono} />
              </label>
            )}

            {!esRegistro && (
              <div className="auth-options">
                <label className="check-label">
                  <input type="checkbox" defaultChecked />
                  Recordarme
                </label>
                <button className="link-button" type="button" aria-disabled="true">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {error && (
              <p className="form-error" role="alert">
                <CircleAlert size={16} /> {error}
              </p>
            )}

            <PrimaryButton type="submit" icon={null} disabled={enviando}>
              {enviando
                ? "Enviando…"
                : esRegistro
                  ? "Crear cuenta"
                  : "Iniciar sesión"}
            </PrimaryButton>
          </form>

          {/* Login social: queda como en el prototipo, sin implementar todavía. */}
          <div className="divider"><span>o continúa con</span></div>
          <div className="social-row">
            <button className="button button--outline" type="button" aria-disabled="true"><strong className="google-g">G</strong> Google</button>
            <button className="button button--outline" type="button" aria-disabled="true"><strong className="facebook-f">f</strong> Facebook</button>
          </div>
          <p className="auth-register">
            {esRegistro ? "¿Ya tenés cuenta? " : "¿Aún no tenés cuenta? "}
            <button
              className="link-button link-button--orange"
              type="button"
              onClick={() => cambiarModo(esRegistro ? "login" : "registro")}
            >
              {esRegistro ? "Iniciá sesión" : "Registrate gratis"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

function PetAvatar({ size = "large", tone = "orange" }) {
  return (
    <span className={`pet-avatar pet-avatar--${size} pet-avatar--${tone}`} aria-hidden="true">
      <PawPrint size={size === "large" ? 42 : 19} strokeWidth={2.4} />
    </span>
  );
}

/** Todos los registros de salud de una mascota en una sola lista. */
function registrosDe(salud) {
  return [...salud.vacunas, ...salud.desparasitaciones, ...salud.medicamentos];
}

/**
 * Pantalla de inicio: resumen de todas las mascotas, lo que necesita atención y
 * las próximas citas. Junta los mismos datos que Salud y Citas.
 */
function InicioPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const salud = useSaludUsuario();
  const citas = useRecursoApi(listarCitas);

  const mascotas = salud.datos ?? SIN_MASCOTAS;
  const filasSalud = useMemo(() => construirFilasSalud(mascotas), [mascotas]);
  const filasMedicamentos = useMemo(() => construirFilasMedicamentos(mascotas), [mascotas]);
  const resumen = resumirEstados(filasSalud, filasMedicamentos);

  // Lo vencido primero, después lo que vence pronto (ya vienen ordenados por fecha).
  const pendientes = [
    ...filasSalud.filter((fila) => fila.estado === "VENCIDO"),
    ...filasSalud.filter((fila) => fila.estado === "POR_VENCER"),
  ].slice(0, 5);

  const hoy = claveHoy();
  const proximasCitas = (citas.datos ?? [])
    .filter((cita) => cita.estado === "PROGRAMADA" && cita.fechaHora.slice(0, 10) >= hoy)
    .slice(0, 3);

  const primerNombre = usuario?.nombre?.split(" ")[0] ?? "";
  const cargando = salud.cargando || citas.cargando;
  const error = salud.error ?? citas.error;

  function reintentar() {
    salud.recargar();
    citas.recargar();
  }

  return (
    <AppShell>
      <PageHeading
        title={`Hola, ${primerNombre} 👋`}
        subtitle={`Este es el resumen de tus mascotas para hoy, ${formatearFecha(hoy)}.`}
        action={
          <PrimaryButton onClick={() => navigate("/citas", { state: { nuevaCita: {} } })}>
            Nueva cita
          </PrimaryButton>
        }
      />

      {error && <AvisoError error={error} onReintentar={reintentar} />}
      {cargando && <PanelCargando mensaje="Preparando tu resumen…" />}

      {!cargando && !error && (
        <>
          <div className="summary-grid summary-grid--four">
            <Summary icon={PawPrint} value={mascotas.length} label="Mascotas registradas" tone="teal" />
            <Summary icon={Check} value={resumen.alDia} label="Registros al día" tone="good" />
            <Summary icon={Clock3} value={resumen.porVencer} label="Próximos a vencer" tone="warning" />
            <Summary icon={CircleAlert} value={resumen.vencidos} label="Vencidos" tone="danger" />
          </div>

          <div className="inicio-grid">
            <section className="panel content-panel">
              <div className="panel-title-row">
                <h2>Necesita tu atención</h2>
                <NavLink className="link-button" to="/salud">Ir a Salud →</NavLink>
              </div>
              {pendientes.length === 0 && (
                <p className="sin-datos">Nada vencido ni por vencer. ¡Todo al día!</p>
              )}
              {pendientes.map((fila) => {
                const estado = describirEstado(fila.estado, fila.proximaFecha);
                return (
                  <div className="pendiente-row" key={fila.id}>
                    <PetAvatar size="small" tone={fila.tono} />
                    <div>
                      <strong>{fila.tipo}</strong>
                      <span>{fila.mascotaNombre} · {formatearFecha(fila.proximaFecha)}</span>
                    </div>
                    <span className={`status-chip status-chip--${estado.tono}`}>{estado.etiqueta}</span>
                  </div>
                );
              })}
            </section>

            <section className="panel content-panel">
              <div className="panel-title-row">
                <h2>Próximas citas</h2>
                <NavLink className="link-button" to="/citas">Ver agenda →</NavLink>
              </div>
              {proximasCitas.length === 0 && (
                <p className="sin-datos">No tenés citas programadas.</p>
              )}
              <div className="agenda-list">
                {proximasCitas.map((cita) => <TarjetaCita key={cita.id} cita={cita} />)}
              </div>
            </section>
          </div>

          <section className="panel content-panel">
            <div className="panel-title-row">
              <h2>Tus mascotas</h2>
              <NavLink className="link-button" to="/mascotas">Ver todas →</NavLink>
            </div>
            <div className="mascotas-mini">
              {mascotas.map(({ mascota, tono, salud: registros }) => {
                const estado = peorEstado(registrosDe(registros));
                return (
                  <NavLink className="mascota-mini" key={mascota.id} to={`/mascotas/${mascota.id}`}>
                    <PetAvatar size="small" tone={tono} />
                    <div>
                      <strong>{mascota.nombre}</strong>
                      <span>{formatearEnum(mascota.especie)}{mascota.raza ? ` · ${mascota.raza}` : ""}</span>
                    </div>
                    <span className={`status-chip status-chip--${estado.tono}`}>{estado.etiqueta}</span>
                  </NavLink>
                );
              })}
              {mascotas.length === 0 && (
                <p className="sin-datos">Todavía no hay mascotas registradas en esta cuenta.</p>
              )}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

/**
 * Todas las mascotas del usuario en tarjetas; cada una abre su perfil.
 * Antes esta ruta redirigía directo a la primera mascota y no había forma de
 * llegar a las demás.
 */
function MisMascotasPage() {
  const { datos, cargando, error, recargar } = useSaludUsuario();
  const mascotas = datos ?? SIN_MASCOTAS;

  return (
    <AppShell>
      <PageHeading
        title="Mis mascotas"
        subtitle={
          mascotas.length === 1
            ? "Tenés 1 mascota registrada."
            : `Tenés ${mascotas.length} mascotas registradas.`
        }
      />

      {error && <AvisoError error={error} onReintentar={recargar} />}
      {cargando && <PanelCargando mensaje="Cargando tus mascotas…" />}

      {!cargando && !error && mascotas.length === 0 && (
        <div className="empty-state panel">
          Agregá tu primera mascota para empezar a llevar su historial de salud.
        </div>
      )}

      {!cargando && !error && mascotas.length > 0 && (
        <section className="mascotas-grid" aria-label="Mascotas">
          {mascotas.map(({ mascota, tono, salud }) => {
            const estado = peorEstado(registrosDe(salud));
            const detalle = [mascota.raza, formatearEnum(mascota.sexo), calcularEdad(mascota.fechaNacimiento)]
              .filter(Boolean)
              .join(" · ");

            return (
              <NavLink className="mascota-card panel" key={mascota.id} to={`/mascotas/${mascota.id}`}>
                <div className="mascota-card__top">
                  <PetAvatar tone={tono} />
                  <span className={`status-chip status-chip--${estado.tono}`}>{estado.etiqueta}</span>
                </div>
                <h2>{mascota.nombre}</h2>
                <p>{detalle}</p>
                <div className="mascota-card__metricas">
                  <span><strong>{salud.vacunas.length}</strong> vacunas</span>
                  <span><strong>{salud.desparasitaciones.length}</strong> desparasit.</span>
                  <span><strong>{salud.medicamentos.length}</strong> medicam.</span>
                </div>
                <span className="mascota-card__ver">Ver perfil <ChevronRight size={16} /></span>
              </NavLink>
            );
          })}
        </section>
      )}
    </AppShell>
  );
}

/**
 * Perfil de una mascota, con datos reales de la API.
 *
 * Se mantiene el layout del prototipo. Lo que antes estaba escrito a mano ahora
 * viene de GET /api/mascotas/{id} y de los tres endpoints de salud; lo que no
 * tiene endpoint todavía (citas, documentos, veterinaria asociada) queda
 * marcado en el código.
 */
function PetProfilePage() {
  const { mascotaId } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const usuarioId = usuario?.id;

  /*
   * El prototipo usaba la ruta /mascotas/max. Si alguien llega con un id que no
   * es un número (un enlace viejo o un marcador del navegador), se manda a
   * /mascotas en vez de pedirle al backend un id inválido.
   */
  const idValido = /^\d+$/.test(mascotaId ?? "");

  const cargar = useCallback(
    async ({ signal }) => {
      // El listado completo alimenta el selector para saltar entre mascotas.
      const [mascota, salud, todas] = await Promise.all([
        obtenerMascota(mascotaId, { signal }),
        listarSaludDeMascota(mascotaId, { signal }),
        listarMascotas(usuarioId, { signal }),
      ]);
      return { mascota, salud, todas };
    },
    [mascotaId, usuarioId],
  );

  const { datos, cargando, error, recargar } = useRecursoApi(cargar, {
    activo: idValido && Boolean(usuarioId),
  });

  if (!idValido) {
    return <Navigate to="/mascotas" replace />;
  }

  if (cargando) {
    return (
      <AppShell>
        <PanelCargando mensaje="Cargando el perfil…" />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <PageHeading title="Perfil de mascota" />
        <AvisoError error={error} onReintentar={recargar} />
      </AppShell>
    );
  }

  const { mascota, salud, todas } = datos;
  const registros = registrosDe(salud);
  // Mismo color que en el resto de pantallas, que lo asignan por posición.
  const tono = tonoDeMascota(Math.max(0, todas.findIndex((otra) => otra.id === mascota.id)));
  const agendarCita = () => navigate("/citas", { state: { nuevaCita: { mascotaId: mascota.id } } });

  // El badge del encabezado refleja el peor estado de todos sus registros.
  const estadoGeneral = peorEstado(registros);
  const edad = calcularEdad(mascota.fechaNacimiento);
  const peso = formatearPeso(mascota.peso);

  // El recordatorio más urgente: el primer registro que ya venció o está por vencer.
  const proximoVencimiento = registros
    .filter((registro) => registro.estado === "VENCIDO" || registro.estado === "POR_VENCER")
    .map((registro) => ({
      ...registro,
      referencia: registro.proximaFecha ?? registro.fechaFin,
    }))
    .sort((a, b) => (a.referencia ?? "").localeCompare(b.referencia ?? ""))[0];

  const vacunasAlDia = salud.vacunas.every((vacuna) => vacuna.estado !== "VENCIDO");

  return (
    <AppShell>
      <div className="perfil-barra">
        <div className="breadcrumb">
          <NavLink to="/mascotas">Mis mascotas</NavLink> / <strong>{mascota.nombre}</strong>
        </div>
        {todas.length > 1 && (
          <div className="segmented" role="group" aria-label="Cambiar de mascota">
            {todas.map((otra) => (
              <button
                key={otra.id}
                type="button"
                className={otra.id === mascota.id ? "is-selected" : ""}
                onClick={() => navigate(`/mascotas/${otra.id}`)}
              >
                {otra.nombre}
              </button>
            ))}
          </div>
        )}
      </div>
      <section className="pet-hero panel">
        <div className="pet-hero__identity">
          <div className="pet-avatar-wrap">
            <PetAvatar tone={tono} />
            <span className={`status-chip status-chip--${estadoGeneral.tono}`}>
              {estadoGeneral.etiqueta}
            </span>
          </div>
          <div>
            <h1>{mascota.nombre}</h1>
            <p>
              {[mascota.raza, formatearEnum(mascota.sexo), edad].filter(Boolean).join(" · ")}
            </p>
            <div className="chip-row">
              {peso && <span className="soft-chip"><Heart size={14} /> {peso}</span>}
              {mascota.fechaNacimiento && (
                <span className="soft-chip">
                  <CalendarDays size={14} /> Nació {formatearFecha(mascota.fechaNacimiento)}
                </span>
              )}
              {salud.vacunas.length > 0 && vacunasAlDia && (
                <span className="soft-chip"><Check size={14} /> Vacunas al día</span>
              )}
            </div>
          </div>
        </div>
        <div className="pet-hero__actions">
          <PrimaryButton icon={Edit3}>Editar perfil</PrimaryButton>
          <button className="button button--outline" type="button" onClick={agendarCita}>
            <Plus size={16} /> Nueva cita
          </button>
        </div>
      </section>

      <div className="profile-grid">
        <div className="profile-grid__main">
          <section className="panel content-panel">
            <div className="panel-title-row"><h2>Datos básicos</h2><button className="link-button" type="button">Editar</button></div>
            <div className="detail-grid">
              <Detail label="Nombre" value={mascota.nombre} />
              <Detail label="Especie" value={formatearEnum(mascota.especie)} />
              <Detail label="Raza" value={mascota.raza ?? "—"} />
              <Detail label="Sexo" value={formatearEnum(mascota.sexo)} />
              <Detail label="Fecha de nacimiento" value={formatearFecha(mascota.fechaNacimiento)} />
              <Detail label="Peso actual" value={peso ?? "—"} />
            </div>
            <div className="metric-row">
              <Metric value={salud.vacunas.length} label="Vacunas registradas" />
              <Metric value={salud.desparasitaciones.length} label="Desparasitaciones" />
              <Metric
                value={salud.medicamentos.filter((m) => m.estado !== "VENCIDO").length}
                label="Medicamentos activos"
              />
            </div>
          </section>

          <section className="panel content-panel activity-panel">
            <div className="panel-title-row">
              <h2>Actividad reciente</h2>
              <NavLink className="link-button" to="/salud" state={{ mascota: mascota.nombre }}>
                Ver historial →
              </NavLink>
            </div>
            <ActividadReciente salud={salud} />
          </section>
        </div>

        <aside className="profile-grid__aside">
          <section className="panel content-panel">
            <h2>Propietario</h2>
            <div className="owner-row">
              <span className="owner-avatar" />
              <div>
                <strong>{usuario?.nombre ?? "—"}</strong>
                <span>{usuario?.correo ?? ""}</span>
              </div>
            </div>
          </section>

          <section className="panel content-panel reminder-card">
            <h2>Próximo recordatorio</h2>
            {proximoVencimiento ? (
              <div className="reminder-row">
                <span className="reminder-icon"><Clock3 size={18} /></span>
                <div>
                  <strong>{nombreDeRegistro(proximoVencimiento)}</strong>
                  <span>
                    {describirEstado(proximoVencimiento.estado, proximoVencimiento.referencia).etiqueta}
                    {" · "}
                    {formatearFecha(proximoVencimiento.referencia)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="sin-datos">No hay nada por vencer. Todo al día.</p>
            )}
            <button className="button button--outline" type="button" onClick={agendarCita}>
              Agendar ahora
            </button>
          </section>

          {/* Sin endpoint de servicios todavía: queda el bloque del prototipo. */}
          <section className="panel content-panel">
            <h2>Veterinaria asociada</h2>
            <p className="sin-datos">Aún no hay una veterinaria asociada a este perfil.</p>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

/**
 * Los últimos movimientos de salud de la mascota, ordenados del más reciente al
 * más antiguo. Reemplaza la lista fija del prototipo.
 */
function ActividadReciente({ salud }) {
  const eventos = [
    ...salud.vacunas.map((vacuna) => ({
      icono: ShieldCheck,
      titulo: `Vacuna ${vacuna.nombre} aplicada`,
      fecha: vacuna.fechaAplicacion,
      detalle: vacuna.veterinario,
    })),
    ...salud.desparasitaciones.map((item) => ({
      icono: Heart,
      titulo: `Desparasitación ${formatearEnum(item.tipo).toLowerCase()}`,
      fecha: item.fecha,
      detalle: item.producto,
    })),
    ...salud.medicamentos.map((medicamento) => ({
      icono: Pill,
      titulo: `${medicamento.nombre} iniciado`,
      fecha: medicamento.fechaInicio,
      detalle: medicamento.dosis,
    })),
  ]
    .filter((evento) => evento.fecha)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 4);

  if (eventos.length === 0) {
    return <p className="sin-datos">Todavía no hay registros de salud para esta mascota.</p>;
  }

  return eventos.map((evento, indice) => (
    <Activity
      key={`${evento.titulo}-${evento.fecha}-${indice}`}
      icon={evento.icono}
      title={evento.titulo}
      meta={[formatearFecha(evento.fecha), evento.detalle].filter(Boolean).join(" · ")}
    />
  ));
}

/** El estado más grave de un conjunto de registros, para el badge del encabezado. */
function peorEstado(registros) {
  const prioridad = ["VENCIDO", "POR_VENCER", "AL_DIA"];

  const encontrado = prioridad.find((estado) =>
    registros.some((registro) => registro.estado === estado),
  );

  if (!encontrado) {
    return { etiqueta: "Sin registros", tono: "neutral" };
  }

  // Sin fecha de referencia: se quiere la etiqueta genérica ("Por vencer"), no
  // el conteo de días de un registro puntual.
  return describirEstado(encontrado, null);
}

/** Nombre legible de un registro de salud, sea vacuna, desparasitación o medicamento. */
function nombreDeRegistro(registro) {
  if (registro.tipo) {
    return `Desparasitación ${formatearEnum(registro.tipo).toLowerCase()}`;
  }
  if (registro.dosis !== undefined) {
    return `${registro.nombre} (${registro.dosis ?? "medicamento"})`;
  }
  return `Vacuna ${registro.nombre}`;
}

function Detail({ label, value }) {
  return <div className="detail"><span>{label}</span><strong>{value}</strong></div>;
}

function Metric({ value, label }) {
  return <div className="metric"><strong>{value}</strong><span>{label}</span></div>;
}

function Activity({ icon: Icon, title, meta }) {
  return (
    <div className="activity-row">
      <span className="activity-icon"><Icon size={18} /></span>
      <div><strong>{title}</strong><span>{meta}</span></div>
    </div>
  );
}

const TODAS_LAS_MASCOTAS = "Todas las mascotas";

/* Constante compartida: un [] nuevo en cada render invalidaría los useMemo de
   abajo mientras los datos todavía están cargando. */
const SIN_MASCOTAS = [];

/**
 * Pantalla de Salud, conectada a la API.
 *
 * Mismo diseño que el prototipo (tablas, badges, tarjetas de resumen); la única
 * diferencia es que los registros, sus estados y el filtro por mascota salen del
 * backend en vez de arreglos escritos a mano.
 */
function HealthPage() {
  const { datos, cargando, error, recargar } = useSaludUsuario();
  const location = useLocation();

  // "Ver historial" en el perfil de una mascota llega con el filtro ya puesto.
  const [petFilter, setPetFilter] = useState(location.state?.mascota ?? TODAS_LAS_MASCOTAS);
  const [recordFilter, setRecordFilter] = useState("Todo");
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [aviso, setAviso] = useAvisoTemporal();
  const cerrarFormulario = useCallback(() => setFormularioAbierto(false), []);

  const mascotas = datos ?? SIN_MASCOTAS;

  // Las opciones del filtro ya no están escritas a mano: son las mascotas del usuario.
  const opcionesMascota = useMemo(
    () => [TODAS_LAS_MASCOTAS, ...mascotas.map(({ mascota }) => mascota.nombre)],
    [mascotas],
  );

  /*
   * Se arman todas las filas y después se filtra, para que las tarjetas de
   * resumen sigan contando sobre el total aunque haya un filtro activo.
   */
  const filasSalud = useMemo(() => construirFilasSalud(mascotas), [mascotas]);
  const filasMedicamentos = useMemo(() => construirFilasMedicamentos(mascotas), [mascotas]);
  const resumen = useMemo(
    () => resumirEstados(filasSalud, filasMedicamentos),
    [filasSalud, filasMedicamentos],
  );

  const coincideMascota = (fila) =>
    petFilter === TODAS_LAS_MASCOTAS || fila.mascotaNombre === petFilter;

  const saludVisible = filasSalud.filter(
    (fila) =>
      coincideMascota(fila) && (recordFilter === "Todo" || fila.categoria === recordFilter),
  );
  const medicamentosVisibles = filasMedicamentos.filter(coincideMascota);

  const mostrarSalud = recordFilter !== "Medicamentos";
  const mostrarMedicamentos = recordFilter === "Todo" || recordFilter === "Medicamentos";

  return (
    <AppShell>
      <PageHeading
        title="Salud"
        subtitle="Vacunas, desparasitaciones y medicamentos de tus mascotas."
        action={
          <PrimaryButton onClick={() => setFormularioAbierto(true)} disabled={mascotas.length === 0}>
            Nuevo registro
          </PrimaryButton>
        }
      />

      <AvisoExito mensaje={aviso} />

      {formularioAbierto && (
        <NuevoRegistroModal
          mascotas={mascotas.map(({ mascota }) => mascota)}
          mascotaInicial={mascotas.find(({ mascota }) => mascota.nombre === petFilter)?.mascota.id}
          onCerrar={cerrarFormulario}
          onGuardado={(mensaje) => {
            setFormularioAbierto(false);
            setAviso(mensaje);
            recargar();
          }}
        />
      )}

      {/* Si la API falla se muestra el aviso y no se renderizan las tablas: así la
          pantalla no se rompe ni queda mostrando datos a medias. */}
      {error && <AvisoError error={error} onReintentar={recargar} />}

      {cargando && <PanelCargando mensaje="Cargando los registros de salud…" />}

      {!cargando && !error && mascotas.length === 0 && (
        <div className="empty-state panel">
          Todavía no hay mascotas registradas en esta cuenta. Al agregar una, acá
          aparecerá su historial de salud.
        </div>
      )}

      {!cargando && !error && mascotas.length > 0 && (
        <>
          <div className="toolbar-row">
            <FilterGroup options={opcionesMascota} value={petFilter} onChange={setPetFilter} />
            <FilterGroup
              options={["Todo", "Vacunas", "Desparasitación", "Medicamentos"]}
              value={recordFilter}
              onChange={setRecordFilter}
            />
          </div>

          <div className="summary-grid summary-grid--four">
            <Summary icon={Check} value={resumen.alDia} label="Registros al día" tone="good" />
            <Summary icon={Clock3} value={resumen.porVencer} label="Próximos a vencer" tone="warning" />
            <Summary icon={CircleAlert} value={resumen.vencidos} label="Vencidos" tone="danger" />
            <Summary icon={Pill} value={resumen.medicamentosActivos} label="Medicamentos activos" tone="teal" />
          </div>

          {mostrarSalud && (
            <DataSection title="Vacunas y desparasitación">
              <div className="data-table data-table--health" role="table" aria-label="Vacunas y desparasitación">
                <div className="data-table__head" role="row">
                  <span>Mascota</span><span>Tipo</span><span>Fecha de aplicación</span><span>Próxima fecha</span><span>Estado</span><span />
                </div>
                {saludVisible.map((fila) => {
                  const estado = describirEstado(fila.estado, fila.proximaFecha);
                  return (
                    <div className="data-table__row" role="row" key={fila.id}>
                      <span data-label="Mascota">
                        <PetAvatar size="small" tone={fila.tono} /> {fila.mascotaNombre}
                      </span>
                      <strong data-label="Tipo">
                        {fila.tipo}
                        {fila.detalle && <small className="celda-detalle">{fila.detalle}</small>}
                      </strong>
                      <span data-label="Aplicación">{formatearFecha(fila.fecha)}</span>
                      <span data-label="Próxima fecha">{formatearFecha(fila.proximaFecha)}</span>
                      <span data-label="Estado">
                        <span className={`status-chip status-chip--${estado.tono}`}>{estado.etiqueta}</span>
                      </span>
                      <button className="table-action" type="button" aria-label={`Editar ${fila.tipo}`}>
                        <Edit3 size={15} />
                      </button>
                    </div>
                  );
                })}
                {saludVisible.length === 0 && (
                  <div className="data-table__vacio">No hay registros que coincidan con el filtro.</div>
                )}
              </div>
            </DataSection>
          )}

          {mostrarMedicamentos && (
            <DataSection title="Medicamentos">
              <div className="data-table data-table--medication" role="table" aria-label="Medicamentos">
                <div className="data-table__head" role="row">
                  <span>Mascota</span><span>Medicamento</span><span>Dosis</span><span>Frecuencia</span><span>Vigencia</span><span />
                </div>
                {medicamentosVisibles.map((fila) => {
                  const estado = describirEstado(fila.estado, fila.fechaFin);
                  return (
                    <div className="data-table__row" role="row" key={fila.id}>
                      <span data-label="Mascota">
                        <PetAvatar size="small" tone={fila.tono} /> {fila.mascotaNombre}
                      </span>
                      <strong data-label="Medicamento">{fila.nombre}</strong>
                      <span data-label="Dosis">{fila.dosis ?? "—"}</span>
                      <span data-label="Frecuencia">{describirFrecuencia(fila.frecuenciaHoras)}</span>
                      <span data-label="Vigencia">
                        <span className={`status-chip status-chip--${estado.tono}`}>
                          {fila.fechaFin ? `Hasta ${formatearFecha(fila.fechaFin)}` : estado.etiqueta}
                        </span>
                      </span>
                      <button className="table-action" type="button" aria-label={`Editar ${fila.nombre}`}>
                        <Edit3 size={15} />
                      </button>
                    </div>
                  );
                })}
                {medicamentosVisibles.length === 0 && (
                  <div className="data-table__vacio">No hay medicamentos registrados.</div>
                )}
              </div>
            </DataSection>
          )}
        </>
      )}
    </AppShell>
  );
}

const TIPOS_REGISTRO = ["Vacuna", "Desparasitación", "Medicamento"];

const CONFIRMACION_REGISTRO = {
  Vacuna: "Vacuna registrada",
  Desparasitación: "Desparasitación registrada",
  Medicamento: "Medicamento registrado",
};

/**
 * Alta de un registro de salud. Según el tipo elegido arma el cuerpo que espera
 * cada endpoint (VacunaRequest, DesparasitacionRequest, MedicamentoRequest).
 */
function NuevoRegistroModal({ mascotas, mascotaInicial, onCerrar, onGuardado }) {
  const [tipo, setTipo] = useState(TIPOS_REGISTRO[0]);
  const { enviando, error, erroresCampo, enviar, fallar } = useEnvioFormulario();
  const hoy = claveHoy();

  async function handleSubmit(event) {
    event.preventDefault();
    const { mascotaId, ...datos } = leerFormulario(event.currentTarget);
    const mascota = mascotas.find((item) => String(item.id) === mascotaId);

    // El backend también lo valida, pero su mensaje usa los nombres técnicos.
    const inicio = datos.fechaAplicacion ?? datos.fecha ?? datos.fechaInicio;
    const fin = datos.proximaFecha ?? datos.fechaFin;
    if (fin && inicio && fin <= inicio) {
      const campo = datos.fechaFin ? "fechaFin" : "proximaFecha";
      fallar("Revisá las fechas.", { [campo]: "Tiene que ser posterior a la fecha de inicio." });
      return;
    }

    const crear = {
      Vacuna: () => crearVacuna(mascotaId, datos),
      Desparasitación: () => crearDesparasitacion(mascotaId, datos),
      Medicamento: () =>
        crearMedicamento(mascotaId, {
          ...datos,
          frecuenciaHoras: datos.frecuenciaHoras ? Number(datos.frecuenciaHoras) : null,
        }),
    }[tipo];

    const guardado = await enviar(crear);
    if (guardado) {
      onGuardado(`${CONFIRMACION_REGISTRO[tipo]} para ${mascota?.nombre ?? "tu mascota"}.`);
    }
  }

  return (
    <Modal titulo="Nuevo registro de salud" subtitulo="Queda guardado en el historial de la mascota." onCerrar={onCerrar}>
      <FilterGroup options={TIPOS_REGISTRO} value={tipo} onChange={setTipo} />

      {/* key: al cambiar de tipo se arma un formulario limpio. */}
      <form className="form-modal" key={tipo} onSubmit={handleSubmit}>
        <Campo etiqueta="Mascota" ancho>
          <select name="mascotaId" required defaultValue={mascotaInicial ?? mascotas[0]?.id}>
            {mascotas.map((mascota) => (
              <option key={mascota.id} value={mascota.id}>{mascota.nombre}</option>
            ))}
          </select>
        </Campo>

        {tipo === "Vacuna" && (
          <>
            <Campo etiqueta="Vacuna" error={erroresCampo.nombre} ancho>
              <input name="nombre" required maxLength={120} placeholder="Rabia, séxtuple, triple felina…" autoFocus />
            </Campo>
            <Campo etiqueta="Fecha de aplicación" error={erroresCampo.fechaAplicacion}>
              <input type="date" name="fechaAplicacion" required max={hoy} defaultValue={hoy} />
            </Campo>
            <Campo etiqueta="Próxima dosis" opcional error={erroresCampo.proximaFecha}>
              <input type="date" name="proximaFecha" />
            </Campo>
            <Campo etiqueta="Veterinario" opcional ancho>
              <input name="veterinario" maxLength={120} placeholder="Dra. Pérez" />
            </Campo>
          </>
        )}

        {tipo === "Desparasitación" && (
          <>
            <Campo etiqueta="Tipo" error={erroresCampo.tipo}>
              <select name="tipo" required defaultValue="INTERNA">
                <option value="INTERNA">Interna</option>
                <option value="EXTERNA">Externa</option>
              </select>
            </Campo>
            <Campo etiqueta="Producto" opcional>
              <input name="producto" maxLength={120} placeholder="Drontal, NexGard…" autoFocus />
            </Campo>
            <Campo etiqueta="Fecha" error={erroresCampo.fecha}>
              <input type="date" name="fecha" required max={hoy} defaultValue={hoy} />
            </Campo>
            <Campo etiqueta="Próxima aplicación" opcional error={erroresCampo.proximaFecha}>
              <input type="date" name="proximaFecha" />
            </Campo>
          </>
        )}

        {tipo === "Medicamento" && (
          <>
            <Campo etiqueta="Medicamento" error={erroresCampo.nombre} ancho>
              <input name="nombre" required maxLength={120} placeholder="Amoxicilina" autoFocus />
            </Campo>
            <Campo etiqueta="Dosis" opcional>
              <input name="dosis" maxLength={80} placeholder="50 mg" />
            </Campo>
            <Campo etiqueta="Cada cuántas horas" opcional error={erroresCampo.frecuenciaHoras}>
              <input type="number" name="frecuenciaHoras" min={1} max={720} placeholder="12" />
            </Campo>
            <Campo etiqueta="Inicio" error={erroresCampo.fechaInicio}>
              <input type="date" name="fechaInicio" required max={hoy} defaultValue={hoy} />
            </Campo>
            <Campo etiqueta="Fin" opcional error={erroresCampo.fechaFin}>
              <input type="date" name="fechaFin" />
            </Campo>
          </>
        )}

        <Campo etiqueta="Observaciones" opcional ancho>
          <textarea name="observaciones" maxLength={500} rows={2} />
        </Campo>

        <PieFormulario error={error} enviando={enviando} textoGuardar="Guardar registro" onCancelar={onCerrar} />
      </form>
    </Modal>
  );
}

/** Aviso de error de API, con botón para reintentar sin recargar la página. */
function AvisoError({ error, onReintentar }) {
  return (
    <div className="panel aviso-error" role="alert">
      <span className="aviso-error__icono"><CircleAlert size={20} /></span>
      <div>
        <strong>No se pudieron cargar los datos</strong>
        <span>{error.message}</span>
      </div>
      {onReintentar && (
        <button className="button button--outline" type="button" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}

/** Indicador de carga con el ancho de un panel, para no mover el layout. */
function PanelCargando({ mensaje }) {
  return (
    <div className="panel panel-cargando">
      <span className="spinner" aria-hidden="true" />
      <p>{mensaje}</p>
    </div>
  );
}

function FilterGroup({ options, value, onChange }) {
  return (
    <div className="segmented" role="group">
      {options.map((option) => (
        <button
          className={value === option ? "is-selected" : ""}
          key={option}
          type="button"
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function Summary({ icon: Icon, value, label, tone }) {
  return (
    <article className="summary-card panel">
      <span className={`summary-card__icon summary-card__icon--${tone}`}><Icon size={20} /></span>
      <div><strong>{value}</strong><span>{label}</span></div>
    </article>
  );
}

function DataSection({ title, action, children }) {
  return (
    <section className="panel data-section">
      <div className="panel-title-row data-section__title"><h2>{title}</h2>{action && <button className="link-button" type="button">{action}</button>}</div>
      {children}
    </section>
  );
}

const ESTADO_CITA = {
  PROGRAMADA: { etiqueta: "Programada", tono: "good" },
  REALIZADA: { etiqueta: "Realizada", tono: "neutral" },
  CANCELADA: { etiqueta: "Cancelada", tono: "danger" },
};

const TODAS = "Todas";
const OTRO_LUGAR = "otro";

/** Una cita en la agenda: día, motivo, mascota, lugar, hora y estado. */
function TarjetaCita({ cita }) {
  const { dia, mesCorto, hora } = partesFechaHora(cita.fechaHora);
  const estado = ESTADO_CITA[cita.estado] ?? { etiqueta: formatearEnum(cita.estado), tono: "neutral" };

  return (
    <article className="appointment">
      <time dateTime={cita.fechaHora}><strong>{dia}</strong><span>{mesCorto}</span></time>
      <div className="appointment__copy">
        <strong>{cita.motivo ?? "Cita veterinaria"} — {cita.mascotaNombre}</strong>
        <span>{cita.servicioNombre ?? cita.lugar ?? "Lugar por definir"}</span>
        <span>{[hora, cita.veterinario].filter(Boolean).join("  ·  ")}</span>
      </div>
      <span className={`status-chip status-chip--${estado.tono}`}>{estado.etiqueta}</span>
    </article>
  );
}

/**
 * Agenda mensual con datos reales: las citas de GET /api/citas y, como
 * recordatorio, las próximas fechas de vacunas, desparasitaciones y fines de
 * tratamiento (los colores de la leyenda).
 */
function CalendarPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const salud = useSaludUsuario();
  const citas = useRecursoApi(listarCitas);

  const [mesVisible, setMesVisible] = useState(() => {
    const hoy = new Date();
    return { anio: hoy.getFullYear(), mes: hoy.getMonth() };
  });
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [petFilter, setPetFilter] = useState(TODAS);
  const [aviso, setAviso] = useAvisoTemporal();

  /*
   * Inicio, el perfil de mascota y el directorio mandan a esta pantalla con
   * state.nuevaCita para abrir el formulario directo (con la mascota elegida).
   */
  const [nuevaCita, setNuevaCita] = useState(location.state?.nuevaCita ?? null);
  const cerrarFormulario = useCallback(() => setNuevaCita(null), []);

  // Se limpia el state del historial para que recargar la página no reabra el formulario.
  useEffect(() => {
    if (location.state?.nuevaCita) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const mascotas = salud.datos ?? SIN_MASCOTAS;
  const hoy = claveHoy();

  const eventosPorDia = useMemo(() => {
    const coincide = (nombre) => petFilter === TODAS || nombre === petFilter;
    const mapa = new Map();
    const agregar = (clave, evento) => {
      if (clave) mapa.set(clave, [...(mapa.get(clave) ?? []), evento]);
    };

    (citas.datos ?? [])
      .filter((cita) => cita.estado !== "CANCELADA" && coincide(cita.mascotaNombre))
      .forEach((cita) => {
        const { clave, hora } = partesFechaHora(cita.fechaHora);
        agregar(clave, { texto: `${hora} · ${cita.mascotaNombre}`, clase: "event-dark" });
      });

    mascotas
      .filter(({ mascota }) => coincide(mascota.nombre))
      .forEach(({ mascota, salud: registros }) => {
        registros.vacunas.forEach((vacuna) =>
          agregar(vacuna.proximaFecha, { texto: `Vacuna ${mascota.nombre}`, clase: "event-orange" }));
        registros.desparasitaciones.forEach((item) =>
          agregar(item.proximaFecha, { texto: `Desparasit. ${mascota.nombre}`, clase: "event-teal" }));
        registros.medicamentos.forEach((medicamento) =>
          agregar(medicamento.fechaFin, { texto: `Fin ${medicamento.nombre}`, clase: "event-teal" }));
      });

    return mapa;
  }, [citas.datos, mascotas, petFilter]);

  // La lista lateral muestra el día elegido o, si no hay, todo el mes visible.
  const prefijoMes = `${mesVisible.anio}-${String(mesVisible.mes + 1).padStart(2, "0")}`;
  const citasAgenda = (citas.datos ?? []).filter(
    (cita) =>
      (petFilter === TODAS || cita.mascotaNombre === petFilter) &&
      cita.fechaHora.startsWith(diaSeleccionado ?? prefijoMes),
  );

  function moverMes(delta) {
    setMesVisible(({ anio, mes }) => {
      const fecha = new Date(anio, mes + delta, 1);
      return { anio: fecha.getFullYear(), mes: fecha.getMonth() };
    });
    setDiaSeleccionado(null);
  }

  function irAHoy() {
    const fecha = new Date();
    setMesVisible({ anio: fecha.getFullYear(), mes: fecha.getMonth() });
    setDiaSeleccionado(claveFecha(fecha));
  }

  function elegirDia(clave, fuera) {
    if (fuera) {
      const [anio, mes] = clave.split("-").map(Number);
      setMesVisible({ anio, mes: mes - 1 });
    }
    setDiaSeleccionado((actual) => (actual === clave ? null : clave));
  }

  function alGuardarCita(cita) {
    const { clave } = partesFechaHora(cita.fechaHora);
    const [anio, mes] = clave.split("-").map(Number);
    setNuevaCita(null);
    setMesVisible({ anio, mes: mes - 1 });
    setDiaSeleccionado(clave);
    setAviso(`Cita agendada para ${cita.mascotaNombre} el ${formatearFecha(clave)}.`);
    citas.recargar();
  }

  function reintentar() {
    salud.recargar();
    citas.recargar();
  }

  // Solo la primera carga muestra el spinner; al recargar se mantienen los datos.
  const cargandoInicial = (salud.cargando && !salud.datos) || (citas.cargando && !citas.datos);
  const error = salud.error ?? citas.error;

  return (
    <AppShell>
      <PageHeading
        title="Citas y calendario"
        subtitle="Agenda unificada de tus mascotas con recordatorios automáticos."
        action={
          <PrimaryButton
            onClick={() => setNuevaCita({ fecha: diaSeleccionado })}
            disabled={cargandoInicial || mascotas.length === 0}
          >
            Nueva cita
          </PrimaryButton>
        }
      />

      <AvisoExito mensaje={aviso} />

      {nuevaCita && salud.datos && (
        <NuevaCitaModal
          mascotas={mascotas.map(({ mascota }) => mascota)}
          inicial={nuevaCita}
          onCerrar={cerrarFormulario}
          onGuardada={alGuardarCita}
        />
      )}

      {error && <AvisoError error={error} onReintentar={reintentar} />}
      {cargandoInicial && <PanelCargando mensaje="Cargando tu agenda…" />}

      {!cargandoInicial && !error && (
        <div className="calendar-layout">
          <section className="panel calendar-card">
            <div className="calendar-card__heading">
              <h2>{nombreDelMes(mesVisible.anio, mesVisible.mes)}</h2>
              <div>
                <button className="button button--outline boton-hoy" type="button" onClick={irAHoy}>Hoy</button>
                <button className="icon-button" type="button" aria-label="Mes anterior" onClick={() => moverMes(-1)}>
                  <ChevronLeft size={18} />
                </button>
                <button className="icon-button" type="button" aria-label="Mes siguiente" onClick={() => moverMes(1)}>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className="calendar-weekdays" aria-hidden="true">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="calendar-grid">
              {construirMes(mesVisible.anio, mesVisible.mes).map(({ clave, dia, fuera }) => {
                const eventos = eventosPorDia.get(clave) ?? [];
                const clases = [
                  "calendar-day",
                  fuera && "is-outside",
                  clave === hoy && "is-today",
                  clave === diaSeleccionado && "is-selected",
                ].filter(Boolean).join(" ");

                return (
                  <button
                    key={clave}
                    className={clases}
                    type="button"
                    aria-pressed={clave === diaSeleccionado}
                    aria-label={`${formatearFecha(clave)}${eventos.length ? `, ${eventos.length} eventos` : ""}`}
                    onClick={() => elegirDia(clave, fuera)}
                  >
                    <span>{dia}</span>
                    {eventos.slice(0, 2).map((evento, indice) => (
                      <small key={indice} className={evento.clase}>{evento.texto}</small>
                    ))}
                    {eventos.length > 2 && <small className="event-mas">+{eventos.length - 2} más</small>}
                  </button>
                );
              })}
            </div>
            <div className="calendar-legend">
              <span><i className="dot dot--dark" /> Cita veterinaria</span>
              <span><i className="dot dot--orange" /> Vacuna</span>
              <span><i className="dot dot--teal" /> Desparasitación / medicamento</span>
            </div>
          </section>

          <aside className="panel agenda-card">
            <FilterGroup
              options={[TODAS, ...mascotas.map(({ mascota }) => mascota.nombre)]}
              value={petFilter}
              onChange={setPetFilter}
            />
            <div className="agenda-card__titulo">
              <h2>
                {diaSeleccionado
                  ? `Citas del ${formatearFecha(diaSeleccionado)}`
                  : `Citas de ${nombreDelMes(mesVisible.anio, mesVisible.mes)}`}
              </h2>
              {diaSeleccionado && (
                <button className="link-button" type="button" onClick={() => setDiaSeleccionado(null)}>
                  Ver todo el mes
                </button>
              )}
            </div>
            <div className="agenda-list">
              {citasAgenda.map((cita) => <TarjetaCita key={cita.id} cita={cita} />)}
              {citasAgenda.length === 0 && (
                <p className="sin-datos">No hay citas {diaSeleccionado ? "ese día" : "este mes"}.</p>
              )}
            </div>
            {diaSeleccionado && diaSeleccionado >= hoy && (
              <button
                className="button button--outline agenda-card__agendar"
                type="button"
                onClick={() => setNuevaCita({ fecha: diaSeleccionado })}
              >
                <Plus size={16} /> Agendar este día
              </button>
            )}
          </aside>
        </div>
      )}
    </AppShell>
  );
}

/** Alta de una cita (POST /api/citas). El lugar puede ser del directorio u otro. */
function NuevaCitaModal({ mascotas, inicial, onCerrar, onGuardada }) {
  const servicios = useRecursoApi(listarServicios);
  const [servicioId, setServicioId] = useState("");
  const { enviando, error, erroresCampo, enviar } = useEnvioFormulario();
  const hoy = claveHoy();

  const servicioElegido = servicios.datos?.find((servicio) => String(servicio.id) === servicioId);
  const fechaInicial = inicial.fecha && inicial.fecha >= hoy ? inicial.fecha : hoy;

  async function handleSubmit(event) {
    event.preventDefault();
    const datos = leerFormulario(event.currentTarget);

    const guardada = await enviar(() =>
      crearCita({
        mascotaId: Number(datos.mascotaId),
        servicioId: servicioElegido ? servicioElegido.id : null,
        // LocalDateTime sin zona: la hora que se elige es la que se guarda.
        fechaHora: `${datos.fecha}T${datos.hora}`,
        veterinario: datos.veterinario,
        lugar: servicioId === OTRO_LUGAR ? datos.lugar : null,
        motivo: datos.motivo,
      }),
    );

    if (guardada) onGuardada(guardada);
  }

  return (
    <Modal titulo="Nueva cita" subtitulo="Se agrega a la agenda y al calendario." onCerrar={onCerrar}>
      <form className="form-modal" onSubmit={handleSubmit}>
        <Campo etiqueta="Mascota" error={erroresCampo.mascotaId} ancho>
          <select name="mascotaId" required defaultValue={inicial.mascotaId ?? mascotas[0]?.id}>
            {mascotas.map((mascota) => (
              <option key={mascota.id} value={mascota.id}>{mascota.nombre}</option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Fecha" error={erroresCampo.fechaHora}>
          <input type="date" name="fecha" required min={hoy} defaultValue={fechaInicial} />
        </Campo>
        <Campo etiqueta="Hora">
          <input type="time" name="hora" required defaultValue="10:00" />
        </Campo>

        <Campo etiqueta="Lugar" opcional ancho>
          <select
            name="servicioId"
            value={servicioId}
            onChange={(event) => setServicioId(event.target.value)}
            disabled={servicios.cargando}
          >
            <option value="">{servicios.cargando ? "Cargando directorio…" : "Sin definir"}</option>
            {(servicios.datos ?? []).map((servicio) => (
              <option key={servicio.id} value={servicio.id}>
                {servicio.nombre} · {formatearEnum(servicio.tipo)}
              </option>
            ))}
            <option value={OTRO_LUGAR}>Otro lugar…</option>
          </select>
          {servicioElegido && (
            <small className="campo-ayuda">
              {[servicioElegido.direccion, servicioElegido.horario].filter(Boolean).join(" · ")}
            </small>
          )}
        </Campo>

        {servicioId === OTRO_LUGAR && (
          <Campo etiqueta="¿Dónde?" error={erroresCampo.lugar} ancho>
            <input name="lugar" required maxLength={160} placeholder="Consultorio de la Dra. Rojas" autoFocus />
          </Campo>
        )}

        <Campo etiqueta="Veterinario" opcional error={erroresCampo.veterinario} ancho>
          <input name="veterinario" maxLength={120} placeholder="Dra. Pérez" />
        </Campo>
        <Campo etiqueta="Motivo" opcional error={erroresCampo.motivo} ancho>
          <textarea name="motivo" maxLength={500} rows={2} placeholder="Control anual, vacuna, baño…" />
        </Campo>

        <PieFormulario error={error} enviando={enviando} textoGuardar="Agendar cita" onCancelar={onCerrar} />
      </form>
    </Modal>
  );
}

function DirectoryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");

  const visibleServices = services.filter((service) => {
    const matchesQuery = `${service.name} ${service.address}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "Todos" || filter === "Más cercanos" || service.type === filter.slice(0, -1);
    return matchesQuery && matchesFilter;
  });

  return (
    <AppShell>
      <PageHeading title="Directorio de servicios" subtitle="Veterinarias y guarderías cercanas, conectadas a tu agenda." />
      <label className="search-box">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o zona…" />
      </label>
      <div className="directory-filters">
        <FilterGroup options={["Todos", "Veterinarias", "Guarderías", "Más cercanos"]} value={filter} onChange={setFilter} />
      </div>

      <div className="directory-layout">
        <section className="service-grid" aria-label="Servicios cercanos">
          {visibleServices.map((service) => (
            <article className="service-card panel" key={service.name}>
              <div className={`service-card__visual service-card__visual--${service.tone}`}>
                <span>{service.type}</span>
              </div>
              <div className="service-card__body">
                <h2>{service.name}</h2>
                <p><MapPin size={14} /> {service.distance} · {service.address}</p>
                <p className="rating">★ <strong>{service.rating}</strong> <span>({service.reviews})</span></p>
                <div className="service-card__actions">
                  <button className="button button--outline" type="button"><Phone size={15} /> Llamar</button>
                  <button className="button button--dark" type="button" onClick={() => navigate("/citas", { state: { nuevaCita: {} } })}>Agendar</button>
                </div>
              </div>
            </article>
          ))}
          {visibleServices.length === 0 && <div className="empty-state panel">No encontramos servicios con ese criterio.</div>}
        </section>

        <aside className="panel map-card">
          <div className="map-visual" aria-label="Mapa esquemático de servicios cercanos">
            <MapMarker number="1" className="marker-1" />
            <MapMarker number="2" className="marker-2" />
            <MapMarker number="3" className="marker-3" />
            <MapMarker number="4" className="marker-4" />
            <span className="you-marker"><b>Tú</b></span>
          </div>
          <div className="map-list">
            <h2>Servicios en el mapa</h2>
            {services.map((service, index) => (
              <div key={service.name}><span>{index + 1} · {service.name}</span><small>{service.distance}</small></div>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function MapMarker({ number, className }) {
  return <span className={`map-marker ${className}`}><MapPin size={27} fill="currentColor" /><b>{number}</b></span>;
}

const CLAVE_PREFERENCIAS = "cuidapatas.preferencias";

const PREFERENCIAS_INICIALES = {
  recordatoriosCorreo: true,
  notificacionesPush: false,
  resumenSemanal: true,
  diasAnticipacion: "7",
};

function leerPreferencias() {
  try {
    return { ...PREFERENCIAS_INICIALES, ...JSON.parse(localStorage.getItem(CLAVE_PREFERENCIAS)) };
  } catch {
    return PREFERENCIAS_INICIALES;
  }
}

/**
 * Configuración de la cuenta.
 *
 * DEMO: todavía no hay endpoints para editar el perfil, cambiar la contraseña
 * ni cambiar de plan. Las preferencias de notificación se guardan solo en este
 * navegador (localStorage) y los demás botones muestran una confirmación sin
 * llamar a la API.
 */
function ConfiguracionPage() {
  const { usuario, salir } = useAuth();
  const navigate = useNavigate();
  const [preferencias, setPreferencias] = useState(leerPreferencias);
  const [aviso, setAviso] = useAvisoTemporal();

  const esPremium = usuario?.plan === "PREMIUM";

  function cambiarPreferencia(clave, valor) {
    setPreferencias((actuales) => {
      const nuevas = { ...actuales, [clave]: valor };
      localStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(nuevas));
      return nuevas;
    });
    setAviso("Preferencias actualizadas.");
  }

  function guardarPerfil(event) {
    event.preventDefault();
    setAviso("Cambios del perfil guardados.");
  }

  return (
    <AppShell>
      <PageHeading title="Configuración" subtitle="Tu perfil, notificaciones y plan." />
      <AvisoExito mensaje={aviso} />

      <div className="config-grid">
        <section className="panel content-panel">
          <div className="panel-title-row"><h2><UserRound size={18} /> Perfil</h2></div>
          <form className="form-modal" onSubmit={guardarPerfil}>
            <Campo etiqueta="Nombre" ancho>
              <input name="nombre" defaultValue={usuario?.nombre ?? ""} maxLength={120} />
            </Campo>
            <Campo etiqueta="Correo electrónico">
              <input type="email" defaultValue={usuario?.correo ?? ""} disabled />
            </Campo>
            <Campo etiqueta="Teléfono" opcional>
              <input type="tel" name="telefono" defaultValue={usuario?.telefono ?? ""} maxLength={30} />
            </Campo>
            <div className="modal__acciones">
              <PrimaryButton type="submit" icon={Check}>Guardar cambios</PrimaryButton>
            </div>
          </form>
        </section>

        <section className="panel content-panel">
          <div className="panel-title-row"><h2><Bell size={18} /> Notificaciones</h2></div>
          <Interruptor
            etiqueta="Recordatorios por correo"
            detalle="Vacunas, desparasitaciones y citas próximas."
            activo={preferencias.recordatoriosCorreo}
            onCambiar={(valor) => cambiarPreferencia("recordatoriosCorreo", valor)}
          />
          <Interruptor
            etiqueta="Notificaciones en el navegador"
            detalle="Un aviso el mismo día de cada evento."
            activo={preferencias.notificacionesPush}
            onCambiar={(valor) => cambiarPreferencia("notificacionesPush", valor)}
          />
          <Interruptor
            etiqueta="Resumen semanal"
            detalle="Cada lunes, el estado de salud de todas tus mascotas."
            activo={preferencias.resumenSemanal}
            onCambiar={(valor) => cambiarPreferencia("resumenSemanal", valor)}
          />
          <Campo etiqueta="Avisarme con anticipación de">
            <select
              value={preferencias.diasAnticipacion}
              onChange={(event) => cambiarPreferencia("diasAnticipacion", event.target.value)}
            >
              <option value="3">3 días</option>
              <option value="7">7 días</option>
              <option value="15">15 días</option>
            </select>
          </Campo>
        </section>

        <section className={`panel content-panel plan-card ${esPremium ? "plan-card--premium" : ""}`}>
          <div className="panel-title-row"><h2><Crown size={18} /> Tu plan</h2></div>
          <strong className="plan-card__nombre">{esPremium ? "Premium" : "Gratuito"}</strong>
          <ul>
            <li><Check size={15} /> {esPremium ? "Mascotas ilimitadas" : "Hasta 2 mascotas"}</li>
            <li><Check size={15} /> Historial de vacunas y medicamentos</li>
            <li><Check size={15} /> Agenda de citas</li>
            {esPremium && <li><Check size={15} /> Recordatorios por WhatsApp</li>}
          </ul>
          <button
            className={`button ${esPremium ? "button--outline" : "button--primary"}`}
            type="button"
            onClick={() =>
              setAviso(esPremium ? "Tu plan Premium está activo." : "Pronto vas a poder mejorar tu plan desde acá.")
            }
          >
            {esPremium ? "Administrar plan" : "Mejorar a Premium"}
          </button>
        </section>

        <section className="panel content-panel">
          <div className="panel-title-row"><h2><ShieldCheck size={18} /> Seguridad</h2></div>
          <p className="sin-datos">Tu sesión se cierra sola a las 8 horas de haber iniciado.</p>
          <div className="config-acciones">
            <button
              className="button button--outline"
              type="button"
              onClick={() => setAviso("Te enviamos un correo para cambiar la contraseña.")}
            >
              <LockKeyhole size={16} /> Cambiar contraseña
            </button>
            <button
              className="button button--outline"
              type="button"
              onClick={() => {
                salir();
                navigate("/login", { replace: true });
              }}
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

/** Interruptor de encendido/apagado con texto descriptivo. */
function Interruptor({ etiqueta, detalle, activo, onCambiar }) {
  return (
    <label className="interruptor">
      <span>
        <strong>{etiqueta}</strong>
        <small>{detalle}</small>
      </span>
      <input type="checkbox" role="switch" checked={activo} onChange={(event) => onCambiar(event.target.checked)} />
      <i aria-hidden="true" />
    </label>
  );
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="not-found">
      <Logo />
      <h1>Esta pantalla no forma parte del primer avance.</h1>
      <PrimaryButton icon={ChevronLeft} onClick={() => navigate("/login")}>Volver al acceso</PrimaryButton>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Única ruta pública. */}
      <Route path="/login" element={<AuthPage />} />

      {/* Todo lo demás exige sesión: sin token, RutaProtegida redirige a /login. */}
      <Route path="/inicio" element={<RutaProtegida><InicioPage /></RutaProtegida>} />
      <Route path="/mascotas" element={<RutaProtegida><MisMascotasPage /></RutaProtegida>} />
      <Route path="/mascotas/:mascotaId" element={<RutaProtegida><PetProfilePage /></RutaProtegida>} />
      <Route path="/salud" element={<RutaProtegida><HealthPage /></RutaProtegida>} />
      <Route path="/citas" element={<RutaProtegida><CalendarPage /></RutaProtegida>} />
      <Route path="/calendario" element={<RutaProtegida><CalendarPage /></RutaProtegida>} />
      <Route path="/directorio" element={<RutaProtegida><DirectoryPage /></RutaProtegida>} />
      <Route path="/configuracion" element={<RutaProtegida><ConfiguracionPage /></RutaProtegida>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
