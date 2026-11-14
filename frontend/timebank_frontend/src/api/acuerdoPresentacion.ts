/** Adaptación EXCLUSIVAMENTE visual del contrato NestJS a la vista existente. */
import {
  EstadoAcuerdoAPI,
  type AcuerdoAPI,
  type ParticipanteAcuerdoAPI,
  type DisponibilidadDetalleAPI,
  type SolicitudCambioAPI,
} from './acuerdos.api';
import type { AcuerdoServicio } from '../tipos/acuerdo';
import type { IntervaloDisponibilidad, ResultadoDisponibilidad } from '../tipos/disponibilidad';

function piezas(fechaIso: string) {
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return { dia: '', inicio: '', fin: '' };
  const dia = [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, '0'), String(fecha.getDate()).padStart(2, '0')].join('-');
  const hora = `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
  return { dia, inicio: hora, fin: hora };
}
export function intervaloVisible(inicio: string, fin: string, id: string): IntervaloDisponibilidad {
  const a = piezas(inicio); const b = piezas(fin);
  return { id, date: a.dia, startTime: a.inicio, endTime: b.inicio };
}
export function convertirAcuerdo(
  api: AcuerdoAPI,
  participantes: ParticipanteAcuerdoAPI[],
  disponibilidad: DisponibilidadDetalleAPI,
  solicitudes: SolicitudCambioAPI[],
  miId: string,
): AcuerdoServicio {
  const prestadores = participantes.filter(p => p.rol === 'PRESTADOR');
  const receptores = participantes.filter(p => p.rol === 'RECEPTOR');
  const proveedorId = prestadores[0]?.idPerfil ?? '';
  const solicitanteId = receptores[0]?.idPerfil ?? '';
  const inicio = api.horarioAcordado?.fechaInicio;
  const fin = api.horarioAcordado?.fechaFin;
  const fecha = inicio ? piezas(inicio) : null;
  const pendiente = solicitudes.find(s => s.estado === 0);
  const fechaPropuesta = pendiente?.fechaRealizacion ? piezas(pendiente.fechaRealizacion) : null;
  const resultado: ResultadoDisponibilidad = disponibilidad.resultado.estado === 'compatible' || disponibilidad.resultado.estado === 'insuficiente'
    ? {
        estado: disponibilidad.resultado.estado,
        intervalo: intervaloVisible(disponibilidad.resultado.intervalo.inicio, disponibilidad.resultado.intervalo.fin, 'coincidencia-backend'),
      }
    : { estado: disponibilidad.resultado.estado };
  const propio = participantes.find(p => p.idPerfil === miId);
  const otro = participantes.find(p => p.idPerfil !== miId);

  return {
    id: api.id,
    servicio: api.postAyuda?.titulo ?? api.solicitud?.titulo ?? 'Acuerdo de servicio',
    proveedorId,
    solicitanteId,
    otrosParticipantesIds: participantes.map(p => p.idPerfil).filter(id => id !== proveedorId && id !== solicitanteId),
    estado: api.estado === EstadoAcuerdoAPI.REALIZADO ? 'completed' :
      api.estado === EstadoAcuerdoAPI.CANCELADO ? 'cancelled' :
      api.estado === EstadoAcuerdoAPI.ACORDADO || api.estado === EstadoAcuerdoAPI.EN_MODIFICACION ? 'accepted' : 'pending',
    estadoHorario: api.horarioAcordado ? 'scheduled' : 'pending',
    duracionHoras: api.horas,
    creditosHoras: api.horas, // horas del acuerdo; no equivale a saldo ni cuota por persona
    resumenParticipantes: participantes.map(p => p.perfil?.nombre ?? 'Miembro').join(', '),
    fechaProgramada: fecha?.dia,
    horaInicio: fecha?.inicio,
    horaFin: fin ? piezas(fin).inicio : undefined,
    postId: api.postAyuda?.id,
    chatId: api.chat?.id,
    disponibilidadParticipantes: disponibilidad.participantes.map(p => ({
      userId: p.perfilId,
      submitted: p.envioDisponibilidad,
      intervals: p.franjas.map((f, i) => intervaloVisible(f.inicio, f.fin, `${p.perfilId}-${i}`)),
    })),
    resultadoDisponibilidad: resultado,
    propuestaCambio: pendiente ? {
      id: pendiente.id,
      autorId: pendiente.solicitante?.id ?? '',
      fecha: fechaPropuesta?.dia ?? fecha?.dia ?? '',
      horaInicio: fechaPropuesta?.inicio ?? fecha?.inicio ?? '',
      horaFin: '', // No hay hora final propuesta en el DTO del backend
      duracionHoras: pendiente.horas ?? api.horas,
      estado: 'pendiente',
      tipo: pendiente.tipo,
      aprobacionesIds: pendiente.aprobaciones?.map(a => a.idPerfil) ?? [],
    } : undefined,
    confirmaciones: {
      proveedorConfirmo: participantes.find(p => p.idPerfil === proveedorId)?.confirmoPrestacion ?? false,
      solicitanteConfirmo: participantes.find(p => p.idPerfil === solicitanteId)?.confirmoPrestacion ?? false,
      habilitada: api.estado === EstadoAcuerdoAPI.ACORDADO &&
        Boolean(api.horarioAcordado) && new Date(api.fechaRealizacion).getTime() <= Date.now() &&
        Boolean(propio) && Boolean(otro),
    },
  };
}
