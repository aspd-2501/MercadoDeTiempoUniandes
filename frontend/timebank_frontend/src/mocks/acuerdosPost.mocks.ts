import type { AcuerdoServicio } from '../tipos/acuerdo';
import { ACUERDOS_DEMO } from './acuerdos.mocks';

/**
 * Mocks de navegación: representan respuestas del backend después de participar
 * en un post. NO registran miembros ni crean acuerdos reales.
 *
 * Los ejemplos están preparados para la sesión simulada "miembro-demo-1".
 */
export const ACUERDOS_POST_DEMO: Record<string, AcuerdoServicio> = {
  'acuerdo-demo-desde-post-1': {
    id: 'acuerdo-demo-desde-post-1',
    postId: 'post-ayuda-1',
    servicio: 'Ayuda con cálculo diferencial',
    proveedorId: 'miembro-demo-1',
    solicitanteId: 'miembro-demo-3',
    estado: 'pending',
    estadoHorario: 'pending',
    duracionHoras: 2,
    creditosHoras: 2,
    resumenParticipantes: 'Camila Torres',
    disponibilidadParticipantes: [
      { userId: 'miembro-demo-1', submitted: false, intervals: [] },
      { userId: 'miembro-demo-3', submitted: false, intervals: [] },
    ],
    resultadoDisponibilidad: { estado: 'pendiente' },
  },
  'acuerdo-demo-desde-post-2': {
    id: 'acuerdo-demo-desde-post-2',
    postId: 'post-ayuda-2',
    servicio: 'Práctica de conversación en inglés',
    proveedorId: 'miembro-demo-2',
    solicitanteId: 'miembro-demo-1',
    estado: 'pending',
    estadoHorario: 'pending',
    duracionHoras: 1,
    creditosHoras: 1,
    resumenParticipantes: 'Carlos Martínez',
    disponibilidadParticipantes: [
      { userId: 'miembro-demo-1', submitted: false, intervals: [] },
      { userId: 'miembro-demo-2', submitted: false, intervals: [] },
    ],
    resultadoDisponibilidad: { estado: 'pendiente' },
  },
};

/** La tercera publicación ya está asociada a un acuerdo pendiente en los mocks. */
export const ID_ACUERDO_POR_POST_DEMO: Record<string, string> = {
  'post-ayuda-1': 'acuerdo-demo-desde-post-1',
  'post-ayuda-2': 'acuerdo-demo-desde-post-2',
  'post-ayuda-3': 'acuerdo-demo-pendiente',
};

/** Compartir esta colección con AcuerdoDetail, sin modificar sus mocks existentes. */
export const ACUERDOS_PARA_DETALLE_DEMO: Record<string, AcuerdoServicio> = {
  ...ACUERDOS_DEMO,
  ...ACUERDOS_POST_DEMO,
};
