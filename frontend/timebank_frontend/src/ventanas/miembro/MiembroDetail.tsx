import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router';
import { MIEMBROS_DEMO } from '../../mocks/miembros.mocks';
import { SERVICIOS_DEMO } from '../../mocks/servicios.mocks';
import type { ServicioCatalogo } from '../../tipos/servicio';
import type { MiembroPublico } from '../../tipos/miembro';
import {
  ArrowLeft,
  Award,
  Ban,
  Check,
  Flag,
  MessageCircle,
  MoreHorizontal,
  Star,
  TriangleAlert,
  Users,
} from 'lucide-react';

/**
 * VISTA: Perfil público de otro miembro del Banco de Tiempo.
 *
 * Migración visual del mockup de Figma.
 * - Sin NavigationContext, llamadas a API ni operaciones reales.
 * - Los botones tienen animaciones; solo el menú de opciones usa estado local.
 * - Los datos simulados pueden reemplazarse mediante las props del componente.
 * - Secciones identificadas con comentarios y atributos data-section.
 *
 * Ubicación: src/ventanas/miembro/MiembroDetail.tsx
 */

// ───────────────────── 00. TIPOS  ─────────────────────
interface MiembroDetailProps {
}


// ───────────────────── 00.1 ESTILOS DE INTERACCIÓN ─────────────────────
// Solo generan retroalimentación visual; no implican navegación.
const ANIMACION_BOTON =
  'cursor-pointer transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out motion-safe:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2 motion-reduce:transition-none';
const ANIMACION_ELEVACION = 'motion-safe:hover:-translate-y-0.5 hover:shadow-md';

