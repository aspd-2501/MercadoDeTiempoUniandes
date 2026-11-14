import { useEffect, useState, type ReactNode } from 'react';
import { obtenerInteresesMiembro, obtenerServiciosMiembro, obtenerReconocimientosMiembro, obtenerIntercambiosRealizados, cambiarVisibilidadPerfil } from '../../api/perfilResumen.api';
import { useMiembroSesion } from '../../contextos/MiembroSesionContext';
import { useNavigate } from 'react-router';
import type { ServicioOfrecidoAPI } from '../../api/serviciosOfrecidos.api';
import {
  Activity,
  Award,
  Bell,
  Check,
  ChevronRight,
  Clock,
  Heart,
  LogOut,
  Pencil,
  Plus,
  Settings,
  Shield,
  Star,
  Users,
} from 'lucide-react';

/**
 * VISTA: Perfil de un miembro del Banco de Tiempo.
 *
 * Este archivo conserva el diseño de Figma. Está organizado en secciones
 * semánticas con comentarios y atributos data-section para ubicar cada bloque.
 *
 * El perfil se lee del contexto global de sesión; intereses, servicios,
 * reconocimientos y acuerdos completados se consultan mediante API.
 */

// ─────────────────────────── TIPOS DE DATOS ───────────────────────────
interface ServicioPerfil {
  id: string;
  title: string;
  category: string;
  description: string;
  estimatedHours?: number;
  imageUrl?: string;
  isVisible: boolean;
}

interface MiembroProfileProps {
  services?: ServicioPerfil[];
  onDonarHoras?: () => void;
  onVerMovimientos?: () => void;
}

// ────────────────────────── DATOS DE PRUEBA ──────────────────────────
// ────────────────────── ELEMENTOS VISUALES LOCALES ──────────────────────
type IconName =
  | 'bell'
  | 'check'
  | 'clock'
  | 'activity'
  | 'heart'
  | 'plus'
  | 'edit'
  | 'users'
  | 'star'
  | 'award'
  | 'chevron-right'
  | 'settings'
  | 'shield'
  | 'logout';

const ICONS = {
  bell: Bell,
  check: Check,
  clock: Clock,
  activity: Activity,
  heart: Heart,
  plus: Plus,
  edit: Pencil,
  users: Users,
  star: Star,
  award: Award,
  'chevron-right': ChevronRight,
  settings: Settings,
  shield: Shield,
  logout: LogOut,
};

// Animaciones compartidas por los botones de esta vista.
// :hover = al pasar el cursor; :active = mientras se presiona;
// :focus-visible = al navegar con teclado. No activan navegación.
const BUTTON_FEEDBACK =
  'cursor-pointer transition-[transform,background-color,color,box-shadow] duration-200 ease-out motion-safe:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2 motion-reduce:transition-none';
const BUTTON_HOVER_LIFT = 'motion-safe:hover:-translate-y-0.5 hover:shadow-md';

