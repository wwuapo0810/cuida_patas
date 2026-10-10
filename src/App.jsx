import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
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
import { useRecursoApi } from "./hooks/useRecursoApi";
import { useSaludUsuario } from "./hooks/useSaludUsuario";
import { listarMascotas, obtenerMascota } from "./services/mascotaService";
import { listarSaludDeMascota } from "./services/saludService";
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
  { label: "Inicio", icon: Home, disabled: true },
  // /mascotas resuelve a la primera mascota del usuario (ver MisMascotasPage).
  { label: "Mis mascotas", icon: UsersRound, to: "/mascotas" },
  { label: "Salud", icon: Heart, to: "/salud" },
  { label: "Citas", icon: CalendarDays, to: "/citas" },
  { label: "Directorio", icon: MapPin, to: "/directorio" },
  { label: "Configuración", icon: Settings, disabled: true },
];

const mobileNavItems = navItems.filter((item) => item.to);

/*
 * Los datos de vacunas, desparasitaciones y medicamentos ya no se escriben a
 * mano: salen del backend (ver HealthPage y PetProfilePage). Los arreglos de
 * citas y de servicios siguen siendo de ejemplo porque esas pantallas todavía
 * no tienen endpoint.
 */
const appointments = [
  {
    day: "06",
    title: "Cita de control — Max",
    place: "Clínica Veterinaria San Rafael",
    meta: "3:00 p. m.  ·  Dra. Camila Rojas",
    status: "Confirmada",
    tone: "good",
  },
  {
    day: "09",
    title: "Aplicación de vacuna — Luna",
    place: "Veterinaria San Rafael",
    meta: "10:30 a. m.  ·  Dr. Luis Herrera",
    status: "Por confirmar",
    tone: "warning",
  },
  {
    day: "20",
    title: "Desparasitación — Max",
    place: "Clínica Veterinaria San Rafael",
    meta: "2:00 p. m.  ·  Dra. Camila Rojas",
    status: "Confirmada",
    tone: "good",
  },
];

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
            {mobileNavItems.map(({ label, to }) => (
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
   * abrir. Si no, la primera pantalla de la aplicación es Salud.
   */
  const destino = location.state?.destino ?? "/salud";

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

/**
 * Redirige /mascotas a la primera mascota del usuario.
 *
 * El menú lateral no puede saber qué ids tiene el usuario, así que apunta a
 * /mascotas y esta pantalla resuelve a dónde ir. Antes el enlace iba a
 * /mascotas/max, un id escrito a mano en el prototipo.
 */
function MisMascotasPage() {
  const { usuario } = useAuth();
  const usuarioId = usuario?.id;

  const cargar = useCallback(
    ({ signal }) => listarMascotas(usuarioId, { signal }),
    [usuarioId],
  );

  const { datos, cargando, error, recargar } = useRecursoApi(cargar, {
    activo: Boolean(usuarioId),
  });

  if (cargando) {
    return (
      <AppShell>
        <PanelCargando mensaje="Cargando tus mascotas…" />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <PageHeading title="Mis mascotas" />
        <AvisoError error={error} onReintentar={recargar} />
      </AppShell>
    );
  }

  if (!datos || datos.length === 0) {
    return (
      <AppShell>
        <PageHeading title="Mis mascotas" subtitle="Todavía no hay ninguna registrada." />
        <div className="empty-state panel">
          Agregá tu primera mascota para empezar a llevar su historial de salud.
        </div>
      </AppShell>
    );
  }

  return <Navigate to={`/mascotas/${datos[0].id}`} replace />;
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

  /*
   * El prototipo usaba la ruta /mascotas/max. Si alguien llega con un id que no
   * es un número (un enlace viejo o un marcador del navegador), se manda a
   * /mascotas en vez de pedirle al backend un id inválido.
   */
  const idValido = /^\d+$/.test(mascotaId ?? "");

  const cargar = useCallback(
    async ({ signal }) => {
      const [mascota, salud] = await Promise.all([
        obtenerMascota(mascotaId, { signal }),
        listarSaludDeMascota(mascotaId, { signal }),
      ]);
      return { mascota, salud };
    },
    [mascotaId],
  );

  const { datos, cargando, error, recargar } = useRecursoApi(cargar, { activo: idValido });

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

  const { mascota, salud } = datos;
  const registros = [...salud.vacunas, ...salud.desparasitaciones, ...salud.medicamentos];

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
      <div className="breadcrumb">Mis mascotas / <strong>{mascota.nombre}</strong></div>
      <section className="pet-hero panel">
        <div className="pet-hero__identity">
          <div className="pet-avatar-wrap">
            <PetAvatar tone={tonoDeMascota(0)} />
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
          <button className="button button--outline" type="button"><Plus size={16} /> Nueva cita</button>
        </div>
      </section>

      {/* Pestañas del prototipo: navegación entre secciones, todavía sin implementar. */}
      <div className="profile-tabs" role="tablist" aria-label="Secciones del perfil">
        <button className="is-active" type="button">Información general</button>
        <button type="button" aria-disabled="true">Salud</button>
        <button type="button" aria-disabled="true">Citas</button>
        <button type="button" aria-disabled="true">Documentos</button>
      </div>

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
              <NavLink className="link-button" to="/salud">Ver historial →</NavLink>
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
            <NavLink className="button button--outline" to="/citas">Agendar ahora</NavLink>
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

  const [petFilter, setPetFilter] = useState(TODAS_LAS_MASCOTAS);
  const [recordFilter, setRecordFilter] = useState("Todo");

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
        action={<PrimaryButton>Nuevo registro</PrimaryButton>}
      />

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

function CalendarPage() {
  const days = [27, 28, 29, 30, 31, ...Array.from({ length: 30 }, (_, index) => index + 1)];

  return (
    <AppShell>
      <PageHeading
        title="Citas y calendario"
        subtitle="Agenda unificada de tus mascotas con recordatorios automáticos."
        action={<PrimaryButton>Nueva cita</PrimaryButton>}
      />
      <div className="calendar-layout">
        <section className="panel calendar-card">
          <div className="calendar-card__heading">
            <h2>Agosto 2026</h2>
            <div><button className="icon-button" type="button" aria-label="Mes anterior"><ChevronLeft size={18} /></button><button className="icon-button" type="button" aria-label="Mes siguiente"><ChevronRight size={18} /></button></div>
          </div>
          <div className="calendar-weekdays" aria-hidden="true">
            {[
              "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom",
            ].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="calendar-grid">
            {days.map((day, index) => {
              const outside = index < 5;
              const event = !outside && day === 6 ? "Max · 3pm" : !outside && day === 9 ? "Vacuna Luna" : !outside && day === 20 ? "Desparasit. Max" : null;
              return (
                <button
                  key={`${day}-${index}`}
                  className={`calendar-day ${outside ? "is-outside" : ""} ${day === 6 && !outside ? "is-selected" : ""}`}
                  type="button"
                >
                  <span>{day}</span>
                  {event && <small className={day === 9 ? "event-orange" : "event-teal"}>{event}</small>}
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
          <FilterGroup options={["Todas", "Max", "Luna"]} value="Todas" onChange={() => {}} />
          <div className="agenda-list">
            {appointments.map((appointment) => (
              <article className="appointment" key={appointment.day}>
                <time><strong>{appointment.day}</strong><span>AGO</span></time>
                <div className="appointment__copy"><strong>{appointment.title}</strong><span>{appointment.place}</span><span>{appointment.meta}</span></div>
                <span className={`status-chip status-chip--${appointment.tone}`}>{appointment.status}</span>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
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
                  <button className="button button--dark" type="button" onClick={() => navigate("/citas")}>Agendar</button>
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
      <Route path="/mascotas" element={<RutaProtegida><MisMascotasPage /></RutaProtegida>} />
      <Route path="/mascotas/:mascotaId" element={<RutaProtegida><PetProfilePage /></RutaProtegida>} />
      <Route path="/salud" element={<RutaProtegida><HealthPage /></RutaProtegida>} />
      <Route path="/citas" element={<RutaProtegida><CalendarPage /></RutaProtegida>} />
      <Route path="/calendario" element={<RutaProtegida><CalendarPage /></RutaProtegida>} />
      <Route path="/directorio" element={<RutaProtegida><DirectoryPage /></RutaProtegida>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
