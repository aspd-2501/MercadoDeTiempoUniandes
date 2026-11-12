import { clienteApi } from './clienteApi';

/**
 * Contrato de lectura de las entidades reales de NestJS.
 * Fuente: src/agenda-miembro/agenda-miembro.service.ts,
 * src/acuerdo/acuerdo.entity.ts y src/acuerdo/participante-acuerdo.entity.ts.
 * No traducimos los estados a cadenas ni añadimos campos que no existen.
 */
// Objeto literal en lugar de enum: compatible con erasableSyntaxOnly en Vite.
export const EstadoAcuerdoAPI = {
  EN_CREACION: 0,
  ACORDADO: 1,
  REALIZADO: 2,
  EN_MODIFICACION: 3,
  CANCELADO: 4,
} as const;

export type EstadoAcuerdoAPI =
  (typeof EstadoAcuerdoAPI)[keyof typeof EstadoAcuerdoAPI];

export type FiltroAcuerdosAPI = 'pendientes' | 'completados' | 'cancelados';

export interface PerfilParticipanteAPI {
  id: string;
  nombre: string;
  imagen: string | null;
  afiliacionUniandes: string;
}

export interface ParticipanteAcuerdoAPI {
  idAcuerdo: string;
  idPerfil: string;
  rol: 'PRESTADOR' | 'RECEPTOR';
  confirmoPrestacion: boolean;
  fechaConfirmacion: string | null;
  envioDisponibilidad: boolean;
  perfil?: PerfilParticipanteAPI;
}

export interface HorarioAcordadoAPI {
  id: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface OrigenAcuerdoAPI {
  id: string;
  titulo: string;
}

export interface ChatAcuerdoAPI {
  id: string;
}

export interface AcuerdoAPI {
  id: string;
  horas: number;
  fechaCreacion: string;
  fechaRealizacion: string;
  estado: EstadoAcuerdoAPI;
  postAyuda: OrigenAcuerdoAPI | null;
  solicitud: OrigenAcuerdoAPI | null;
  participantes: ParticipanteAcuerdoAPI[];
  horarioAcordado: HorarioAcordadoAPI | null;
  chat?: ChatAcuerdoAPI | null;
}

/**
 * GET /api/v1/perfiles-miembro/:perfilId/acuerdos?filtro=...
 * La consulta YA está limitada por el backend a los acuerdos del miembro.
 * Los filtros de estado y el ordenamiento también son responsabilidad de NestJS.
 */
export function obtenerAcuerdosMiembro(
  perfilId: string,
  filtro: FiltroAcuerdosAPI,
): Promise<AcuerdoAPI[]> {
  const parametros = new URLSearchParams({ filtro });
  return clienteApi<AcuerdoAPI[]>(
    `/perfiles-miembro/${encodeURIComponent(perfilId)}/acuerdos?${parametros.toString()}`,
  );
}

/** El detalle necesita además participantes con perfil, disponibilidades y propuestas. */
export interface FranjaAcuerdoAPI { inicio: string; fin: string }
export interface DisponibilidadDetalleAPI {
  participantes: {
    perfilId: string;
    rol: 'PRESTADOR' | 'RECEPTOR';
    envioDisponibilidad: boolean;
    franjas: FranjaAcuerdoAPI[];
  }[];
  resultado: { estado: 'pendiente' | 'sin-coincidencia' } |
    { estado: 'compatible' | 'insuficiente'; intervalo: FranjaAcuerdoAPI };
  horarioAcordado: FranjaAcuerdoAPI | null;
}
export interface SolicitudCambioAPI {
  id: string;
  tipo: 'MODIFICACION' | 'CANCELACION';
  horas: number | null;
  fechaRealizacion: string | null;
  estado: 0 | 1 | 2 | 3;
  solicitante?: { id: string; nombre: string };
  aprobaciones?: { idPerfil: string }[];
}
export interface DetalleAcuerdoAPI extends AcuerdoAPI {
  solicitudesModificacion?: SolicitudCambioAPI[];
}
const rutaAcuerdo = (id: string) => `/acuerdos/${encodeURIComponent(id)}`;

export function obtenerAcuerdo(id: string): Promise<DetalleAcuerdoAPI> {
  return clienteApi<DetalleAcuerdoAPI>(rutaAcuerdo(id));
}
export function obtenerParticipantesAcuerdo(id: string): Promise<ParticipanteAcuerdoAPI[]> {
  return clienteApi<ParticipanteAcuerdoAPI[]>(`${rutaAcuerdo(id)}/participantes`);
}
export function obtenerDisponibilidadAcuerdo(id: string): Promise<DisponibilidadDetalleAPI> {
  return clienteApi<DisponibilidadDetalleAPI>(`${rutaAcuerdo(id)}/disponibilidad`);
}
export function obtenerSolicitudesCambio(id: string): Promise<SolicitudCambioAPI[]> {
  return clienteApi<SolicitudCambioAPI[]>(`${rutaAcuerdo(id)}/solicitudes-modificacion`);
}
export async function obtenerDetalleAcuerdo(id: string) {
  const [acuerdo, participantes, disponibilidad, solicitudes] = await Promise.all([
    obtenerAcuerdo(id), obtenerParticipantesAcuerdo(id),
    obtenerDisponibilidadAcuerdo(id), obtenerSolicitudesCambio(id),
  ]);
  return { acuerdo, participantes, disponibilidad, solicitudes };
}
export function guardarDisponibilidadAcuerdo(id: string, perfilId: string, franjas: FranjaAcuerdoAPI[]) {
  return clienteApi<DisponibilidadDetalleAPI>(`${rutaAcuerdo(id)}/disponibilidad/${encodeURIComponent(perfilId)}`, {
    metodo: 'PUT', datos: { franjas: franjas.map(f => ({ fechaInicio: f.inicio, fechaFin: f.fin })) },
  });
}
export function solicitarCambioAcuerdo(id: string, perfilId: string, datos: {
  tipo: 'MODIFICACION' | 'CANCELACION'; horas?: number; fechaRealizacion?: string;
}) {
  return clienteApi<SolicitudCambioAPI>(`${rutaAcuerdo(id)}/solicitudes-modificacion`, {
    metodo: 'POST', datos: { solicitanteId: perfilId, ...datos },
  });
}
export function responderCambioAcuerdo(id: string, solicitudId: string, perfilId: string, decision: 'aprobar' | 'rechazar') {
  return clienteApi<SolicitudCambioAPI>(`${rutaAcuerdo(id)}/solicitudes-modificacion/${encodeURIComponent(solicitudId)}/${decision}`, {
    metodo: 'POST', datos: { perfilId },
  });
}
export function confirmarPrestacionAcuerdo(id: string, perfilId: string) {
  return clienteApi<DetalleAcuerdoAPI>(`${rutaAcuerdo(id)}/confirmaciones/${encodeURIComponent(perfilId)}`, {
    metodo: 'POST',
  });
}
