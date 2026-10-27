import {
  Bookmark,
  CalendarDays,
  Check,
  Clock3,
  LayoutGrid,
  Share2,
  Star,
  TriangleAlert,
  UsersRound,
} from 'lucide-react';

import type {DatosPostAyuda, } from '../../tipos/postAyuda';

/**
 * COMPONENTE: Tarjeta de publicación de ayuda.
 *
 * Se usa en listas de publicaciones, por ejemplo Home y Explorar.
 * Muestra tanto solicitudes de ayuda como ofrecimientos de ayuda.
 *
 * Por ahora utiliza datos simulados por defecto. No navega, guarda
 * publicaciones ni comparte contenido por sí solo. Esas acciones se
 * podrán conectar más adelante mediante las props opcionales.
 *
 * Ubicación: src/componentes/posts/PostAyuda.tsx
 */

// ─────────────────── 00. TIPOS Y PROPIEDADES ───────────────────

export interface AutorPostAyuda {
  id: string;
  name: string;
  firstName: string;
  avatar?: string;
  avatarColor?: string;
}

export interface PostAyudaProps {
  /** Publicación que debe aparecer en la tarjeta. */
  post?: DatosPostAyuda;
  /** Datos del miembro que publicó la ayuda. */
  autor?: AutorPostAyuda;
  /** Para conectar posteriormente la ventana PostAyudaDetail. */
  onVerDetalle?: (postId: string) => void;
  /** Para conectar posteriormente la ventana MiembroDetail. */
  onVerAutor?: (miembroId: string) => void;
  /** Acciones aún sin implementación; se dejan listas para conectar. */
  onGuardar?: (postId: string) => void;
  onCompartir?: (postId: string) => void;
}

// ─────────────────── 00.1 DATOS SIMULADOS ───────────────────
const POST_DEMO: DatosPostAyuda = {
  id: 'post-ayuda-demo-1',
  userId: 'miembro-demo-1',
  type: 'help-request',
  title: 'Necesito ayuda con cálculo diferencial',
  description:
    'Busco a alguien que me ayude a repasar ejercicios de derivadas antes del parcial. Podemos reunirnos en la universidad.',
  category: 'Académico / Matemáticas',
  createdAt: 'Hace 2 horas',
  preferredDate: '15 de octubre',
  preferredTime: '2:00 p. m.',
  estimatedHours: 2,
  maxParticipants: 3,
  confirmedParticipants: ['miembro-demo-2'],
};

const AUTOR_DEMO: AutorPostAyuda = {
  id: 'miembro-demo-1',
  name: 'María López',
  firstName: 'María',
  avatarColor: '#3C9DA0',
};

// ─────────────────── 00.2 ESTILOS COMPARTIDOS ───────────────────
const ANIMACION_BOTON =
  'cursor-pointer transition-[transform,background-color,color,box-shadow] duration-200 ease-out ' +
  'motion-safe:active:scale-[0.96] focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2 ' +
  'motion-reduce:transition-none';

// ─────────────────── 00.3 AVATAR LOCAL ───────────────────
// Reemplazo temporal del Avatar compartido del mockup de Figma.
function AvatarAutor({ autor }: { autor: AutorPostAyuda }) {
  const iniciales = autor.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <span
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white"
      style={{ backgroundColor: autor.avatarColor ?? '#3C9DA0' }}
      aria-label={`Avatar de ${autor.name}`}
    >
      {autor.avatar ? (
        <img src={autor.avatar} alt="" className="h-full w-full object-cover" />
      ) : (
        iniciales
      )}
    </span>
  );
}

