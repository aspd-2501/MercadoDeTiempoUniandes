import { useState } from 'react';
import { Clock3, Search, X } from 'lucide-react';
import { useMiembroSesion } from '../../contextos/MiembroSesionContext';

// ─────────────────────────────────────────────────────────────────────────────
// 00. MODELOS TEMPORALES DE PRESENTACIÓN
// Se sustituirán por los tipos compartidos y los datos de la API de NestJS.
// ─────────────────────────────────────────────────────────────────────────────

export interface InterlocutorChat {
  id: string;
  name: string;
  avatar?: string;
  avatarColor: string;
  isAvailable: boolean;
}

export type EstadoAcuerdoChat = 'accepted' | 'completed' | 'pending' | 'cancelled';

export interface AcuerdoResumenChat {
  id: string;
  service: string;
  status: EstadoAcuerdoChat;
}

export interface ChatResumen {
  id: string;
  interlocutor: InterlocutorChat;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  agreement?: AcuerdoResumenChat;
}

interface ChatsProps {
  chats?: ChatResumen[];
  onAbrirChat?: (chatId: string) => void;
}

// 00.1 DATOS DE PRUEBA: pertenecen exclusivamente a esta maqueta.
export const CHATS_DEMO: ChatResumen[] = [
  {
    id: 'chat-demo-1',
    interlocutor: {
      id: 'miembro-demo-2',
      name: 'Carlos Martínez',
      avatarColor: '#3C9DA0',
      isAvailable: true,
    },
    lastMessage: '¡Perfecto! Nos vemos mañana para la tutoría.',
    lastMessageAt: '10:45',
    unreadCount: 2,
    agreement: {
      id: 'acuerdo-demo-1',
      service: 'Tutoría de cálculo',
      status: 'accepted',
    },
  },
  {
    id: 'chat-demo-2',
    interlocutor: {
      id: 'miembro-demo-3',
      name: 'Ana Rodríguez',
      avatarColor: '#7030A0',
      isAvailable: false,
    },
    lastMessage: 'Gracias por ayudarme con la presentación.',
    lastMessageAt: 'Ayer',
    unreadCount: 0,
    agreement: {
      id: 'acuerdo-demo-2',
      service: 'Diseño de presentación',
      status: 'completed',
    },
  },
  {
    id: 'chat-demo-3',
    interlocutor: {
      id: 'miembro-demo-4',
      name: 'Laura Gómez',
      avatarColor: '#E18D58',
      isAvailable: true,
    },
    lastMessage: 'Hola, ¿todavía tienes tiempo para practicar inglés?',
    lastMessageAt: 'Lun',
    unreadCount: 1,
  },
  {
    id: 'chat-demo-4',
    interlocutor: {
      id: 'miembro-demo-5',
      name: 'Andrés Torres',
      avatarColor: '#4059AD',
      isAvailable: false,
    },
    lastMessage: 'Quedo pendiente de la confirmación.',
    lastMessageAt: 'Dom',
    unreadCount: 0,
    agreement: {
      id: 'acuerdo-demo-3',
      service: 'Asesoría en Excel',
      status: 'pending',
    },
  },
];

const ESTILOS_ESTADO_ACUERDO: Record<EstadoAcuerdoChat, string> = {
  accepted: 'bg-[#E8F5F6] text-[#3C9DA0]',
  completed: 'bg-green-50 text-green-700',
  pending: 'bg-[#FFF9C4] text-[#F57F17]',
  cancelled: 'bg-[#F0F0F0] text-[#9E9E9E]',
};

// ─────────────────────────────────────────────────────────────────────────────
// 01. VENTANA: LISTA DE CHATS
// ─────────────────────────────────────────────────────────────────────────────

