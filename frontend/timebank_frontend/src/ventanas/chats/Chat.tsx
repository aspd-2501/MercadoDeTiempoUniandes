import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CheckCircle2, Clock3, Paperclip, Send } from 'lucide-react';

import { useMiembroSesion } from '../../contextos/MiembroSesionContext';
import { CHATS_DEMO } from './ChatList';
import type { ChatResumen, InterlocutorChat, EstadoAcuerdoChat } from './ChatList';

/**
 * VENTANA: conversación individual del Banco de Tiempo.
 *
 * Basada en ConversationView de Figma y adaptada a React Router.
 * - /chats/:chatId identifica la conversación.
 * - El miembro autenticado proviene del contexto global.
 * - Los mensajes se envían solo al estado local (sin API ni persistencia).
 * - Las acciones de acuerdos y perfil se conectarán mediante callbacks.
 *
 * Ubicación: src/ventanas/chat/Chat.tsx
 */

// ─────────────────────────────────────────────────────────────────────────────
// 00. MODELOS DE PRESENTACIÓN Y PROPIEDADES
// ─────────────────────────────────────────────────────────────────────────────

type TipoMensajeChat = 'text' | 'system' | 'agreement-proposal';

interface MensajeChat {
  id: string;
  senderId: string;
  text: string;
  type: TipoMensajeChat;
  createdAt: string;
}

interface ChatProps {
  /** Opcionales: se conectarán cuando existan las rutas de perfil y acuerdos. */
  onAbrirPerfil?: (miembroId: string) => void;
  onVerAcuerdo?: (acuerdoId: string) => void;
  onCrearAcuerdo?: (chatId: string) => void;
}

