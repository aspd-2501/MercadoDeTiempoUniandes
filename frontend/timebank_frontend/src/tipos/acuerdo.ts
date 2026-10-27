import type {
  DisponibilidadParticipante,
  IntervaloDisponibilidad,
  ResultadoDisponibilidad,
} from './disponibilidad';

/**
 * MODELO DE LECTURA: acuerdo de servicio recibido de la API (o mocks).
 * El backend determina el estado, la asignación horaria, los créditos y
 * las confirmaciones. El frontend solo presenta estos datos.
 *
 * Ubicación: src/tipos/acuerdo.ts
 */
export type EstadoAcuerdo =
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type EstadoHorarioAcuerdo = 'pending' | 'scheduled';

export interface PropuestaCambioAcuerdo {
  id: string;
  autorId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  duracionHoras: number;
  motivo?: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
}

export interface DatosPropuestaCambio {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  duracionHoras: number;
  motivo: string;
}

export interface ConfirmacionesAcuerdo {
  proveedorConfirmo: boolean;
  solicitanteConfirmo: boolean;
  /** Lo determina la API: no se calcula en la vista a partir de la fecha. */
  habilitada: boolean;
}

export interface AcuerdoServicio {
  id: string;
  servicio: string;
  proveedorId: string;
  solicitanteId: string;
  otrosParticipantesIds?: string[];
  estado: EstadoAcuerdo;
  estadoHorario: EstadoHorarioAcuerdo;
  duracionHoras: number;
  creditosHoras: number;
  /** Etiqueta de lectura para el calendario personal. */
  resumenParticipantes: string;
  fechaProgramada?: string;
  horaInicio?: string;
  horaFin?: string;
  postId?: string;
  chatId?: string;
  notas?: string;
  disponibilidadParticipantes?: DisponibilidadParticipante[];
  resultadoDisponibilidad?: ResultadoDisponibilidad;
  propuestaCambio?: PropuestaCambioAcuerdo;
  confirmaciones?: ConfirmacionesAcuerdo;
  /** Opcional: alternativa si el acuerdo no tiene post de origen. */
  horarioPreferidoOrigen?: IntervaloDisponibilidad;
}
