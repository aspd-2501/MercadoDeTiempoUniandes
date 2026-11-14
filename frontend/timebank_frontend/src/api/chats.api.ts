import { clienteApi } from './clienteApi';

export interface ChatAPI {
  id: string;
  mensajes: { id: string; contenido: string; fecha: string }[];
}
export interface ParticipanteChatAPI { id: string; nombre: string; imagen?: string | null }
export interface MensajeAPI {
  id: string;
  contenido: string;
  fecha: string;
  emisor: { id: string; nombre: string };
}
export function obtenerParticipantesChat(id: string) {
  return clienteApi<ParticipanteChatAPI[]>(`/chats/${encodeURIComponent(id)}/perfiles`);
}
export function obtenerChat(id: string) {
  return clienteApi<ChatAPI>(`/chats/${encodeURIComponent(id)}`);
}
/** GET /chats/:id incluye los mensajes, pero no su emisor expandido.
 * La API actual expone GET /mensajes/:id; se usa para completar esos datos. */
export async function obtenerMensajesChat(id: string) {
  const chat = await obtenerChat(id);
  const mensajes = await Promise.all(chat.mensajes.map(m =>
    clienteApi<MensajeAPI>(`/mensajes/${encodeURIComponent(m.id)}`),
  ));
  return mensajes.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
}
export function enviarMensajeChat(chatId: string, emisorId: string, contenido: string) {
  return clienteApi<MensajeAPI>('/mensajes', {
    metodo: 'POST', datos: { chatId, emisorId, contenido },
  });
}