// 00.1 MENSAJES DE PRUEBA POR CONVERSACIÓN
// Usan el ID del miembro del contexto: no se duplica CURRENT_USER_ID.
function crearMensajesDemo(chatId: string, miId: string, otroId: string): MensajeChat[] {
  switch (chatId) {
    case 'chat-demo-1':
      return [
        { id: 'm1', senderId: otroId, text: '¡Hola! ¿Me podrías ayudar a repasar cálculo?', type: 'text', createdAt: '10:30' },
        { id: 'm2', senderId: miId, text: '¡Claro! Mañana en la tarde tengo tiempo.', type: 'text', createdAt: '10:34' },
        { id: 'm3', senderId: miId, text: 'Tutoría de cálculo · 2 horas', type: 'agreement-proposal', createdAt: '10:40' },
        { id: 'm4', senderId: 'sistema', text: 'El acuerdo fue aceptado.', type: 'system', createdAt: '10:42' },
        { id: 'm5', senderId: otroId, text: '¡Perfecto! Nos vemos mañana para la tutoría.', type: 'text', createdAt: '10:45' },
      ];

    case 'chat-demo-2':
      return [
        { id: 'm1', senderId: otroId, text: '¿Te parece bien revisar las diapositivas hoy?', type: 'text', createdAt: 'Ayer · 14:10' },
        { id: 'm2', senderId: miId, text: '¡Sí! Ya tengo listas las observaciones.', type: 'text', createdAt: 'Ayer · 14:18' },
        { id: 'm3', senderId: 'sistema', text: 'El intercambio se marcó como completado.', type: 'system', createdAt: 'Ayer · 15:00' },
        { id: 'm4', senderId: otroId, text: 'Gracias por ayudarme con la presentación.', type: 'text', createdAt: 'Ayer · 15:05' },
      ];

    case 'chat-demo-3':
      return [
        { id: 'm1', senderId: miId, text: '¡Hola, Laura! Vi que ofreces práctica de inglés.', type: 'text', createdAt: 'Lun · 09:15' },
        { id: 'm2', senderId: otroId, text: '¡Hola! Sí, podemos organizar una sesión.', type: 'text', createdAt: 'Lun · 09:20' },
        { id: 'm3', senderId: otroId, text: 'Hola, ¿todavía tienes tiempo para practicar inglés?', type: 'text', createdAt: 'Lun · 09:25' },
      ];

    case 'chat-demo-4':
      return [
        { id: 'm1', senderId: otroId, text: 'Hola, ¿podemos revisar el archivo de Excel esta semana?', type: 'text', createdAt: 'Dom · 11:00' },
        { id: 'm2', senderId: miId, text: 'Por supuesto. Te confirmo el horario en cuanto pueda.', type: 'text', createdAt: 'Dom · 11:08' },
        { id: 'm3', senderId: otroId, text: 'Quedo pendiente de la confirmación.', type: 'text', createdAt: 'Dom · 11:12' },
      ];

    default:
      return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 01. VENTANA: IDENTIFICAR LA CONVERSACIÓN DESDE LA URL
// ─────────────────────────────────────────────────────────────────────────────

export default function Chat(props: ChatProps) {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { miembro } = useMiembroSesion();

  // Compartimos los resúmenes de ChatList; así coinciden sus IDs y acuerdos.
  const chat = CHATS_DEMO.find((conversacion) => conversacion.id === chatId);

  if (!chat || chat.interlocutor.id === miembro.id) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white px-4 text-center" data-section="chat-no-encontrado">
        <p className="text-sm font-semibold text-[#0D0D0D]">No encontramos esta conversación.</p>
        <button
          type="button"
          onClick={() => navigate('/chats')}
          className="cursor-pointer rounded-xl bg-[#3C9DA0] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2D8B8E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3C9DA0]"
        >
          Volver a Chats
        </button>
      </main>
    );
  }

  // La key reinicia únicamente la conversación cuando cambia el parámetro de ruta.
  return (
    <Conversacion
      key={chat.id}
      chat={chat}
      miId={miembro.id}
      onVolver={() => navigate('/chats')}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 02. COMPONENTE: CONVERSACIÓN SELECCIONADA
// ─────────────────────────────────────────────────────────────────────────────

interface ConversacionProps extends ChatProps {
  chat: ChatResumen;
  miId: string;
  onVolver: () => void;
}

function Conversacion({
  chat,
  miId,
  onVolver,
  onAbrirPerfil,
  onVerAcuerdo,
  onCrearAcuerdo,
}: ConversacionProps) {
  const { interlocutor, agreement } = chat;

  // 02.1 ESTADO LOCAL DE LOS MENSAJES Y DEL CAMPO DE ESCRITURA
  const [mensajes, setMensajes] = useState<MensajeChat[]>(() =>
    crearMensajesDemo(chat.id, miId, interlocutor.id),
  );
  const [texto, setTexto] = useState('');
  const contenedorMensajesRef = useRef<HTMLDivElement>(null);
  const secuenciaRef = useRef(0);

  // 02.2 MANTENER A LA VISTA EL ÚLTIMO MENSAJE, SIN MOVER TODA LA PÁGINA
  useEffect(() => {
    const contenedor = contenedorMensajesRef.current;
    if (contenedor) {
      contenedor.scrollTop = contenedor.scrollHeight;
    }
  }, [mensajes]);

  // 02.3 ENVIAR UN MENSAJE SOLO EN ESTA SESIÓN DE REACT
  function enviarMensaje() {
    const contenido = texto.trim();
    if (!contenido) return;

    secuenciaRef.current += 1;
    const nuevoMensaje: MensajeChat = {
      id: `mensaje-local-${Date.now()}-${secuenciaRef.current}`,
      senderId: miId,
      text: contenido,
      type: 'text',
      createdAt: 'Ahora',
    };

    setMensajes((anteriores) => [...anteriores, nuevoMensaje]);
    setTexto('');
  }

  const puedeAccionarAcuerdo = agreement ? Boolean(onVerAcuerdo) : Boolean(onCrearAcuerdo);

  return (
    <section
      data-section="ventana-chat-individual"
      className="flex h-[calc(100dvh-6rem)] min-h-0 min-w-0 flex-col overflow-hidden bg-white lg:h-dvh"
    >
      {/* 03. ENCABEZADO DE LA CONVERSACIÓN */}
      <header
        data-section="encabezado-chat"
        className="z-20 shrink-0 border-b border-[#E8E8E8] bg-white px-4 pt-12 pb-3 lg:pt-4"
      >
        <div className="mx-auto flex w-full max-w-2xl min-w-0 items-center gap-3">
          {/* 03.1 VOLVER A LA LISTA */}
          <button
            type="button"
            onClick={onVolver}
            aria-label="Volver a Chats"
            className="shrink-0 cursor-pointer rounded-full p-1 text-[#0D0D0D] transition-colors hover:bg-[#F6F6F6] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3C9DA0]"
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </button>

          {/* 03.2 DATOS DEL INTERLOCUTOR */}
          <button
            type="button"
            disabled={!onAbrirPerfil}
            onClick={() => onAbrirPerfil?.(interlocutor.id)}
            title={onAbrirPerfil ? 'Ver perfil' : 'Enlace al perfil pendiente de implementar'}
            className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3C9DA0] ${onAbrirPerfil ? 'cursor-pointer hover:bg-[#F6F6F6] active:scale-[0.99]' : 'cursor-default'}`}
          >
            <AvatarChat interlocutor={interlocutor} tamaño="sm" mostrarEstado />
            <span className="min-w-0">
              <span className="flex min-w-0 items-center gap-1">
                <span className="truncate text-sm font-semibold text-[#0D0D0D]">{interlocutor.name}</span>
                <CheckCircle2 size={13} strokeWidth={2.5} className="shrink-0 text-[#3C9DA0]" aria-hidden="true" />
              </span>
              <span className="block text-xs text-[#9E9E9E]">
                {interlocutor.isAvailable ? 'En línea' : 'Desconectado'}
              </span>
            </span>
          </button>

          {/* 03.3 ACCESO AL ACUERDO O A SU CREACIÓN */}
          <button
            type="button"
            disabled={!puedeAccionarAcuerdo}
            onClick={() => {
              if (agreement) onVerAcuerdo?.(agreement.id);
              else onCrearAcuerdo?.(chat.id);
            }}
            title={puedeAccionarAcuerdo ? undefined : 'Funcionalidad de acuerdos pendiente de implementar'}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3C9DA0] ${puedeAccionarAcuerdo ? 'cursor-pointer active:scale-95' : 'cursor-default'} ${agreement ? 'bg-[#E8F5F6] text-[#3C9DA0]' : 'bg-[#3C9DA0] text-white'}`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {agreement ? 'Ver acuerdo' : 'Crear acuerdo'}
          </button>
        </div>
      </header>

      {/* 04. MENSAJES: SOLO ESTA REGIÓN TIENE DESPLAZAMIENTO VERTICAL */}
      <div
        ref={contenedorMensajesRef}
        role="log"
        aria-label={`Mensajes con ${interlocutor.name}`}
        data-section="mensajes-chat"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
      >
        <div className="mx-auto w-full max-w-2xl space-y-3">
          {mensajes.map((mensaje) => {
            const esPropio = mensaje.senderId === miId;

            // 04.1 NOTIFICACIÓN DEL SISTEMA
            if (mensaje.type === 'system') {
              return (
                <div key={mensaje.id} className="flex justify-center" data-section="mensaje-sistema">
                  <p className="max-w-xs rounded-full bg-[#F6F6F6] px-4 py-2 text-center text-xs text-[#737373]">
                    {mensaje.text}
                  </p>
                </div>
              );
            }

            // 04.2 PROPUESTA DE ACUERDO (TARJETA DEL DISEÑO DE FIGMA)
            if (mensaje.type === 'agreement-proposal') {
              return (
                <div key={mensaje.id} className="flex justify-center" data-section="mensaje-propuesta-acuerdo">
                  <button
                    type="button"
                    disabled={!agreement || !onVerAcuerdo}
                    onClick={() => agreement && onVerAcuerdo?.(agreement.id)}
                    className={`w-full max-w-xs rounded-2xl border border-[#3C9DA0] bg-[#E8F5F6] p-4 text-left ${agreement && onVerAcuerdo ? 'cursor-pointer transition-colors hover:bg-[#D7EEEF] active:scale-[0.99]' : 'cursor-default'}`}
                  >
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#3C9DA0]">
                      <Clock3 size={16} aria-hidden="true" />
                      <span style={{ fontFamily: 'Outfit, sans-serif' }}>ACUERDO PROPUESTO</span>
                    </span>
                    <span className="block text-sm font-medium text-[#0D0D0D]">{mensaje.text}</span>
                    {agreement && <EstadoAcuerdo estado={agreement.status} />}
                  </button>
                </div>
              );
            }

            // 04.3 BURBUJAS DE MENSAJES ENVIADOS Y RECIBIDOS
            return (
              <div
                key={mensaje.id}
                data-section={esPropio ? 'mensaje-enviado' : 'mensaje-recibido'}
                className={`flex gap-2 ${esPropio ? 'justify-end' : 'justify-start'}`}
              >
                {!esPropio && (
                  <div className="mt-auto shrink-0">
                    <AvatarChat interlocutor={interlocutor} tamaño="xs" />
                  </div>
                )}
                <div className="max-w-[78%] min-w-0 sm:max-w-[72%]">
                  <p
                    className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${esPropio ? 'rounded-br-md bg-[#3C9DA0] text-white' : 'rounded-bl-md bg-[#F6F6F6] text-[#0D0D0D]'}`}
                  >
                    {mensaje.text}
                  </p>
                  <p className={`mt-0.5 text-[10px] text-[#9E9E9E] ${esPropio ? 'text-right' : 'text-left'}`}>
                    {mensaje.createdAt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 05. CAMPO DE REDACCIÓN Y ENVÍO */}
      <form
        data-section="redactar-mensaje"
        onSubmit={(evento) => {
          evento.preventDefault();
          enviarMensaje();
        }}
        className="shrink-0 border-t border-[#E8E8E8] bg-white px-4 py-3"
      >
        <div className="mx-auto flex w-full max-w-2xl min-w-0 items-end gap-2">
          {/* 05.1 ARCHIVOS: BOTÓN VISUAL, PENDIENTE DE IMPLEMENTAR */}
          <button
            type="button"
            disabled
            title="Adjuntar archivos estará disponible próximamente"
            aria-label="Adjuntar archivo (próximamente)"
            className="flex h-10 w-10 shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-[#F6F6F6] text-[#737373]"
          >
            <Paperclip size={18} aria-hidden="true" />
          </button>

          {/* 05.2 TEXTO DEL MENSAJE */}
          <div className="flex min-w-0 flex-1 items-end rounded-2xl bg-[#F6F6F6] px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#3C9DA0]/30">
            <textarea
              aria-label="Escribir mensaje"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              onKeyDown={(evento) => {
                if (evento.key === 'Enter' && !evento.shiftKey && !evento.nativeEvent.isComposing) {
                  evento.preventDefault();
                  enviarMensaje();
                }
              }}
              placeholder="Escribe un mensaje…"
              rows={1}
              className="max-h-[120px] min-w-0 flex-1 resize-none bg-transparent text-sm text-[#0D0D0D] outline-none placeholder:text-[#9E9E9E]"
            />
          </div>

          {/* 05.3 ENVIAR: DESHABILITADO PARA MENSAJES VACÍOS */}
          <button
            type="submit"
            disabled={!texto.trim()}
            aria-label="Enviar mensaje"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3C9DA0] ${texto.trim() ? 'cursor-pointer bg-[#3C9DA0] text-white hover:bg-[#2D8B8E] active:scale-95' : 'cursor-not-allowed bg-[#F0F0F0] text-[#C0C0C0]'}`}
          >
            <Send size={16} aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 06. COMPONENTES AUXILIARES: AVATAR Y ESTADO DEL ACUERDO
// ─────────────────────────────────────────────────────────────────────────────

function AvatarChat({
  interlocutor,
  tamaño,
  mostrarEstado = false,
}: {
  interlocutor: InterlocutorChat;
  tamaño: 'sm' | 'xs';
  mostrarEstado?: boolean;
}) {
  const iniciales = interlocutor.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0))
    .join('')
    .toLocaleUpperCase('es');

  const clasesTamaño = tamaño === 'sm' ? 'h-9 w-9 text-xs' : 'h-7 w-7 text-[10px]';

  return (
    <span className={`relative block shrink-0 ${clasesTamaño}`} data-section="avatar-interlocutor">
      <span
        className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full font-bold text-white ${clasesTamaño}`}
        style={{ backgroundColor: interlocutor.avatarColor }}
      >
        {interlocutor.avatar ? (
          <img src={interlocutor.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          iniciales
        )}
      </span>
      {mostrarEstado && (
        <span
          aria-label={interlocutor.isAvailable ? 'Disponible' : 'No disponible'}
          className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white ${interlocutor.isAvailable ? 'bg-green-500' : 'bg-[#C0C0C0]'}`}
        />
      )}
    </span>
  );
}

function EstadoAcuerdo({ estado }: { estado: EstadoAcuerdoChat }) {
  const clases: Record<EstadoAcuerdoChat, string> = {
    accepted: 'bg-[#3C9DA0] text-white',
    completed: 'bg-green-500 text-white',
    pending: 'bg-[#FFFF00] text-[#0D0D0D]',
    cancelled: 'bg-[#E8E8E8] text-[#737373]',
  };
  const etiquetas: Record<EstadoAcuerdoChat, string> = {
    accepted: 'Aceptado',
    completed: 'Completado',
    pending: 'Pendiente',
    cancelled: 'Cancelado',
  };

  return (
    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${clases[estado]}`}>
      {etiquetas[estado]}
    </span>
  );
}
