import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Pencil,
  UsersRound,
} from 'lucide-react';
import {
  EstadoAcuerdoAPI,
  type AcuerdoAPI,
} from '../../api/acuerdos.api';

/**
 * Componente EXISTENTE reutilizado con el contrato real AcuerdoEntity.
 * Presenta información recibida; no realiza consultas ni operaciones de negocio.
 */
export interface AcuerdoCardProps {
  acuerdo: AcuerdoAPI;
  miembroActualId: string;
  onVerAcuerdo?: (acuerdoId: string) => void;
  onIrChat?: (chatId: string) => void;
}

function fechaLegible(fecha?: string | null): string {
  if (!fecha) return 'Por definir';
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return 'Por definir';
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(valor);
}

function horaLegible(fecha?: string | null): string {
  if (!fecha) return '';
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return '';
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(valor);
}

function distintivo(estado: EstadoAcuerdoAPI): { texto: string; clase: string } {
  switch (estado) {
    case EstadoAcuerdoAPI.EN_CREACION:
      return { texto: 'Por definir', clase: 'bg-[#FFF9C4] text-[#9A6400]' };
    case EstadoAcuerdoAPI.ACORDADO:
      return { texto: 'Acordado', clase: 'bg-[#E8F5F6] text-[#3C9DA0]' };
    case EstadoAcuerdoAPI.REALIZADO:
      return { texto: 'Completado', clase: 'bg-green-50 text-green-700' };
    case EstadoAcuerdoAPI.EN_MODIFICACION:
      return { texto: 'Propuesta pendiente', clase: 'bg-[#FFF9C4] text-[#9A6400]' };
    case EstadoAcuerdoAPI.CANCELADO:
      return { texto: 'Cancelado', clase: 'bg-red-50 text-[#D32F2F]' };
    default:
      return { texto: 'Estado no reconocido', clase: 'bg-[#F0F0F0] text-[#737373]' };
  }
}

export default function AcuerdoCard({
  acuerdo,
  miembroActualId,
  onVerAcuerdo,
  onIrChat,
}: AcuerdoCardProps) {
  const participantes = acuerdo.participantes ?? [];
  const otros = participantes.filter((p) => p.idPerfil !== miembroActualId);
  const nombreOtraPersona = otros[0]?.perfil?.nombre ?? 'Otro miembro';
  const fotoOtraPersona = otros[0]?.perfil?.imagen;
  const nombre = participantes.length > 2
    ? `${participantes.length} participantes`
    : nombreOtraPersona;
  const iniciales = nombreOtraPersona.trim().split(/\s+/).slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '').join('');
  const titulo = acuerdo.postAyuda?.titulo ?? acuerdo.solicitud?.titulo ?? 'Acuerdo de servicio';
  const horario = acuerdo.horarioAcordado;
  const estado = distintivo(acuerdo.estado);
  const estadosActivos: readonly EstadoAcuerdoAPI[] = [
    EstadoAcuerdoAPI.EN_CREACION,
    EstadoAcuerdoAPI.ACORDADO,
    EstadoAcuerdoAPI.EN_MODIFICACION,
  ];
  const activo = estadosActivos.includes(acuerdo.estado);

  return (
    <article
      data-section="tarjeta-acuerdo"
      className="min-w-0 rounded-2xl border border-[#E8E8E8] bg-white p-4 transition-colors hover:border-[#3C9DA0]"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#3C9DA0] text-sm font-bold text-white"
          aria-hidden="true"
        >
          {fotoOtraPersona
            ? <img src={fotoOtraPersona} alt="" className="h-full w-full object-cover" />
            : iniciales}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <span className="text-sm font-semibold text-[#0D0D0D]">{nombre}</span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${estado.clase}`}>
              {estado.texto}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#737373]">{titulo}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#9E9E9E]">
            <span className="inline-flex items-center gap-1">
              <CalendarClock size={13} aria-hidden="true" />
              {horario
                ? `${fechaLegible(horario.fechaInicio)} · ${horaLegible(horario.fechaInicio)} – ${horaLegible(horario.fechaFin)}`
                : 'Horario por definir'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={13} aria-hidden="true" />
              {acuerdo.horas} {acuerdo.horas === 1 ? 'hora' : 'horas'}
            </span>
          </div>
        </div>
      </div>

      {acuerdo.estado === EstadoAcuerdoAPI.EN_CREACION && (
        <p className="mt-3 rounded-xl bg-[#FFF9C4] px-3 py-2.5 text-xs text-[#795C00]">
          Los participantes todavía deben definir y aceptar las condiciones del acuerdo.
        </p>
      )}
      {acuerdo.estado === EstadoAcuerdoAPI.EN_MODIFICACION && (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-[#FFF9C4] px-3 py-2.5 text-xs text-[#795C00]">
          <Pencil size={14} className="shrink-0" aria-hidden="true" />
          Hay una propuesta pendiente. Las condiciones anteriores siguen vigentes.
        </p>
      )}
      {acuerdo.estado === EstadoAcuerdoAPI.REALIZADO && (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-xs text-green-700">
          <CheckCircle2 size={14} className="shrink-0" aria-hidden="true" />
          Intercambio completado
        </p>
      )}

      {(onVerAcuerdo || (activo && acuerdo.chat?.id && onIrChat)) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activo && acuerdo.chat?.id && onIrChat && (
            <button
              type="button"
              onClick={() => onIrChat(acuerdo.chat!.id)}
              className="inline-flex min-w-[120px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#F6F6F6] px-3 py-2.5 text-sm font-medium text-[#0D0D0D] hover:bg-[#E8E8E8]"
            >
              <MessageCircle size={15} aria-hidden="true" />
              Ir al chat
            </button>
          )}
          {onVerAcuerdo && (
            <button
              type="button"
              onClick={() => onVerAcuerdo(acuerdo.id)}
              className="inline-flex min-w-[120px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#3C9DA0] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2D8B8E]"
            >
              <UsersRound size={15} aria-hidden="true" />
              Ver detalles
            </button>
          )}
        </div>
      )}
    </article>
  );
}
