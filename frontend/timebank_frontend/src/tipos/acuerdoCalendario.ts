/**
 * MODELO DE DATOS: acuerdo confirmado que aparece en el calendario personal.
 *
 * Esta es una representación de lectura para el frontend. La API debe devolver
 * únicamente los acuerdos programados y visibles para el miembro autenticado.
 * La vista no decide qué acuerdos están confirmados, cancelados o finalizados.
 *
 * Ubicación: src/tipos/acuerdoCalendario.ts
 */
export interface AcuerdoCalendario {
  id: string;
  fecha: string;       // YYYY-MM-DD (fecha local del acuerdo)
  horaInicio: string;  // HH:mm, formato de 24 horas
  horaFin: string;     // HH:mm, formato de 24 horas
  servicio: string;
  participantes: string; // Texto para mostrar: nombre o número de participantes
}