function Icon({
  name,
  size = 20,
  className = '',
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const IconComponent = ICONS[name];
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}

function Chip({
  label,
  color,
}: {
  label: string;
  color: 'teal' | 'yellow';
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${
        color === 'teal'
          ? 'bg-[#E8F5F6] text-[#3C9DA0]'
          : 'bg-[#FFFDE7] text-[#6B6500]'
      }`}
    >
      {label}
    </span>
  );
}

function Section({
  title,
  children,
  actionLabel,
  onAction,
}: {
  title: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <section className="mt-3 rounded-2xl border border-[#E8E8E8] bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {title}
        </h2>
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className={`${BUTTON_FEEDBACK} rounded-md px-1 py-0.5 text-xs font-medium text-[#3C9DA0] hover:text-[#2D8B8E] hover:underline`}
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

// ────────────────────────── VISTA PRINCIPAL ──────────────────────────
export default function MiembroProfile({
  services,
  onDonarHoras,
  onVerMovimientos,
}: MiembroProfileProps) {
  // 00. MIEMBRO AUTENTICADO: fuente de datos compartida por todas las ventanas
  const { miembro, perfil, cerrarSesion } = useMiembroSesion();
  const [serviciosApi, setServiciosApi] = useState<ServicioOfrecidoAPI[]>([]);
  const [intereses, setIntereses] = useState<string[]>([]);
  const [reconocimientos, setReconocimientos] = useState<string[]>([]);
  const [intercambios, setIntercambios] = useState<number | null>(null);
  const [visibilidad, setVisibilidad] = useState<boolean | null>(null);
  const [actualizandoVisibilidad, setActualizandoVisibilidad] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  useEffect(() => {
    if (!perfil?.id) return;
    let vigente = true;
    setCargandoDatos(true); setErrorPerfil(null); setVisibilidad(perfil.estadoActividad);
    void Promise.all([
      obtenerServiciosMiembro(perfil.id, true), obtenerInteresesMiembro(perfil.id),
      obtenerReconocimientosMiembro(perfil.id), obtenerIntercambiosRealizados(perfil.id),
    ]).then(([svc, ints, rec, ac]) => {
      if (!vigente) return;
      setServiciosApi(svc); setIntereses(ints.map(c => c.nombre));
      setReconocimientos(rec.map(r => r.reconocimiento?.nombre).filter((n): n is string => Boolean(n)));
      setIntercambios(ac.length);
    }).catch(error => { if (vigente) setErrorPerfil(error instanceof Error ? error.message : 'Error cargando datos personales'); })
      .finally(() => { if (vigente) setCargandoDatos(false); });
    return () => { vigente = false; };
  }, [perfil?.id, perfil?.estadoActividad]);
  async function manejarVisibilidad() {
    if (!perfil || actualizandoVisibilidad) return;
    setActualizandoVisibilidad(true); setErrorPerfil(null);
    try {
      const actualizado = await cambiarVisibilidadPerfil(perfil.id, !(visibilidad ?? perfil.estadoActividad));
      setVisibilidad(actualizado.estadoActividad);
    } catch (error) { setErrorPerfil(error instanceof Error ? error.message : 'No se pudo cambiar la visibilidad.'); }
    finally { setActualizandoVisibilidad(false); }
  }
  const navigate = useNavigate();

  function manejarCerrarSesion() {
    cerrarSesion();
    navigate('/login', { replace: true });
  }

  // Mientras no haya sesión, no mostramos información de un perfil ficticio.
  if (!miembro) {
    return (
      <main className="min-h-screen bg-[#F6F6F6] p-6 text-center">
        <p className="text-sm text-[#737373]">No hay un miembro con sesión iniciada.</p>
      </main>
    );
  }

  const isAvailable = visibilidad ?? perfil?.estadoActividad ?? false;
  const serviciosMostrados: ServicioPerfil[] = services ?? serviciosApi.map(s => ({
    id: s.id, title: s.titulo, category: s.categorias?.map(c => c.categoria?.nombre).filter(Boolean).join(', ') ?? '',
    description: s.descripcion, imageUrl: s.imagen ?? undefined, isVisible: s.visible,
  }));
  const visibleServices = serviciosMostrados.filter((service) => service.isVisible);
  const stats = [
    { label: 'Intercambios', value: intercambios ?? '—' },
    { label: 'Servicios', value: cargandoDatos ? '—' : visibleServices.length },
    { label: 'Reconocimientos', value: cargandoDatos ? '—' : reconocimientos.length },
  ];
  const quickLinks: { icon: IconName; label: string; ruta: string }[] = [
    { icon: 'activity', label: 'Acuerdos pendientes', ruta: '/actividad' },
    { icon: 'clock', label: 'Historial de intercambios', ruta: '/movimientos' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F6F6F6] pb-4">
      {/* 01. BANNER SUPERIOR: fondo decorativo y botón de notificaciones */}
      <header data-section="banner-perfil" className="relative h-32 bg-[#3C9DA0]">
        {/* Fondo decorativo del banner */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #FFFF00 0%, transparent 60%)' }}
        />
        {/* Botón de notificaciones (solo visual) */}
        <button
          type="button"
          aria-label="Notificaciones"
          className={`${BUTTON_FEEDBACK} absolute right-4 top-12 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 motion-safe:hover:scale-105 focus-visible:ring-white focus-visible:ring-offset-[#3C9DA0]`}
        >
          <Icon name="bell" size={20} className="text-white" />
          <span className="absolute right-1 top-1 h-3 w-3 rounded-full border border-[#3C9DA0] bg-[#FFFF00]" />
        </button>
      </header>

      <main data-section="contenido-perfil" className="relative z-10 mx-auto max-w-2xl px-4">
        {/* 02. TARJETA PRINCIPAL: identidad, disponibilidad, saldo y estadísticas */}
        <section
          aria-label="Resumen del perfil"
          data-section="resumen-perfil"
          className="relative -mt-6 overflow-visible rounded-2xl border border-[#E8E8E8] bg-white pt-0 shadow-sm"
        >
          {/* 02.1 IDENTIDAD DEL MIEMBRO: avatar, nombre, facultad y biografía */}
          <header data-section="identidad-miembro" className="px-5 pt-0">
            <div className="mb-3 flex items-start gap-4">
              {/* Avatar: es el único elemento que sobresale por encima de la tarjeta */}
              <div className="relative -mt-3 shrink-0">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3C9DA0] ring-4 ring-white">
                  <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {miembro.initials}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#FFFF00]">
                  <Icon name="check" size={11} strokeWidth={3} className="text-[#0D0D0D]" />
                </div>
              </div>
              {/* Nombre y facultad: deben permanecer debajo del banner */}
              <div className="min-w-0 flex-1 pt-8 pb-1">
                <h1
                  className="break-words text-lg font-bold leading-tight text-[#0D0D0D]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {miembro.name}
                </h1>
                <p className="break-words text-sm text-[#737373]">{perfil?.afiliacionUniandes ?? ''}</p>
              </div>
            </div>

            {/* Biografía */}
            <p className="mb-4 text-sm leading-relaxed text-[#737373]">{miembro.bio}</p>
          </header>

          <div className="px-5 pb-5">
            {/* 02.2 VISIBILIDAD PÚBLICA DEL PERFIL: persistida en backend */}
            <div
              data-section="disponibilidad"
              className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-[#F6F6F6] p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#0D0D0D]">
                  {isAvailable ? 'Perfil visible en búsquedas' : 'Perfil oculto en búsquedas'}
                </p>
                <p className="mt-0.5 text-xs text-[#737373]">
                  {isAvailable ? 'Otros miembros pueden encontrarte' : 'Otros miembros no pueden encontrarte'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isAvailable}
                aria-label="Mostrar perfil en búsquedas"
                disabled={actualizandoVisibilidad}
                onClick={() => void manejarVisibilidad()}
                className={`${BUTTON_FEEDBACK} relative h-6 w-12 shrink-0 rounded-full hover:shadow-md ${isAvailable ? 'bg-[#3C9DA0]' : 'bg-[#D0D0D0]'}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 motion-reduce:transition-none ${isAvailable ? 'translate-x-6' : 'translate-x-0'}`}
                />
              </button>
            </div>

            {errorPerfil && <p className="mb-3 text-xs text-red-600" role="alert">{errorPerfil}</p>}
            {/* 02.3 SALDO DE HORAS: valor disponible y tres botones */}
            <section
              aria-label="Saldo de horas"
              data-section="saldo-horas"
              className="mb-4 rounded-2xl bg-[#FFFF00] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5A5A00]">Saldo disponible</p>

              {/* Valor del saldo */}
              <div className="mb-3 mt-1 flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {miembro.balance}
                  </span>
                  <span className="ml-1 text-lg font-semibold text-[#0D0D0D]">horas</span>
                </div>
                <Icon name="clock" size={28} className="text-[#0D0D0D] opacity-20" strokeWidth={1.5} />
              </div>

              {/* Acciones: movimientos, donar horas y pedir horas (animadas, sin navegación) */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`${BUTTON_FEEDBACK} ${BUTTON_HOVER_LIFT} flex min-w-[100px] flex-1 items-center justify-center gap-1 rounded-xl bg-[#0D0D0D] px-3 py-2 text-xs font-semibold text-white hover:bg-[#292929]`}
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                  onClick={onVerMovimientos}
                >
                  <Icon name="activity" size={12} />
                  Ver movimientos
                </button>
                <button
                  type="button"
                  className={`${BUTTON_FEEDBACK} ${BUTTON_HOVER_LIFT} flex min-w-[80px] flex-1 items-center justify-center gap-1 rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-[#0D0D0D] hover:bg-white`}
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                  onClick={onDonarHoras}
                >
                  <Icon name="heart" size={12} />
                  Donar horas
                </button>
                {/*<button
                  type="button"
                  className={`${BUTTON_FEEDBACK} ${BUTTON_HOVER_LIFT} flex min-w-[80px] flex-1 items-center justify-center gap-1 rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-[#0D0D0D] hover:bg-white`}
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  <Icon name="plus" size={12} />
                  Pedir horas
                </button>*/}
              </div>
            </section>

            {/* 02.4 ESTADÍSTICAS: intercambios, servicios, reconocimientos */}
            <section
              aria-label="Estadísticas del miembro"
              data-section="estadisticas-perfil"
              className="mb-4 grid grid-cols-3 gap-2"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="min-w-0 rounded-xl bg-[#F6F6F6] p-2 text-center sm:p-3">
                  <div className="text-xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {stat.value}
                  </div>
                  <div className="mt-0.5 break-words text-[10px] text-[#737373] sm:text-xs">{stat.label}</div>
                </div>
              ))}
            </section>

            {/* 02.5 BOTÓN EDITAR PERFIL (solo visual) */}
            <button
              type="button"
              className={`${BUTTON_FEEDBACK} flex w-full items-center justify-center gap-2 rounded-xl border border-[#E8E8E8] py-2.5 text-sm font-medium text-[#0D0D0D] hover:border-[#3C9DA0] hover:bg-[#E8F5F6]`}
            >
              <Icon name="edit" size={15} />
              Editar perfil
            </button>
          </div>
        </section>

        {/* 03. INTERESES DEL MIEMBRO */}
        <Section title="Intereses">
          <div className="flex flex-wrap gap-2">
            {intereses.map((interest) => <Chip key={interest} label={interest} color="teal" />)}
          </div>
        </Section>

        {/* 04. HABILIDADES DEL MIEMBRO */}


        {/* 05. ORGANIZACIONES A LAS QUE PERTENECE 
        {false && miembro.organizations.length > 0 && (
          <Section title="Organizaciones">
            <div className="space-y-2">
              {miembro.organizations.map((organization) => (
                <div key={organization} className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#3C9DA0]">
                    <Icon name="users" size={13} className="text-white" />
                  </div>
                  <span className="min-w-0 break-words text-sm text-[#0D0D0D]">{organization}</span>
                </div>
              ))}
            </div>
          </Section>
        )*/}

        {/* 06. SERVICIOS OFRECIDOS POR EL MIEMBRO */}
        <Section title="Servicios ofrecidos" actionLabel="Gestionar" onAction={() => navigate('/mis-servicios')}>
          {cargandoDatos && !services ? <p className="py-4 text-center text-xs text-[#737373]">Cargando servicios…</p> : visibleServices.length === 0 ? (
            <p className="py-4 text-center text-sm text-[#9E9E9E]">Aún no tienes servicios publicados</p>
          ) : (
            <div className="space-y-3">
              {visibleServices.map((service) => (
                <div key={service.id} className="flex items-start gap-3 rounded-xl bg-[#F6F6F6] p-3">
                  {service.imageUrl ? (
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#E8E8E8]">
                      <img src={service.imageUrl} alt={service.title} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#3C9DA0]">
                      <Icon name="star" size={20} className="text-white" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {service.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#737373]">{service.category}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-[#9E9E9E]">{service.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#FFFF00] px-2 py-0.5 text-xs font-bold text-[#0D0D0D]">
                    {service.estimatedHours ? `${service.estimatedHours}h` : 'Servicio'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* 07. RECONOCIMIENTOS DEL MIEMBRO */}
        {reconocimientos.length > 0 && (
          <Section title="Reconocimientos">
            <div className="flex flex-wrap gap-2">
              {reconocimientos.map((recognition) => (
                <span
                  key={recognition}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFF00] px-3 py-1.5 text-xs font-bold text-[#0D0D0D]"
                >
                  <Icon name="award" size={13} strokeWidth={2} />
                  {recognition}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* 08. ACCESOS RÁPIDOS: pendientes, historial, configuración, moderación */}
        <nav
          aria-label="Accesos rápidos del perfil"
          data-section="accesos-rapidos"
          className="mb-6 mt-3 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white"
        >
          {quickLinks.map((item, index) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.ruta)}
              className={`${BUTTON_FEEDBACK} group flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-[#F6F6F6] active:bg-[#E8F5F6] ${
                index < quickLinks.length - 1 ? 'border-b border-[#F0F0F0]' : ''
              }`}
            >
              <Icon name={item.icon} size={18} className="shrink-0 text-[#737373]" />
              <span className="min-w-0 flex-1 text-left text-sm text-[#0D0D0D]">{item.label}</span>
              <Icon name="chevron-right" size={16} className="shrink-0 text-[#C0C0C0] transition-transform duration-200 motion-safe:group-hover:translate-x-1 motion-reduce:transition-none" />
            </button>
          ))}
        </nav>

        {/* 09. PIE DEL PERFIL: cerrar sesión */}
        <footer data-section="cerrar-sesion" className="pb-6 text-center">
          <button
            type="button"
            onClick={manejarCerrarSesion}
            className={`${BUTTON_FEEDBACK} mx-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#D32F2F] hover:bg-red-50 hover:text-[#B71C1C]`}
          >
            <Icon name="logout" size={16} />
            Cerrar sesión
          </button>
        </footer>
      </main>
    </div>
  );
}
