import { useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CircleCheck,
  CircleHelp,
  Clock3,
  Star,
  TriangleAlert,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon, LucideProps } from 'lucide-react';

/**
 * Primera migración del mockup de Figma.
 */
export type TipoPostAyuda = 'help-offer' | 'help-request';

export interface PostAyuda {
  id: string;
  userId: string;
  type: TipoPostAyuda;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  image?: string;
  preferredDate?: string;
  preferredTime?: string;
  estimatedHours?: number;
  maxParticipants?: number;
  confirmedParticipants?: string[];
}

export interface AutorPostAyuda {
  id: string;
  name: string;
  firstName: string;
  faculty: string;
  avatar?: string;
  avatarColor?: string;
}

type DestinoNavegacion = 'agreement-detail' | 'chat-conversation' | 'home' | 'other-profile';

export interface PostAyudaDetailProps {
  /** Por ahora opcional; cuando exista la API se suministrará desde la vista padre. */
  post?: PostAyuda | null;
  author?: AutorPostAyuda | null;
  currentUserId?: string;
  onBack?: () => void;
  onNavigate?: (destination: DestinoNavegacion, params?: Record<string, string>) => void;
}

// Datos de demostración para la vista de detalle de un post de ayuda.

const DEMO_POST: PostAyuda = {
  id: 'post-demo-1',
  userId: 'usuario-demo-1',
  type: 'help-request',
  title: 'Necesito ayuda con cálculo diferencial',
  description:
    'Estoy buscando a alguien que me ayude a repasar algunos ejercicios de derivadas antes del parcial. Podemos reunirnos en la universidad.',
  category: 'Tutorías / Matemáticas',
  createdAt: 'Hace 2 horas',
  preferredDate: '15 de octubre',
  preferredTime: '2:00 p. m.',
  estimatedHours: 2,
  maxParticipants: 3,
  confirmedParticipants: ['usuario-demo-2'],
};

const DEMO_AUTHOR: AutorPostAyuda = {
  id: 'usuario-demo-1',
  name: 'María Rodríguez',
  firstName: 'María',
  faculty: 'Ingeniería',
  avatarColor: '#3C9DA0',
};

// Iconos y componentes auxiliares.
const ICONOS = {
  check: Check,
  'arrow-left': ArrowLeft,
  star: Star,
  'alert-triangle': TriangleAlert,
  'check-circle': CircleCheck,
  calendar: CalendarDays,
  clock: Clock3,
  users: UsersRound,
  'help-circle': CircleHelp,
} satisfies Record<string, LucideIcon>;

type NombreIcono = keyof typeof ICONOS;

function Icon({ name, ...props }: { name: NombreIcono } & Omit<LucideProps, 'name'>) {
  const Componente = ICONOS[name];
  return <Componente aria-hidden="true" {...props} />;
}

function Avatar({
  name,
  avatarUrl,
  avatarColor = '#3C9DA0',
}: {
  name: string;
  avatarUrl?: string;
  avatarColor?: string;
  size?: 'md';
}) {
  const iniciales = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <span
      className="w-10 h-10 rounded-full shrink-0 inline-flex items-center justify-center overflow-hidden text-white text-sm font-semibold"
      style={{ backgroundColor: avatarColor }}
      aria-label={name}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        iniciales
      )}
    </span>
  );
}

function Chip({ label }: { label: string; size?: 'sm'; color?: 'teal' }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#E8F5F6] px-2.5 py-1 text-xs font-medium text-[#3C9DA0]">
      {label}
    </span>
  );
}

