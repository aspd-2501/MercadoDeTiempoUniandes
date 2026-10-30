import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Pencil,
  UsersRound,
} from 'lucide-react';

import type { AcuerdoServicio } from '../../tipos/acuerdo';
import { MIEMBROS_DEMO } from '../../mocks/miembros.mocks';

/**
 * COMPONENTE: Tarjeta resumida de un acuerdo de servicio.
 *
 * - Muestra solamente la información recibida: no modifica estados.
 * - El estado 'pending' significa acuerdo pendiente de definir, NO
 *   participación pendiente de aceptación.
 * - Las acciones de navegación se reciben desde la ventana padre.
 *
 * Ubicación: src/componentes/acuerdos/AcuerdoCard.tsx
 */

// ──────────────────── 00. PROPIEDADES ────────────────────
export interface AcuerdoCardProps {
  acuerdo: AcuerdoServicio;
  miembroActualId: string;
  onVerAcuerdo?: (acuerdoId: string) => void;
  onIrChat?: (chatId: string) => void;
}

// ──────────────────── 00. FORMATO DE PRESENTACIÓN ────────────────────
function mostrarFecha(fechaISO?: string): string {
  if (!fechaISO) return 'Por definir';
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia, 12);
  if (Number.isNaN(fecha.getTime())) return fechaISO;
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(fecha);
}

function mostrarHora(hora?: string): string {
  if (!hora) return '';
  const [horas, minutos] = hora.split(':').map(Number);
  if (!Number.isFinite(horas) || !Number.isFinite(minutos)) return hora;
  return `${horas % 12 || 12}:${String(minutos).padStart(2, '0')} ${horas < 12 ? 'a. m.' : 'p. m.'}`;
}

function obtenerDistintivo(acuerdo: AcuerdoServicio) {
  if (acuerdo.estado === 'completed') {
    return { texto: 'Completado', clases: 'bg-green-50 text-green-700' };
  }
  if (acuerdo.estado === 'cancelled') {
    return { texto: 'Cancelado', clases: 'bg-red-50 text-[#D32F2F]' };
  }
  if (acuerdo.estado === 'expired') {
    return { texto: 'Expirado', clases: 'bg-[#F0F0F0] text-[#737373]' };
  }
  if (acuerdo.estado === 'pending' || acuerdo.estadoHorario === 'pending') {
    return { texto: 'Por definir', clases: 'bg-[#FFF9C4] text-[#9A6400]' };
  }
  if (acuerdo.propuestaCambio?.estado === 'pendiente') {
    return { texto: 'Cambio pendiente', clases: 'bg-[#FFF9C4] text-[#9A6400]' };
  }
  if (acuerdo.confirmaciones?.habilitada) {
    return { texto: 'Por confirmar', clases: 'bg-[#FFF9C4] text-[#9A6400]' };
  }
  return { texto: 'Próximo', clases: 'bg-[#E8F5F6] text-[#3C9DA0]' };
}