// ───────────────────── 00.2 ELEMENTOS VISUALES LOCALES ─────────────────────
function AvatarMiembro({ miembro }: { miembro: MiembroPublico }) {
  const iniciales = miembro.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <div
      className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full ring-4 ring-white"
      style={{ backgroundColor: miembro.avatarColor ?? '#3C9DA0' }}
      aria-label={`Avatar de ${miembro.name}`}
    >
      {miembro.avatar ? (
        <img
          src={miembro.avatar}
          alt={`Foto de ${miembro.name}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-2xl font-bold text-white">
          {iniciales}
        </span>
      )}
    </div>
  );
}

function Etiqueta({ texto, variante }: { texto: string; variante: 'turquesa' | 'amarillo' }) {
  const colores =
    variante === 'turquesa'
      ? 'bg-[#E8F5F6] text-[#3C9DA0]'
      : 'bg-[#FFF9C4] text-[#5A5A00]';

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${colores}`}>
      {texto}
    </span>
  );
}

function SeccionPerfil({
  titulo,
  identificador,
  children,
}: {
  titulo: string;
  identificador: string;
  children: ReactNode;
}) {
  return (
    <section
      data-section={identificador}
      aria-label={titulo}
      className="mb-3 rounded-2xl border border-[#E8E8E8] bg-white p-4"
    >
      <h2 className="mb-3 text-sm font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

// ───────────────────── COMPONENTE PRINCIPAL ─────────────────────

export default function MiembroDetail({
}: MiembroDetailProps) {

  // 01. IDENTIFICAR EL MIEMBRO DESDE LA URL
  const { miembroId } = useParams<{ miembroId: string }>();

  // 02. BUSCAR EL MIEMBRO EN LOS MOCKS
  const miembro = miembroId
    ? MIEMBROS_DEMO[miembroId]
    : undefined;

  // 03. ESTADOS LOCALES
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  // 04. SERVICIOS VISIBLES DEL MIEMBRO SELECCIONADO
  const serviciosVisibles = SERVICIOS_DEMO.filter(
    (servicio) =>
      servicio.userId === miembroId &&
      servicio.isVisible
  );

  // 05. VALIDAR QUE EL MIEMBRO EXISTA
  if (!miembro) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F6]">
        <p className="text-sm text-[#737373]">
          Miembro no encontrado.
        </p>
      </main>
    );
  }

  // 06. DATOS OPCIONALES DEL PERFIL
  const intereses = miembro.interests ?? [];
  const habilidades = miembro.skills ?? [];
  const organizaciones = miembro.organizations ?? [];
  const reconocimientos = miembro.recognitions ?? [];

  // 07. ESTADÍSTICAS
  const estadisticas = [
    {
      label: 'Intercambios',
      value: miembro.completedExchanges ?? '—',
    },
    {
      label: 'Servicios',
      value: serviciosVisibles.length,
    },
    {
      label: 'Reconocimientos',
      value: reconocimientos.length,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      {/* 01. BANNER SUPERIOR: color del miembro y controles de cabecera */}
      <header
        data-section="banner-perfil"
        className="relative h-36"
        style={{ backgroundColor: miembro.avatarColor }}
      >
        {/* 01.1 EFECTO DECORATIVO DEL BANNER */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #FFFF00 0%, transparent 60%)' }}
        />

        {/* 01.2 BOTÓN VOLVER Y MENÚ DE OPCIONES */}
        <div className="absolute top-12 right-4 left-4 z-20 flex items-center justify-between">
          <button
            type="button"
            aria-label="Volver"
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 ${ANIMACION_BOTON}`}
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>

          <div className="relative" data-section="menu-opciones">
            <button
              type="button"
              aria-label="Más opciones sobre este miembro"
              aria-expanded={mostrarOpciones}
              aria-controls="menu-opciones-miembro"
              onClick={() => setMostrarOpciones((anterior) => !anterior)}
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 ${ANIMACION_BOTON}`}
            >
              <MoreHorizontal size={20} aria-hidden="true" />
            </button>

            {/* 01.3 MENÚ DESPLEGABLE: solo interfaz, sin reportes o bloqueos reales */}
            <div
              id="menu-opciones-miembro"
              aria-hidden={!mostrarOpciones}
              className={`absolute top-12 right-0 z-30 w-48 origin-top-right overflow-hidden rounded-xl border border-[#E8E8E8] bg-white shadow-lg transition-[opacity,transform,visibility] duration-150 ease-out motion-reduce:transition-none ${mostrarOpciones ? 'visible scale-100 opacity-100' : 'pointer-events-none invisible scale-95 opacity-0'}`}
            >
                <button
                  type="button"
                  onClick={() => setMostrarOpciones(false)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#737373] hover:bg-[#F6F6F6] ${ANIMACION_BOTON}`}
                >
                  <Flag size={16} aria-hidden="true" />
                  Reportar miembro
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarOpciones(false)}
                  className={`flex w-full items-center gap-3 border-t border-[#F0F0F0] px-4 py-3 text-left text-sm text-[#D32F2F] hover:bg-red-50 ${ANIMACION_BOTON}`}
                >
                  <Ban size={16} aria-hidden="true" />
                  Bloquear miembro
                </button>
            </div>
          </div>
        </div>
      </header>

      {/* 02. CONTENIDO PRINCIPAL DEL PERFIL */}
      <main data-section="contenido-perfil" className="relative z-10 mx-auto max-w-2xl px-4">
        {/* 02.1 TARJETA PRINCIPAL: avatar, información, estadísticas y acciones */}
        <article
          data-section="tarjeta-principal"
          className="relative -mt-10 mb-3 rounded-2xl border border-[#E8E8E8] bg-white p-5 shadow-sm"
        >
          {/* 02.2 IDENTIDAD DEL MIEMBRO: avatar superpuesto y nombre bajo el banner */}
          <div data-section="identidad-miembro" className="mb-4 flex items-start gap-4">
            <div className="relative -mt-8 shrink-0">
              <AvatarMiembro miembro={miembro} />
              <div className="absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#FFFF00]">
                <Check size={11} strokeWidth={3} className="text-[#0D0D0D]" aria-hidden="true" />
              </div>
            </div>

            {/* Espacio superior: evita que el nombre se superponga al banner. */}
            <div className="min-w-0 flex-1 pt-1">
              <h1 className="text-lg leading-tight font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {miembro.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span className="text-xs text-[#737373]">{miembro.faculty}</span>
                <span className="text-[#C0C0C0]" aria-hidden="true">·</span>
                <span className={`text-xs font-medium ${miembro.isAvailable ? 'text-green-600' : 'text-[#9E9E9E]'}`}>
                  {typeof miembro.isAvailable === 'boolean' && (
                    <span
                      className={`text-xs font-medium ${
                        miembro.isAvailable ? 'text-green-600' : 'text-[#9E9E9E]'
                      }`}
                    >
                      {miembro.isAvailable ? 'Disponible' : 'No disponible'}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 02.3 BIOGRAFÍA */}
          <p data-section="biografia" className="mb-4 text-sm leading-relaxed text-[#737373]">
            {miembro.bio && (
              <p
                data-section="biografia"
                className="mb-4 text-sm leading-relaxed text-[#737373]"
              >
                {miembro.bio}
              </p>
            )}
          </p>

          {/* 02.4 ESTADÍSTICAS: intercambios, servicios y reconocimientos */}
          <section aria-label="Estadísticas del miembro" data-section="estadisticas" className="mb-4 grid grid-cols-3 gap-2">
            {estadisticas.map((estadistica) => (
              <div key={estadistica.label} className="min-w-0 rounded-xl bg-[#F6F6F6] p-3 text-center">
                <div className="text-xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {estadistica.value}
                </div>
                <div className="mt-0.5 break-words text-[11px] text-[#737373] sm:text-xs">
                  {estadistica.label}
                </div>
              </div>
            ))}
          </section>

          {/* 02.5 ACCIONES PRINCIPALES: apariencia y animaciones, sin navegación */}
          <div data-section="acciones-perfil" className="flex gap-2">
            <button
              type="button"
              className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#3C9DA0] px-2 py-3 text-sm font-bold text-white hover:bg-[#2D8B8E] ${ANIMACION_BOTON} ${ANIMACION_ELEVACION}`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <TriangleAlert size={16} aria-hidden="true" />
              Pedir ayuda
            </button>
            <button
              type="button"
              className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-[#E8E8E8] px-2 py-3 text-sm font-medium text-[#0D0D0D] hover:bg-[#F6F6F6] ${ANIMACION_BOTON} ${ANIMACION_ELEVACION}`}
            >
              <MessageCircle size={16} aria-hidden="true" />
              Enviar mensaje
            </button>
          </div>
        </article>

        {/* 03. INTERESES */}
        {intereses.length > 0 && (
          <SeccionPerfil titulo="Intereses" identificador="intereses">
            <div className="flex flex-wrap gap-2">
              {intereses.map((interes) => (
                <Etiqueta key={interes} texto={interes} variante="turquesa" />
              ))}
            </div>
          </SeccionPerfil>
        )}

        {/* 04. HABILIDADES */}
        {habilidades.length > 0 && (
          <SeccionPerfil titulo="Habilidades" identificador="habilidades">
            <div className="flex flex-wrap gap-2">
              {habilidades.map((habilidad) => (
                <Etiqueta key={habilidad} texto={habilidad} variante="amarillo" />
              ))}
            </div>
          </SeccionPerfil>
        )}

        {/* 05. ORGANIZACIONES */}
        {organizaciones.length > 0 && (
          <SeccionPerfil titulo="Organizaciones" identificador="organizaciones">
            <div className="flex flex-wrap gap-2">
              {organizaciones.map((organizacion) => (
                <div key={organizacion} className="flex items-center gap-1.5 rounded-full bg-[#F6F6F6] px-3 py-1.5">
                  <Users size={13} className="shrink-0 text-[#737373]" aria-hidden="true" />
                  <span className="text-xs text-[#0D0D0D]">{organizacion}</span>
                </div>
              ))}
            </div>
          </SeccionPerfil>
        )}

        {/* 06. SERVICIOS OFRECIDOS: solo servicios visibles */}
        {serviciosVisibles.length > 0 && (
          <SeccionPerfil titulo="Servicios ofrecidos" identificador="servicios-ofrecidos">
            <div className="space-y-3">
              {serviciosVisibles.map((servicio) => (
                <article key={servicio.id} className="flex items-start gap-3 rounded-xl bg-[#F6F6F6] p-3">
                  {/* 06.1 IMAGEN O ÍCONO DEL SERVICIO */}
                  {servicio.imageUrl ? (
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                      <img src={servicio.imageUrl} alt={servicio.title} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: miembro.avatarColor }}
                    >
                      <Star size={22} className="text-white" aria-hidden="true" />
                    </div>
                  )}

                  {/* 06.2 NOMBRE, CATEGORÍA Y DESCRIPCIÓN */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {servicio.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#737373]">{servicio.category}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-[#9E9E9E]">{servicio.description}</p>
                  </div>

                  {/* 06.3 DURACIÓN ESTIMADA */}
                  <span className="mt-0.5 shrink-0 rounded-full bg-[#FFFF00] px-2 py-0.5 text-xs font-bold text-[#0D0D0D]">
                    {servicio.estimatedHours}h
                  </span>
                </article>
              ))}
            </div>
          </SeccionPerfil>
        )}

        {/* 07. RECONOCIMIENTOS RECIBIDOS */}
        {reconocimientos.length > 0 && (
          <SeccionPerfil titulo="Reconocimientos recibidos" identificador="reconocimientos">
            <div className="flex flex-wrap gap-2">
              {reconocimientos.map((reconocimiento) => (
                <span
                  key={reconocimiento}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFF00] px-3 py-1.5 text-xs font-bold text-[#0D0D0D]"
                >
                  <Award size={13} strokeWidth={2} aria-hidden="true" />
                  {reconocimiento}
                </span>
              ))}
            </div>
          </SeccionPerfil>
        )}

        {/* 08. ESPACIO INFERIOR DE LA VISTA */}
        <div aria-hidden="true" className="pb-8" />
      </main>
    </div>
  );
}
