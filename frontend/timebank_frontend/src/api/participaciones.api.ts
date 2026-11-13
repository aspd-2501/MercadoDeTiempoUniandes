import { clienteApi } from './clienteApi';

/**
 * CONTRATO PROPUESTO (todavía no implementado en el backend del 10-11-2026).
 * POST /api/v1/posts-ayuda/:postId/participaciones
 * El backend extrae el perfil desde el JWT y realiza TODO dentro de una transacción.
 * NO enviar perfilId, roles, horas ni IDs de chat/acuerdo desde el cliente.
 */
export interface ParticipacionCreadaAPI {
  acuerdoId: string;
  chatId: string;
}

/**
 * Solo utilizar cuando el endpoint exista y el backend garantice atomicidad,
 * autorización, idempotencia y cupos bajo concurrencia.
 */
export async function participarEnPublicacion(postId: string): Promise<ParticipacionCreadaAPI> {
  const resultado = await clienteApi<ParticipacionCreadaAPI>(
    `/posts-ayuda/${encodeURIComponent(postId)}/participaciones`,
    { metodo: 'POST' },
  );

  if (!resultado || typeof resultado.acuerdoId !== 'string' || !resultado.acuerdoId ||
      typeof resultado.chatId !== 'string' || !resultado.chatId) {
    throw new Error('La respuesta de participación no contiene el acuerdo y el chat.');
  }

  return resultado;
}
