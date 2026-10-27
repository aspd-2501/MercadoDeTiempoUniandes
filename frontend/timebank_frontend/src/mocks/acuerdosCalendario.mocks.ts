import type { AcuerdoCalendario } from '../tipos/acuerdoCalendario';

/**
 * DATOS SIMULADOS: acuerdos próximos del miembro autenticado.
 *
 * Este arreglo representa una respuesta YA PREPARADA por el backend.
 * No se calculan coincidencias ni se filtran estados dentro del frontend.
 * Las fechas son relativas al día actual para poder probar el calendario
 * sin depender de una fecha fija de Figma.
 *
 * Ubicación: src/mocks/acuerdosCalendario.mocks.ts
 */
function fechaDentroDe(dias: number): string {
  const fecha = new Date();
  fecha.setHours(12, 0, 0, 0);
  fecha.setDate(fecha.getDate() + dias);

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export const ACUERDOS_CALENDARIO_DEMO: AcuerdoCalendario[] = [
  {
    id: 'acuerdo-demo-1',
    fecha: fechaDentroDe(1),
    horaInicio: '09:00',
    horaFin: '10:30',
    servicio: 'Tutoría de cálculo',
    participantes: 'Camila Torres',
  },
  {
    id: 'acuerdo-demo-2',
    fecha: fechaDentroDe(2),
    horaInicio: '15:00',
    horaFin: '17:00',
    servicio: 'Conversación en inglés',
    participantes: 'Carlos Martínez',
  },
  {
    id: 'acuerdo-demo-3',
    fecha: fechaDentroDe(4),
    horaInicio: '11:00',
    horaFin: '12:00',
    servicio: 'Introducción a Python',
    participantes: 'Santiago Gómez',
  },
  {
    id: 'acuerdo-demo-4',
    fecha: fechaDentroDe(6),
    horaInicio: '18:30',
    horaFin: '20:00',
    servicio: 'Estudio en grupo',
    participantes: '4 participantes',
  },
];
