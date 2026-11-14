import { clienteApi } from './clienteApi';

export interface EventoAgendaAPI {
  tipo: 'ACUERDO' | 'ACTIVIDAD';
  id: string;
  titulo: string;
  inicio: string;
  fin: string;
  participantes: string[];
}
export function obtenerCalendarioMiembro(perfilId: string, desde: string, hasta: string) {
  const query = new URLSearchParams({ desde, hasta });
  return clienteApi<EventoAgendaAPI[]>(`/perfiles-miembro/${encodeURIComponent(perfilId)}/calendario?${query}`);
}
