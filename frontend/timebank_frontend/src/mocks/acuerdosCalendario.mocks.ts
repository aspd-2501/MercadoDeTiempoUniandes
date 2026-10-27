import type { AcuerdoCalendario } from '../tipos/acuerdoCalendario';
import { ACUERDOS_DEMO } from './acuerdos.mocks';

/**
 * PROYECCIÓN MOCK PARA EL CALENDARIO PERSONAL.
 * Los cuatro IDs están explícitamente seleccionados como acuerdos próximos;
 * la selección definitiva corresponderá a la API.
 * Se comparte la misma información con AcuerdoDetail y se evitan duplicados.
 *
 * Ubicación: src/mocks/acuerdosCalendario.mocks.ts
 */
const IDS_CALENDARIO_DEMO = [
  'acuerdo-demo-1',
  'acuerdo-demo-2',
  'acuerdo-demo-3',
  'acuerdo-demo-4',
];

export const ACUERDOS_CALENDARIO_DEMO: AcuerdoCalendario[] =
  IDS_CALENDARIO_DEMO.flatMap((id) => {
    const acuerdo = ACUERDOS_DEMO[id];
    if (!acuerdo?.fechaProgramada || !acuerdo.horaInicio || !acuerdo.horaFin) {
      return [];
    }
    return [{
      id: acuerdo.id,
      fecha: acuerdo.fechaProgramada,
      horaInicio: acuerdo.horaInicio,
      horaFin: acuerdo.horaFin,
      servicio: acuerdo.servicio,
      participantes: acuerdo.resumenParticipantes,
    }];
  });
