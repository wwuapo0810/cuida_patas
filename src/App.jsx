import { useMemo, useState } from "react";
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
} from "react-router-dom";

const navItems = [
  { label: "Inicio", icon: Home, disabled: true },
  { label: "Mis mascotas", icon: UsersRound, to: "/mascotas/max" },
  { label: "Salud", icon: Heart, to: "/salud" },
  { label: "Citas", icon: CalendarDays, to: "/citas" },
  { label: "Directorio", icon: MapPin, to: "/directorio" },
  { label: "Configuración", icon: Settings, disabled: true },
];

const mobileNavItems = navItems.filter((item) => item.to);

const healthRecords = [
  {
    pet: "Max",
    tone: "orange",
    type: "Vacuna antirrábica",
    date: "28 jul 2026",
    next: "28 jul 2027",
    status: "Al día",
    statusTone: "good",
  },
  {
    pet: "Max",
    tone: "orange",
    type: "Desparasitación interna",
    date: "13 mayo 2026",
    next: "20 agosto 2026",
    status: "Vence en 7 días",
    statusTone: "warning",
  },
  {
    pet: "Luna",
    tone: "teal",
    type: "Vacuna triple felina",
    date: "2 feb 2026",
    next: "2 feb 2027",
    status: "Al día",
    statusTone: "good",
  },
  {
    pet: "Luna",
    tone: "teal",
    type: "Desparasitación externa",
    date: "1 junio 2026",
    next: "1 julio 2026",
    status: "Vencido",
    statusTone: "danger",
  },
];

const medicationRecords = [
  {
    pet: "Max",
    tone: "orange",
    medication: "Antipulgas oral",
    dose: "1 tableta",
    frequency: "Cada 30 días",
    validity: "Vigente hasta 4 sep",
  },
  {
    pet: "Luna",
    tone: "teal",
    medication: "Suplemento articular",
    dose: "5 ml",
    frequency: "1 vez al día",
    validity: "Vigente hasta 15 sep",
  },
];

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
      </nav>
      <div className="sidebar__note">
        <strong>2 mascotas registradas</strong>
        <span>Mantén sus perfiles actualizados para recibir mejores recordatorios.</span>
      </div>
    </aside>
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

