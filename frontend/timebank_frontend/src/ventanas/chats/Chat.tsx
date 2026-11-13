import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Clock3, Paperclip, Send, UsersRound } from 'lucide-react';

import { useMiembroSesion } from '../../contextos/MiembroSesionContext';
import { obtenerParticipantesChat, obtenerMensajesChat, enviarMensajeChat, type MensajeAPI, type ParticipanteChatAPI } from '../../api/chats.api';
import { obtenerAcuerdo, obtenerParticipantesAcuerdo, EstadoAcuerdoAPI } from '../../api/acuerdos.api';

/**
 * VENTANA: chat exclusivo de un acuerdo de servicio.
 *
 * Basada en ConversationView de Figma y adaptada a React Router.
 * - /acuerdos/:acuerdoId/chat identifica el acuerdo, no un chat personal.
 * - El miembro autenticado proviene del contexto global.
 * - El chat se obtiene exclusivamente a través de GET /acuerdos/:id.
 * - Enviar un mensaje usa POST /mensajes y luego refresca la conversación.
 * - Solo los participantes del acuerdo y su chat pueden usar esta vista.
 *
 * Ubicación: src/ventanas/chat/Chat.tsx
 */

// ─────────────────────────────────────────────────────────────────────────────
// 00. MODELOS DE PRESENTACIÓN Y PROPIEDADES
// ─────────────────────────────────────────────────────────────────────────────

type TipoMensajeChat = 'text' | 'system' | 'agreement-proposal';
type EstadoAcuerdoChat = 'accepted' | 'completed' | 'pending' | 'cancelled';

/** Solo información propia del acuerdo: no existe un interlocutor privado. */
interface ChatAcuerdoVisual {
  id: string;
  acuerdoId: string;
  tituloAcuerdo: string;
  estadoAcuerdo: EstadoAcuerdoChat;
}

interface MiembroAvatar {
  name: string;
  avatar?: string;
  avatarColor: string;
}


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
}