// ─────────────────── 01. TARJETA POST DE AYUDA ───────────────────
export default function PostAyuda({
  post = POST_DEMO,
  autor = AUTOR_DEMO,
  onVerDetalle,
  onVerAutor,
  onGuardar,
  onCompartir,
}: PostAyudaProps) {
  // 01.1 DATOS DERIVADOS: tipo de post y cupos disponibles.
  const esOfrecimiento = post.type === 'help-offer';
  const maxCupos = post.maxParticipants ?? 1;
  const confirmados = post.confirmedParticipants?.length ?? 0;
  const cuposDisponibles = Math.max(0, maxCupos - confirmados);
  const cuposCompletos = cuposDisponibles <= 0;

  return (
    <article
      data-section="post-ayuda"
      className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-sm"
    >
      {/* 01.2 IMAGEN DE LA PUBLICACIÓN (si existe) */}
      {post.image && (
        <div data-section="imagen-publicacion" className="h-40 overflow-hidden bg-[#E8E8E8]">
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* 01.3 ENCABEZADO: autor, verificación, fecha y tipo de ayuda */}
        <header data-section="encabezado-publicacion" className="mb-3 flex items-start gap-3">
          <button
            type="button"
            onClick={() => onVerAutor?.(autor.id)}
            aria-label={`Ver perfil de ${autor.name}`}
            className={`shrink-0 rounded-full hover:opacity-80 ${ANIMACION_BOTON}`}
          >
            <AvatarAutor autor={autor} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold text-[#0D0D0D]">{autor.firstName}</span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[#E8F5F6] px-1.5 py-0.5 text-xs font-medium text-[#3C9DA0]">
                <Check size={10} strokeWidth={3} aria-hidden="true" />
                Uniandes
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#9E9E9E]">{post.createdAt}</p>
          </div>

          {/* 01.3.1 DISTINTIVO: ofrece ayuda / pide ayuda */}
          <span
            data-section="tipo-publicacion"
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
              esOfrecimiento
                ? 'bg-[#FFFF00] text-[#0D0D0D]'
                : 'bg-[#E8F5F6] text-[#3C9DA0]'
            }`}
          >
            {esOfrecimiento ? (
              <Star size={10} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <TriangleAlert size={10} strokeWidth={2.5} aria-hidden="true" />
            )}
            {esOfrecimiento ? 'Ofrece ayuda' : 'Pide ayuda'}
          </span>
        </header>

        {/* 01.4 CONTENIDO: título y descripción de la publicación */}
        <section data-section="contenido-publicacion" className="mb-3">
          <h3
            className="mb-1.5 text-base font-bold leading-snug text-[#0D0D0D]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {post.title}
          </h3>
          <p className="line-clamp-2 text-sm text-[#737373]">{post.description}</p>
        </section>

        {/* 01.5 METADATOS: fecha, duración y disponibilidad */}
        <section
          data-section="detalles-publicacion"
          aria-label="Detalles de la publicación"
          className="mb-3 space-y-2 rounded-xl bg-[#F6F6F6] p-3"
        >
          {(post.preferredDate || post.preferredTime) && (
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#737373]">
              Horario preferido
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4">
            {/* 01.5.1 FECHA Y HORA */}
            {(post.preferredDate || post.preferredTime) && (
              <div className="flex items-center gap-1.5 text-xs text-[#0D0D0D]">
                <CalendarDays size={13} strokeWidth={2} className="shrink-0 text-[#3C9DA0]" aria-hidden="true" />
                <span className="font-medium">
                  {post.preferredDate}
                  {post.preferredTime ? ` · ${post.preferredTime}` : ''}
                </span>
              </div>
            )}

            {/* 01.5.2 DURACIÓN ESTIMADA */}
            {post.estimatedHours != null && (
              <div className="flex items-center gap-1.5 text-xs text-[#0D0D0D]">
                <Clock3 size={13} strokeWidth={2} className="shrink-0 text-[#3C9DA0]" aria-hidden="true" />
                <span className="font-medium">
                  {post.estimatedHours} hora{post.estimatedHours !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* 01.5.3 CUPOS Y PARTICIPANTES */}
          {maxCupos > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <UsersRound
                size={13}
                strokeWidth={2}
                className={`shrink-0 ${cuposCompletos ? 'text-[#9E9E9E]' : 'text-[#3C9DA0]'}`}
                aria-hidden="true"
              />
              <span className={`font-medium ${cuposCompletos ? 'text-[#9E9E9E]' : 'text-[#0D0D0D]'}`}>
                {cuposCompletos
                  ? 'Cupos completos'
                  : `${cuposDisponibles} de ${maxCupos} cupo${maxCupos !== 1 ? 's' : ''} disponible${cuposDisponibles !== 1 ? 's' : ''}`}
              </span>
            </div>
          )}
        </section>

        {/* 01.6 CATEGORÍA */}
        <div data-section="categoria-publicacion" className="mb-3 flex items-center gap-1.5">
          <LayoutGrid size={12} className="text-[#9E9E9E]" aria-hidden="true" />
          <span className="text-xs text-[#9E9E9E]">{post.category}</span>
        </div>
      </div>

      {/* 01.7 ACCIONES: participar, guardar y compartir */}
      <footer
        data-section="acciones-publicacion"
        className="flex items-center gap-2 border-t border-[#F0F0F0] px-4 py-3"
      >
        {/* 01.7.1 BOTÓN PRINCIPAL: varía según el tipo de publicación */}
        <button
          type="button"
          onClick={() => onVerDetalle?.(post.id)}
          disabled={cuposCompletos}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:active:scale-100 ${ANIMACION_BOTON} ${
            cuposCompletos
              ? 'cursor-not-allowed bg-[#F0F0F0] text-[#9E9E9E]'
              : 'bg-[#3C9DA0] text-white hover:bg-[#2D8B8E]'
          }`}
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {cuposCompletos
            ? 'Cupos completos'
            : esOfrecimiento
              ? 'Quiero recibir ayuda'
              : 'Quiero ayudar'}
        </button>

        {/* 01.7.2 GUARDAR: acción preparada, sin persistencia */}
        <button
          type="button"
          onClick={() => onGuardar?.(post.id)}
          aria-label={`Guardar publicación: ${post.title}`}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6F6F6] hover:bg-[#E8F5F6] ${ANIMACION_BOTON}`}
        >
          <Bookmark size={16} className="text-[#737373]" aria-hidden="true" />
        </button>

        {/* 01.7.3 COMPARTIR: acción preparada, sin funcionalidad todavía */}
        <button
          type="button"
          onClick={() => onCompartir?.(post.id)}
          aria-label={`Compartir publicación: ${post.title}`}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6F6F6] hover:bg-[#E8F5F6] ${ANIMACION_BOTON}`}
        >
          <Share2 size={16} className="text-[#737373]" aria-hidden="true" />
        </button>
      </footer>
    </article>
  );
}