function PrimaryButton({ children, icon: Icon = Plus, type = "button", onClick }) {
  return (
    <button className="button button--primary" type={type} onClick={onClick}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

function AuthPage() {
  const navigate = useNavigate();

  function handleLogin(event) {
    event.preventDefault();
    navigate("/mascotas/max");
  }

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
            <button className="is-selected" type="button">Iniciar sesión</button>
            <button type="button" aria-disabled="true">Crear cuenta</button>
          </div>
          <div className="auth-form__heading">
            <h2>Bienvenida de nuevo</h2>
            <p>Ingresa tus datos para ver el estado de tus mascotas.</p>
          </div>
          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              Correo electrónico
              <span className="input-with-icon">
                <Mail size={17} />
                <input
                  type="email"
                  name="email"
                  defaultValue="maria.fernandez@correo.com"
                  autoComplete="email"
                />
              </span>
            </label>
            <label>
              Contraseña
              <span className="input-with-icon">
                <LockKeyhole size={17} />
                <input
                  type="password"
                  name="password"
                  defaultValue="cuidapatas"
                  autoComplete="current-password"
                />
              </span>
            </label>
            <div className="auth-options">
              <label className="check-label">
                <input type="checkbox" defaultChecked />
                Recordarme
              </label>
              <button className="link-button" type="button">¿Olvidaste tu contraseña?</button>
            </div>
            <PrimaryButton type="submit" icon={null}>Iniciar sesión</PrimaryButton>
          </form>
          <div className="divider"><span>o continúa con</span></div>
          <div className="social-row">
            <button className="button button--outline" type="button"><strong className="google-g">G</strong> Google</button>
            <button className="button button--outline" type="button"><strong className="facebook-f">f</strong> Facebook</button>
          </div>
          <p className="auth-register">¿Aún no tienes cuenta? <button className="link-button link-button--orange" type="button">Regístrate gratis</button></p>
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

function PetProfilePage() {
  return (
    <AppShell>
      <div className="breadcrumb">Mis mascotas / <strong>Max</strong></div>
      <section className="pet-hero panel">
        <div className="pet-hero__identity">
          <div className="pet-avatar-wrap">
            <PetAvatar />
            <span className="status-chip status-chip--good">Al día</span>
          </div>
          <div>
            <h1>Max</h1>
            <p>Golden Retriever · Macho · 3 años</p>
            <div className="chip-row">
              <span className="soft-chip"><Heart size={14} /> 28 kg</span>
              <span className="soft-chip"><CalendarDays size={14} /> Nació 12 mar 2023</span>
              <span className="soft-chip"><Check size={14} /> Vacunas al día</span>
            </div>
          </div>
        </div>
        <div className="pet-hero__actions">
          <PrimaryButton icon={Edit3}>Editar perfil</PrimaryButton>
          <button className="button button--outline" type="button"><Plus size={16} /> Nueva cita</button>
        </div>
      </section>

      <div className="profile-tabs" role="tablist" aria-label="Secciones del perfil">
        <button className="is-active" type="button">Información general</button>
        <button type="button">Salud</button>
        <button type="button">Citas</button>
        <button type="button">Documentos</button>
      </div>

      <div className="profile-grid">
        <div className="profile-grid__main">
          <section className="panel content-panel">
            <div className="panel-title-row"><h2>Datos básicos</h2><button className="link-button" type="button">Editar</button></div>
            <div className="detail-grid">
              <Detail label="Nombre" value="Max" />
              <Detail label="Especie" value="Perro" />
              <Detail label="Raza" value="Golden Retriever" />
              <Detail label="Sexo" value="Macho" />
              <Detail label="Fecha de nacimiento" value="12 marzo 2023" />
              <Detail label="Peso actual" value="28 kg" />
            </div>
            <div className="metric-row">
              <Metric value="4" label="Vacunas registradas" />
              <Metric value="2" label="Citas este año" />
              <Metric value="1" label="Medicamento activo" />
            </div>
          </section>

          <section className="panel content-panel activity-panel">
            <div className="panel-title-row"><h2>Actividad reciente</h2><button className="link-button" type="button">Ver historial →</button></div>
            <Activity icon={ShieldCheck} title="Vacuna antirrábica aplicada" meta="Hace 2 semanas · Clínica San Rafael" />
            <Activity icon={CalendarDays} title="Cita de control realizada" meta="Hace 1 mes · Dra. Camila Rojas" />
            <Activity icon={Heart} title="Peso actualizado a 28 kg" meta="Hace 1 mes" />
          </section>
        </div>

        <aside className="profile-grid__aside">
          <section className="panel content-panel">
            <h2>Propietario</h2>
            <div className="owner-row"><span className="owner-avatar" /><div><strong>María Fernández</strong><span>mfernandez@correo.com</span></div></div>
          </section>
          <section className="panel content-panel reminder-card">
            <h2>Próximo recordatorio</h2>
            <div className="reminder-row"><span className="reminder-icon"><Clock3 size={18} /></span><div><strong>Desparasitación pendiente</strong><span>Vence en 7 días · 20 de agosto</span></div></div>
            <button className="button button--outline" type="button">Agendar ahora</button>
          </section>
          <section className="panel content-panel">
            <h2>Veterinaria asociada</h2>
            <div className="owner-row"><span className="clinic-avatar" /><div><strong>Veterinaria San Rafael</strong><span>1.2 km · Última visita hace 1 mes</span></div></div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
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

function HealthPage() {
  const [petFilter, setPetFilter] = useState("Todas las mascotas");
  const [recordFilter, setRecordFilter] = useState("Todo");

  const filteredHealth = useMemo(
    () => healthRecords.filter((record) => petFilter === "Todas las mascotas" || record.pet === petFilter),
    [petFilter],
  );

  return (
    <AppShell>
      <PageHeading
        title="Salud"
        subtitle="Vacunas, desparasitaciones y medicamentos de tus mascotas."
        action={<PrimaryButton>Nuevo registro</PrimaryButton>}
      />
      <div className="toolbar-row">
        <FilterGroup options={["Todas las mascotas", "Max", "Luna"]} value={petFilter} onChange={setPetFilter} />
        <FilterGroup options={["Todo", "Vacunas", "Desparasitación", "Medicamentos"]} value={recordFilter} onChange={setRecordFilter} />
      </div>
      <div className="summary-grid summary-grid--four">
        <Summary icon={Check} value="6" label="Registros al día" tone="good" />
        <Summary icon={Clock3} value="2" label="Próximos a vencer" tone="warning" />
        <Summary icon={CircleAlert} value="1" label="Vencido" tone="danger" />
        <Summary icon={Pill} value="2" label="Medicamentos activos" tone="teal" />
      </div>

      {recordFilter !== "Medicamentos" && (
        <DataSection title="Vacunas y desparasitación" action="Exportar historial">
          <div className="data-table data-table--health" role="table" aria-label="Vacunas y desparasitación">
            <div className="data-table__head" role="row">
              <span>Mascota</span><span>Tipo</span><span>Fecha de aplicación</span><span>Próxima fecha</span><span>Estado</span><span />
            </div>
            {filteredHealth.map((record) => (
              <div className="data-table__row" role="row" key={`${record.pet}-${record.type}`}>
                <span data-label="Mascota"><PetAvatar size="small" tone={record.tone} /> {record.pet}</span>
                <strong data-label="Tipo">{record.type}</strong>
                <span data-label="Aplicación">{record.date}</span>
                <span data-label="Próxima fecha">{record.next}</span>
                <span data-label="Estado"><span className={`status-chip status-chip--${record.statusTone}`}>{record.status}</span></span>
                <button className="table-action" type="button" aria-label={`Editar ${record.type}`}><Edit3 size={15} /></button>
              </div>
            ))}
          </div>
        </DataSection>
      )}

      {recordFilter !== "Vacunas" && recordFilter !== "Desparasitación" && (
        <DataSection title="Medicamentos activos">
          <div className="data-table data-table--medication" role="table" aria-label="Medicamentos activos">
            <div className="data-table__head" role="row">
              <span>Mascota</span><span>Medicamento</span><span>Dosis</span><span>Frecuencia</span><span>Vigencia</span><span />
            </div>
            {medicationRecords
              .filter((record) => petFilter === "Todas las mascotas" || record.pet === petFilter)
              .map((record) => (
                <div className="data-table__row" role="row" key={record.medication}>
                  <span data-label="Mascota"><PetAvatar size="small" tone={record.tone} /> {record.pet}</span>
                  <strong data-label="Medicamento">{record.medication}</strong>
                  <span data-label="Dosis">{record.dose}</span>
                  <span data-label="Frecuencia">{record.frequency}</span>
                  <span data-label="Vigencia"><span className="status-chip status-chip--good">{record.validity}</span></span>
                  <button className="table-action" type="button" aria-label={`Editar ${record.medication}`}><Edit3 size={15} /></button>
                </div>
              ))}
          </div>
        </DataSection>
      )}
    </AppShell>
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
      <Route path="/login" element={<AuthPage />} />
      <Route path="/mascotas/max" element={<PetProfilePage />} />
      <Route path="/salud" element={<HealthPage />} />
      <Route path="/citas" element={<CalendarPage />} />
      <Route path="/calendario" element={<CalendarPage />} />
      <Route path="/directorio" element={<DirectoryPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