export default function ChatList({
  chats = CHATS_DEMO,
  onAbrirChat,
}: ChatsProps) {
  // 01.1 MIEMBRO AUTENTICADO (FUENTE GLOBAL)
  const { miembro } = useMiembroSesion();

  // 01.2 ESTADO VISUAL DEL BUSCADOR (SIN PETICIONES AL BACKEND)
  const [busquedaAbierta, setBusquedaAbierta] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const chatsVisibles = chats.filter((chat) => {
    // Evita incluir un chat consigo mismo en los datos simulados.
    const esOtroMiembro = chat.interlocutor.id !== miembro.id;
    const coincideConBusqueda = chat.interlocutor.name
      .toLocaleLowerCase('es')
      .includes(busqueda.trim().toLocaleLowerCase('es'));

    return esOtroMiembro && coincideConBusqueda;
  });

  return (
    <div className="min-h-screen min-w-0 bg-white" data-section="ventana-chats">
      {/* 02. ENCABEZADO: TÍTULO Y ACCESO A BÚSQUEDA */}
      <header
        data-section="encabezado-chats"
        className="sticky top-0 z-30 border-b border-[#E8E8E8] bg-white px-4 pt-12 pb-4 lg:pt-6"
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1
            className="text-2xl font-bold text-[#0D0D0D]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Chats
          </h1>

          {/* 02.1 BOTÓN DE BÚSQUEDA */}
          <button
            type="button"
            onClick={() => {
              setBusquedaAbierta((abierta) => !abierta);
              setBusqueda('');
            }}
            aria-label={busquedaAbierta ? 'Cerrar búsqueda' : 'Buscar chats'}
            aria-expanded={busquedaAbierta}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F6F6F6] text-[#737373] transition-colors duration-200 hover:bg-[#E8F5F6] hover:text-[#3C9DA0] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3C9DA0]"
          >
            {busquedaAbierta ? <X size={18} /> : <Search size={18} />}
          </button>
        </div>

        {/* 02.2 CAMPO DE BÚSQUEDA DESPLEGABLE */}
        {busquedaAbierta && (
          <div className="mx-auto mt-3 max-w-2xl" data-section="busqueda-chats">
            <label htmlFor="buscar-chats" className="sr-only">
              Buscar chats por nombre
            </label>
            <input
              id="buscar-chats"
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar miembro…"
              autoFocus
              className="w-full min-w-0 rounded-xl border border-[#E8E8E8] bg-[#F6F6F6] px-4 py-2.5 text-sm text-[#0D0D0D] outline-none transition-colors focus:border-[#3C9DA0] focus:bg-white"
            />
          </div>
        )}
      </header>

      {/* 03. LISTA DE CONVERSACIONES */}
      <main data-section="lista-chats" className="mx-auto max-w-2xl min-w-0">
        {chatsVisibles.length === 0 ? (
          /* 03.1 ESTADO SIN RESULTADOS */
          <div className="px-5 py-16 text-center" data-section="chats-vacios">
            <p className="font-semibold text-[#0D0D0D]">
              {busqueda.trim() ? 'No encontramos conversaciones.' : 'Todavía no tienes chats.'}
            </p>
            <p className="mt-1 text-sm text-[#9E9E9E]">
              {busqueda.trim()
                ? 'Prueba buscando otro nombre.'
                : 'Tus conversaciones aparecerán aquí.'}
            </p>
          </div>
        ) : (
          chatsVisibles.map((chat, indice) => (
            <FilaChat
              key={chat.id}
              chat={chat}
              ultimo={indice === chatsVisibles.length - 1}
              onAbrir={() => onAbrirChat?.(chat.id)}
            />
          ))
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 04. COMPONENTE AUXILIAR: FILA DE CHAT
// ─────────────────────────────────────────────────────────────────────────────

function FilaChat({
  chat,
  ultimo,
  onAbrir,
}: {
  chat: ChatResumen;
  ultimo: boolean;
  onAbrir: () => void;
}) {
  const { interlocutor, agreement } = chat;

  return (
    <button
      type="button"
      onClick={onAbrir}
      data-section="fila-chat"
      className={`flex w-full min-w-0 cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-[#F6F6F6] active:bg-[#E8F5F6] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#3C9DA0] ${ultimo ? '' : 'border-b border-[#F0F0F0]'}`}
    >
      {/* 04.1 AVATAR Y ESTADO DE DISPONIBILIDAD */}
      <AvatarChat interlocutor={interlocutor} />

      {/* 04.2 IDENTIFICACIÓN, MENSAJE Y ACUERDO */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-sm font-semibold text-[#0D0D0D]">
            {interlocutor.name}
          </span>
          <span className="shrink-0 text-xs text-[#9E9E9E]">
            {chat.lastMessageAt}
          </span>
        </div>

        <p className="truncate text-sm text-[#737373]">{chat.lastMessage}</p>

        {/*{agreement && (
          <div className="mt-1 flex items-center gap-1" data-section="acuerdo-asociado">
            <span
              className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${ESTILOS_ESTADO_ACUERDO[agreement.status]}`}
            >
              <Clock3 size={10} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{agreement.service}</span>
            </span>
          </div>
        )}*/}
      </div>

      {/* 04.3 CONTADOR DE MENSAJES NO LEÍDOS */}
      {chat.unreadCount > 0 && (
        <span
          aria-label={`${chat.unreadCount} mensaje${chat.unreadCount === 1 ? '' : 's'} sin leer`}
          className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#3C9DA0] px-1 text-[11px] font-bold text-white"
        >
          {chat.unreadCount}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 05. COMPONENTE AUXILIAR: AVATAR DEL INTERLOCUTOR
// ─────────────────────────────────────────────────────────────────────────────

function AvatarChat({ interlocutor }: { interlocutor: InterlocutorChat }) {
  const iniciales = interlocutor.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join('')
    .toLocaleUpperCase('es');

  return (
    <div className="relative h-11 w-11 shrink-0" data-section="avatar-chat">
      <div
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full"
        style={{ backgroundColor: interlocutor.avatarColor }}
      >
        {interlocutor.avatar ? (
          <img
            src={interlocutor.avatar}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {iniciales}
          </span>
        )}
      </div>

      <span
        aria-label={interlocutor.isAvailable ? 'Disponible' : 'No disponible'}
        className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white ${interlocutor.isAvailable ? 'bg-green-500' : 'bg-[#C0C0C0]'}`}
      />
    </div>
  );
}
