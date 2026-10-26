
/**
 * MODELOS DE DATOS: disponibilidad para encuentros del Banco de Tiempo.
 *
 * Las propiedades id, date, startTime y endTime conservan los nombres
 * utilizados por EventoCalendario en CalendarioFranjasHoras.tsx.
 *
 * Ubicación: src/tipos/disponibilidad.ts
 */

// ──────────────────── 01. FRANJA DE DISPONIBILIDAD ────────────────────

/**
 * Un intervalo de un día específico.
 *
 * date: YYYY-MM-DD
 * startTime y endTime: HH:mm en formato de 24 horas.
 * endTime debe ser posterior a startTime; un intervalo no cruza medianoche.
 */
export interface IntervaloDisponibilidad {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

// ──────────────────── 02. DISPONIBILIDAD DE UN PARTICIPANTE ────────────────────

/**
 * Indica si un miembro ya entregó su disponibilidad y sus franjas.
 *
 * submitted diferencia una respuesta enviada de otra aún pendiente.
 * Un participante puede enviar varias franjas, incluso en un mismo día.
 */
export interface DisponibilidadParticipante {
  userId: string;
  submitted: boolean;
  intervals: IntervaloDisponibilidad[];
}

// ──────────────────── 03. RESULTADO DE PLANIFICACIÓN ────────────────────

/**
 * Resultado calculado por el backend y recibido por el frontend.
 * El frontend NO debe determinar por su cuenta si las franjas coinciden.
 */
export type ResultadoDisponibilidad =
  | { estado: 'pendiente' }
  | { estado: 'compatible'; intervalo: IntervaloDisponibilidad }
  | { estado: 'insuficiente'; intervalo: IntervaloDisponibilidad }
  | { estado: 'sin-coincidencia' };
