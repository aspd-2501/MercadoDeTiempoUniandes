import { clienteApi } from './clienteApi';
import type { AcuerdoAPI } from './acuerdos.api';

/**
 * POST /acuerdos/iniciar (backend src(5)).
 * El servidor crea el acuerdo, los participantes y el chat en una transacción.
 * No enviamos fechaRealizacion: se establecerá cuando las disponibilidades coincidan.
 * IMPORTANTE: el backend actual exige perfilId en el cuerpo; la autorización con JWT
 * sigue siendo una tarea pendiente del servidor, NO un control de React.
 */
export interface ParticipacionCreadaAPI {
  acuerdoId: string;
  chatId: string;
}

export async function participarEnPublicacion(
  postId: string,
  perfilId: string,
): Promise<ParticipacionCreadaAPI> {
  if (!postId || !perfilId) throw new Error('Se necesita una publicación y un perfil autenticado.');

  const acuerdo = await clienteApi<AcuerdoAPI>('/acuerdos/iniciar', {
    metodo: 'POST',
    datos: { postAyudaId: postId, perfilId },
  });
  if (!acuerdo?.id || !acuerdo.chat?.id) {
    throw new Error('El servidor no confirmó el acuerdo y su chat. Revisa Actividad antes de reintentar.');
  }
  return { acuerdoId: acuerdo.id, chatId: acuerdo.chat.id };
}