export default function PostAyudaDetail({
  post = DEMO_POST,
  author = DEMO_AUTHOR,
  currentUserId = 'usuario-actual-demo',
  onBack,
  onNavigate,
}: PostAyudaDetailProps) {
  // Sustituto temporal de NavigationContext (aún no hay router configurado).
  const navigate = (destination: DestinoNavegacion, params?: Record<string, string>) => {
    if (onNavigate) {
      onNavigate(destination, params);
    } else {
      window.alert(`La vista «${destination}» todavía no está conectada.`);
    }
  };
  const goBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.alert('Todavía no hay una pantalla anterior configurada.');
    }
  };
  const [joined, setJoined] = useState(false);
  const [confirmedParticipants, setConfirmedParticipants] = useState<string[]>(post?.confirmedParticipants ?? []);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#737373]">Publicación no encontrada.</p>
          <button onClick={goBack} className="mt-4 text-[#3C9DA0] font-medium text-sm">Volver</button>
        </div>
      </div>
    );
  }

  if (!author) {
    return <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center text-[#737373]">Autor no encontrado.</div>;
  }
  const isOffer = post.type === 'help-offer';
  const confirmedCount = confirmedParticipants.length;
  const maxSlots = post.maxParticipants ?? 1;
  const slotsLeft = maxSlots - confirmedCount;
  const isFull = slotsLeft <= 0;
  const currentUserJoined = joined || confirmedParticipants.includes(currentUserId);

  function handleJoin() {
    if (currentUserJoined || isFull) return;
    setConfirmedParticipants(prev => [...prev, currentUserId]);
    setJoined(true);
  }

  if (joined) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#3C9DA0] flex items-center justify-center mb-5">
            <Icon name="check" size={36} className="text-white" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-[#0D0D0D] mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            ¡Te uniste!
          </h2>
          <p className="text-[#737373] mb-6 leading-relaxed">
            {isOffer
              ? 'Tu lugar está reservado. Se creó un acuerdo de servicio con el organizador.'
              : 'Confirmaste tu ayuda. Se creó un acuerdo de servicio con quien lo solicitó.'}
          </p>
          <p className="text-xs text-[#737373] mb-5 max-w-sm">
            Modo demostración: la participación y el acuerdo no se han guardado en el servidor.
          </p>
          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={() => navigate('agreement-detail', { agreementId: 'acuerdo-demo' })}
              className="w-full py-3 rounded-xl bg-[#3C9DA0] text-white font-semibold text-sm btn-press"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Ver acuerdo de servicio
            </button>
            <button
              onClick={() => navigate('chat-conversation', { chatId: 'chat-demo' })}
              className="w-full py-3 rounded-xl border border-[#E8E8E8] text-[#0D0D0D] font-medium text-sm btn-press"
            >
              Ir al chat
            </button>
            <button
              onClick={() => navigate('home')}
              className="text-sm text-[#737373]"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      {/* App bar */}
      <div className="bg-white px-4 pt-12 pb-3 lg:pt-6 sticky top-0 z-30 shadow-[0_1px_0_#E8E8E8]">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            type="button"
            aria-label="Volver a la pantalla anterior"
            onClick={goBack}
            className="w-9 h-9 rounded-full bg-[#F6F6F6] flex items-center justify-center flex-shrink-0"
          >
            <Icon name="arrow-left" size={18} className="text-[#0D0D0D]" />
          </button>
          <h1 className="flex-1 text-base font-bold text-[#0D0D0D] truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {isOffer ? 'Oferta de ayuda' : 'Solicitud de ayuda'}
          </h1>
          <span className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full uppercase tracking-wide ${isOffer ? 'bg-[#FFFF00] text-[#0D0D0D]' : 'bg-[#E8F5F6] text-[#3C9DA0]'}`}>
            <Icon name={isOffer ? 'star' : 'alert-triangle'} size={11} strokeWidth={2.5} />
            {isOffer ? 'Ofrece ayuda' : 'Pide ayuda'}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Image */}
        {post.image && (
          <div className="rounded-2xl overflow-hidden h-48 bg-[#E8E8E8]">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Main card */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E8E8]">
          <h2 className="text-xl font-bold text-[#0D0D0D] mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {post.title}
          </h2>

          {/* Author */}
          <button
            onClick={() => navigate('other-profile', { userId: author.id })}
            className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
          >
            <Avatar name={author.name} avatarUrl={author.avatar} avatarColor={author.avatarColor} size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-[#0D0D0D]">{author.name}</span>
                <Icon name="check-circle" size={14} className="text-[#3C9DA0]" strokeWidth={2.5} />
              </div>
              <p className="text-xs text-[#737373]">{author.faculty} · {post.createdAt}</p>
            </div>
            <span className="ml-auto text-xs text-[#3C9DA0] font-medium">Ver perfil →</span>
          </button>

          <p className="text-sm text-[#737373] leading-relaxed mb-4">{post.description}</p>

          {/* Category */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.category.split('/').map(cat => (
              <Chip key={cat} label={cat.trim()} size="sm" color="teal" />
            ))}
          </div>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E8E8] space-y-3">
          <h3 className="text-sm font-bold text-[#0D0D0D] mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Detalles</h3>

          {(post.preferredDate || post.preferredTime) && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E8F5F6] flex items-center justify-center flex-shrink-0">
                <Icon name="calendar" size={17} className="text-[#3C9DA0]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] text-[#9E9E9E] uppercase tracking-wide font-medium">Fecha y hora</p>
                <p className="text-sm font-semibold text-[#0D0D0D]">{post.preferredDate}{post.preferredTime ? ` · ${post.preferredTime}` : ''}</p>
              </div>
            </div>
          )}

          {post.estimatedHours && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E8F5F6] flex items-center justify-center flex-shrink-0">
                <Icon name="clock" size={17} className="text-[#3C9DA0]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] text-[#9E9E9E] uppercase tracking-wide font-medium">Duración</p>
                <p className="text-sm font-semibold text-[#0D0D0D]">{post.estimatedHours} hora{post.estimatedHours !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isFull ? 'bg-[#F0F0F0]' : 'bg-[#E8F5F6]'}`}>
              <Icon name="users" size={17} className={isFull ? 'text-[#9E9E9E]' : 'text-[#3C9DA0]'} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] text-[#9E9E9E] uppercase tracking-wide font-medium">Participantes</p>
              <p className={`text-sm font-semibold ${isFull ? 'text-[#9E9E9E]' : 'text-[#0D0D0D]'}`}>
                {isFull ? 'Cupos completos' : `${slotsLeft} de ${maxSlots} cupo${maxSlots !== 1 ? 's' : ''} disponible${slotsLeft !== 1 ? 's' : ''}`}
              </p>
              {confirmedCount > 0 && (
                <p className="text-xs text-[#737373] mt-0.5">{confirmedCount} confirmado{confirmedCount !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        </div>

        {/* Role explanation */}
        <div className={`rounded-2xl p-4 border ${isOffer ? 'bg-[#FFFDE7] border-[#FFF176]' : 'bg-[#E8F5F6] border-[#B2DFE0]'}`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isOffer ? 'bg-[#FFFF00]' : 'bg-[#3C9DA0]'}`}>
              <Icon name={isOffer ? 'star' : 'help-circle'} size={16} className={isOffer ? 'text-[#0D0D0D]' : 'text-white'} strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {isOffer ? `${author.firstName} ofrece su ayuda` : `${author.firstName} pide ayuda`}
              </p>
              <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
                {isOffer
                  ? `Al unirte, recibirás la ayuda de ${author.firstName}. Se creará un acuerdo de servicio automáticamente.`
                  : `Al unirte, le brindarás tu ayuda a ${author.firstName}. Se creará un acuerdo de servicio automáticamente.`}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pb-4">
          <button
            onClick={handleJoin}
            disabled={isFull || currentUserJoined}
            className={`w-full py-4 rounded-2xl font-bold text-base btn-press transition-all ${isFull || currentUserJoined ? 'bg-[#F0F0F0] text-[#9E9E9E]' : 'bg-[#3C9DA0] text-white hover:bg-[#2D8B8E] shadow-lg shadow-[#3C9DA0]/20'}`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {currentUserJoined
              ? 'Ya estás participando'
              : isFull
              ? 'Cupos completos'
              : isOffer
              ? 'Quiero recibir ayuda'
              : 'Quiero ayudar'}
          </button>
        </div>
      </div>
    </div>
  );
}