// ──────────────────── 01. TARJETA DEL ACUERDO ────────────────────
export default function AcuerdoCard({
  acuerdo,
  miembroActualId,
  onVerAcuerdo,
  onIrChat,
}: AcuerdoCardProps) {
  const participantesIds = [
    acuerdo.proveedorId,
    acuerdo.solicitanteId,
    ...(acuerdo.otrosParticipantesIds ?? []),
  ];
  const otrosIds = [...new Set(participantesIds)].filter(
    (id) => id !== miembroActualId,
  );
  const otroId = otrosIds[0];
  const otro = otroId ? MIEMBROS_DEMO[otroId] : undefined;
  const nombre = otro?.name ?? 'Otro miembro';
  const iniciales = nombre.trim().split(/\s+/).slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase()).join('');
  const grupo = participantesIds.filter((id, i, todos) => todos.indexOf(id) === i).length > 2;
  const distintivo = obtenerDistintivo(acuerdo);
  const sinHorario = acuerdo.estadoHorario === 'pending';
  const hayCambioPendiente = acuerdo.propuestaCambio?.estado === 'pendiente';
  const activo = acuerdo.estado === 'pending' || acuerdo.estado === 'accepted';

  return (
    <article
      data-section="tarjeta-acuerdo"
      className="min-w-0 rounded-2xl border border-[#E8E8E8] bg-white p-4 transition-colors hover:border-[#3C9DA0]"
    >
      {/* 01.1 ENCABEZADO: participante, servicio y estado */}
      <button
        type="button"
        onClick={() => onVerAcuerdo?.(acuerdo.id)}
        disabled={!onVerAcuerdo}
        className="flex w-full min-w-0 items-start gap-3 text-left disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]"
        aria-label={`Ver detalle del acuerdo: ${acuerdo.servicio}`}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: otro?.avatarColor ?? '#3C9DA0' }}
        >
          {otro?.avatar
            ? <img src={otro.avatar} alt="" className="h-full w-full object-cover" />
            : iniciales}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-start justify-between gap-2">
            <span className="text-sm font-semibold text-[#0D0D0D]">
              {grupo ? `${participantesIds.filter((id, i, todos) => todos.indexOf(id) === i).length} participantes` : nombre}
            </span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${distintivo.clases}`}>
              {distintivo.texto}
            </span>
          </span>
          <span className="mt-1 block text-sm text-[#737373]">{acuerdo.servicio}</span>
          <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#9E9E9E]">
            <span className="inline-flex items-center gap-1">
              <CalendarClock size={13} aria-hidden="true" />
              {sinHorario || !acuerdo.fechaProgramada
                ? 'Horario por definir'
                : `${mostrarFecha(acuerdo.fechaProgramada)} · ${mostrarHora(acuerdo.horaInicio)} – ${mostrarHora(acuerdo.horaFin)}`}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={13} aria-hidden="true" />
              {acuerdo.creditosHoras} {acuerdo.creditosHoras === 1 ? 'hora' : 'horas'}
            </span>
          </span>
        </span>
      </button>

      {/* 01.2 AVISOS SEGÚN EL ESTADO (SOLO INFORMATIVOS) */}
      {acuerdo.estado === 'pending' && (
        <div className="mt-3 rounded-xl bg-[#FFF9C4] px-3 py-2.5 text-xs leading-relaxed text-[#795C00]">
          El acuerdo aún no se ha definido ni aceptado. Los participantes deben establecer las condiciones del servicio.
        </div>
      )}
      {acuerdo.estado === 'accepted' && hayCambioPendiente && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#FFF9C4] px-3 py-2.5 text-xs leading-relaxed text-[#795C00]">
          <Pencil size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>Existe una modificación pendiente. El acuerdo previamente aceptado continúa vigente.</span>
        </div>
      )}
      {acuerdo.estado === 'accepted' && acuerdo.confirmaciones?.habilitada && !hayCambioPendiente && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#E8F5F6] px-3 py-2.5 text-xs text-[#2D7B7E]">
          <CheckCircle2 size={14} className="shrink-0" aria-hidden="true" />
          <span>Pendiente de confirmar que el servicio se realizó.</span>
        </div>
      )}
      {acuerdo.estado === 'completed' && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-xs text-green-700">
          <CheckCircle2 size={14} className="shrink-0" aria-hidden="true" />
          Intercambio concluido · {acuerdo.creditosHoras} {acuerdo.creditosHoras === 1 ? 'crédito de tiempo' : 'créditos de tiempo'}
        </div>
      )}

      {/* 01.3 ACCIONES: delegadas a la ventana principal */}
      {activo && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => acuerdo.chatId && onIrChat?.(acuerdo.chatId)}
            disabled={!acuerdo.chatId || !onIrChat}
            className="inline-flex min-w-[120px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#F6F6F6] px-3 py-2.5 text-sm font-medium text-[#0D0D0D] transition-colors hover:bg-[#E8E8E8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageCircle size={15} aria-hidden="true" />
            Ir al chat
          </button>
          <button
            type="button"
            onClick={() => onVerAcuerdo?.(acuerdo.id)}
            disabled={!onVerAcuerdo}
            className="min-w-[120px] flex-1 rounded-xl bg-[#3C9DA0] px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2D8B8E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ver detalles
          </button>
        </div>
      )}
      {acuerdo.estado === 'completed' && (
        <button
          type="button"
          onClick={() => onVerAcuerdo?.(acuerdo.id)}
          disabled={!onVerAcuerdo}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#3C9DA0] hover:underline disabled:cursor-default"
        >
          <UsersRound size={14} aria-hidden="true" />
          Ver intercambio realizado
        </button>
      )}
    </article>
  );
}