/** Los mensajes del chat son reales; nunca se agregan mensajes locales sin respuesta del servidor. */
function adaptarMensaje(m: MensajeAPI): MensajeChat {
  return {
    id: m.id, senderId: m.emisor.id, text: m.contenido, type: 'text',
    createdAt: new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(new Date(m.fecha)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 01. VENTANA: IDENTIFICAR LA CONVERSACIÓN DESDE LA URL
// ─────────────────────────────────────────────────────────────────────────────

export default function Chat(props: ChatProps) {
  const { acuerdoId } = useParams<{ acuerdoId: string }>();
  const navigate = useNavigate();
  const { perfil } = useMiembroSesion();
  const perfilId = perfil?.id;
  const [chat, setChat] = useState<ChatAcuerdoVisual | null>(null);
  const [participantes, setParticipantes] = useState<ParticipanteChatAPI[]>([]);
  const [mensajesIniciales, setMensajesIniciales] = useState<MensajeChat[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!acuerdoId || !perfilId) {
      setCargando(false);
      setError('No se pudo identificar el acuerdo o el perfil de tu sesión.');
      return;
    }
    let vigente = true;
    setCargando(true);
    setError(null);
    setChat(null);
    setParticipantes([]);
    void (async () => {
      try {
        // Solo se accede al chat desde su acuerdo; no se aceptan IDs de chat en la URL.
        const [acuerdo, integrantesAcuerdo] = await Promise.all([
          obtenerAcuerdo(acuerdoId),
          obtenerParticipantesAcuerdo(acuerdoId),
        ]);
        if (!integrantesAcuerdo.some(p => p.idPerfil === perfilId)) {
          throw new Error('No participas en este acuerdo de servicio.');
        }
        const chatId = acuerdo.chat?.id;
        if (!chatId) throw new Error('Este acuerdo todavía no tiene un chat asociado.');

        const integrantesChat = await obtenerParticipantesChat(chatId);
        // Protección de interfaz; las comprobaciones de autorización reales pertenecen al backend.
        const idsAcuerdo = new Set(integrantesAcuerdo.map(p => p.idPerfil));
        const idsChat = new Set(integrantesChat.map(p => p.id));
        if (!idsChat.has(perfilId) || integrantesChat.some(p => !idsAcuerdo.has(p.id)) ||
            integrantesAcuerdo.some(p => !idsChat.has(p.idPerfil))) {
          throw new Error('Los participantes del chat no corresponden al acuerdo. Es necesario sincronizarlos en el backend.');
        }

        const mensajes = await obtenerMensajesChat(chatId);
        if (!vigente) return;
        const titulo = acuerdo.postAyuda?.titulo ?? acuerdo.solicitud?.titulo ?? 'Acuerdo de servicio';
        const estado: EstadoAcuerdoChat =
          acuerdo.estado === EstadoAcuerdoAPI.REALIZADO ? 'completed' :
          acuerdo.estado === EstadoAcuerdoAPI.CANCELADO ? 'cancelled' :
          acuerdo.estado === EstadoAcuerdoAPI.ACORDADO || acuerdo.estado === EstadoAcuerdoAPI.EN_MODIFICACION ? 'accepted' : 'pending';
        setChat({
          id: chatId,
          acuerdoId: acuerdo.id,
          tituloAcuerdo: titulo,
          estadoAcuerdo: estado,
        });
        setParticipantes(integrantesChat);
        setMensajesIniciales(mensajes.map(adaptarMensaje));
      } catch (e) {
        if (vigente) setError(e instanceof Error ? e.message : 'No se pudo cargar el chat del acuerdo.');
      } finally {
        if (vigente) setCargando(false);
      }
    })();
    return () => { vigente = false; };
  }, [acuerdoId, perfilId, revision]);

  if (cargando || error || !chat || !perfilId) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <p role={error ? 'alert' : 'status'} className="text-sm text-[#737373]">
          {cargando ? 'Cargando conversación…' : error ?? 'Conversación no encontrada.'}
        </p>
        {error && <button type="button" className="text-sm font-semibold text-[#3C9DA0]" onClick={() => setRevision(v => v + 1)}>Reintentar</button>}
        <button type="button" onClick={() => navigate(acuerdoId ? `/acuerdos/${acuerdoId}` : '/actividad')} className="rounded-xl bg-[#3C9DA0] px-4 py-2 text-sm font-semibold text-white">Volver al acuerdo</button>
      </main>
    );
  }

  return (
    <Conversacion
      key={chat.id}
      chat={chat}
      miId={perfilId}
      participantes={participantes}
      mensajesIniciales={mensajesIniciales}
      onEnviarMensaje={async (contenido) => {
        await enviarMensajeChat(chat.id, perfilId, contenido);
        return (await obtenerMensajesChat(chat.id)).map(adaptarMensaje);
      }}
      onVolver={() => navigate(`/acuerdos/${acuerdoId}`)}
      {...props}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 02. COMPONENTE: CONVERSACIÓN SELECCIONADA
// ─────────────────────────────────────────────────────────────────────────────

interface ConversacionProps extends ChatProps {
  chat: ChatAcuerdoVisual;
  participantes: ParticipanteChatAPI[];
  miId: string;
  onVolver: () => void;
  mensajesIniciales: MensajeChat[];
  onEnviarMensaje: (contenido: string) => Promise<MensajeChat[]>;
}

function Conversacion({
  chat,
  participantes,
  miId,
  onVolver,
  mensajesIniciales,
  onEnviarMensaje,
  onAbrirPerfil,
  onVerAcuerdo,
}: ConversacionProps) {
  const { tituloAcuerdo, acuerdoId, estadoAcuerdo } = chat;

  // 02.1 Estado visual; los mensajes provienen del backend.
  const [mensajes, setMensajes] = useState<MensajeChat[]>(mensajesIniciales);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const contenedorMensajesRef = useRef<HTMLDivElement>(null);

  // 02.2 MANTENER A LA VISTA EL ÚLTIMO MENSAJE, SIN MOVER TODA LA PÁGINA
  useEffect(() => {
    const contenedor = contenedorMensajesRef.current;
    if (contenedor) {
      contenedor.scrollTop = contenedor.scrollHeight;
    }
  }, [mensajes]);

  // 02.3 Solo mostrar el mensaje tras confirmar el POST y refrescar la consulta.
  async function enviarMensaje() {
    const contenido = texto.trim();
    if (!contenido || enviando) return;
    setEnviando(true); setErrorEnvio(null);
    try {
      setMensajes(await onEnviarMensaje(contenido));
      setTexto('');
    } catch (e) {
      setErrorEnvio(e instanceof Error ? e.message : 'No se pudo enviar el mensaje.');
    } finally {
      setEnviando(false);
    }
  }

  const puedeAccionarAcuerdo = Boolean(onVerAcuerdo);

  return (
    <section
      data-section="chat-del-acuerdo"
      className="flex h-[calc(100dvh-6rem)] min-h-0 min-w-0 flex-col overflow-hidden bg-white lg:h-dvh"
    >
      {/* 03. ENCABEZADO DE LA CONVERSACIÓN */}
      <header
        data-section="encabezado-chat"
        className="z-20 shrink-0 border-b border-[#E8E8E8] bg-white px-4 pt-12 pb-3 lg:pt-4"
      >
        <div className="mx-auto flex w-full max-w-2xl min-w-0 items-center gap-3">
          {/* 03.1 REGRESAR AL ACUERDO */}
          <button
            type="button"
            onClick={onVolver}
            aria-label="Volver al acuerdo"
            className="shrink-0 cursor-pointer rounded-full p-1 text-[#0D0D0D] transition-colors hover:bg-[#F6F6F6] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3C9DA0]"
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </button>

          {/* 03.2 IDENTIDAD DEL ACUERDO Y SUS PARTICIPANTES */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3C9DA0] text-white">
              <UsersRound size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[#0D0D0D]">
                {tituloAcuerdo}
              </span>
              <span className="block text-xs text-[#9E9E9E]">
                Chat del acuerdo · {participantes.length} participantes
              </span>
            </span>
          </div>

          {/* 03.3 ACCESO AL ACUERDO */}
          <button
            type="button"
            disabled={!puedeAccionarAcuerdo}
            onClick={() => onVerAcuerdo?.(acuerdoId)}
            title={puedeAccionarAcuerdo ? undefined : 'No se pudo identificar el acuerdo'}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3C9DA0] ${puedeAccionarAcuerdo ? 'cursor-pointer active:scale-95' : 'cursor-default'} bg-[#E8F5F6] text-[#3C9DA0]`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Ver acuerdo
          </button>
        </div>
      </header>

      {/* 04. MENSAJES: SOLO ESTA REGIÓN TIENE DESPLAZAMIENTO VERTICAL */}
      <div
        ref={contenedorMensajesRef}
        role="log"
        aria-label={`Mensajes del acuerdo ${tituloAcuerdo}`}
        data-section="mensajes-chat"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
      >
        <div className="mx-auto w-full max-w-2xl space-y-3">
          {mensajes.map((mensaje) => {
            const esPropio = mensaje.senderId === miId;
            const emisor = participantes.find(p => p.id === mensaje.senderId);

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
                    disabled={!onVerAcuerdo}
                    onClick={() => onVerAcuerdo?.(acuerdoId)}
                    className={`w-full max-w-xs rounded-2xl border border-[#3C9DA0] bg-[#E8F5F6] p-4 text-left ${onVerAcuerdo ? 'cursor-pointer transition-colors hover:bg-[#D7EEEF] active:scale-[0.99]' : 'cursor-default'}`}
                  >
                    <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#3C9DA0]">
                      <Clock3 size={16} aria-hidden="true" />
                      <span style={{ fontFamily: 'Outfit, sans-serif' }}>ACUERDO PROPUESTO</span>
                    </span>
                    <span className="block text-sm font-medium text-[#0D0D0D]">{mensaje.text}</span>
                    <EstadoAcuerdo estado={estadoAcuerdo} />
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
                    <AvatarChat interlocutor={{
                      name: emisor?.nombre ?? 'Participante',
                      avatar: emisor?.imagen ?? undefined,
                      avatarColor: '#3C9DA0',
                    }} tamaño="xs" />
                  </div>
                )}
                <div className="max-w-[78%] min-w-0 sm:max-w-[72%]">
                  {!esPropio && (
                    <button
                      type="button"
                      disabled={!onAbrirPerfil}
                      onClick={() => onAbrirPerfil?.(mensaje.senderId)}
                      className="mb-1 text-xs font-semibold text-[#737373] disabled:cursor-default"
                    >
                      {emisor?.nombre ?? 'Participante'}
                    </button>
                  )}
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
          void enviarMensaje();
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

          {errorEnvio && <span role="alert" className="max-w-[150px] text-xs text-red-600">{errorEnvio}</span>}
          {/* 05.2 TEXTO DEL MENSAJE */}
          <div className="flex min-w-0 flex-1 items-end rounded-2xl bg-[#F6F6F6] px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#3C9DA0]/30">
            <textarea
              aria-label="Escribir mensaje"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              onKeyDown={(evento) => {
                if (evento.key === 'Enter' && !evento.shiftKey && !evento.nativeEvent.isComposing) {
                  evento.preventDefault();
                  void enviarMensaje();
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
            disabled={!texto.trim() || enviando}
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
}: {
  interlocutor: MiembroAvatar;
  tamaño: 'sm' | 'xs';
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
    <span className={`relative block shrink-0 ${clasesTamaño}`} data-section="avatar-participante">
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
