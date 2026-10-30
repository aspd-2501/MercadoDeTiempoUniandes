import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Edit3,
  Heart,
  MessageCircle,
  TriangleAlert,
} from 'lucide-react';

import { useMiembroSesion } from '../../contextos/MiembroSesionContext';
import { MIEMBROS_DEMO } from '../../mocks/miembros.mocks';
import { ACUERDOS_DEMO } from '../../mocks/acuerdos.mocks';
import {
  DisponibilidadCompartida,
} from '../../componentes/calendario/CalendarioDisponibilidad';
import EditorFranjasDisponibilidad, {
  crearPrimeraFranja,
  cumpleDuracionMinima,
} from '../../componentes/calendario/EditorFranjasDisponibilidad';
import type { AcuerdoServicio, DatosPropuestaCambio } from '../../tipos/acuerdo';
import type { IntervaloDisponibilidad } from '../../tipos/disponibilidad';

/**
 * VISTA: detalle de un acuerdo de servicio del Banco de Tiempo.
 *
 * - La URL /acuerdos/:acuerdoId identifica el acuerdo.
 * - Los datos de lectura vienen de la API (aquí, un mock compartido).
 * - La vista NO calcula coincidencias, asigna horarios ni transfiere créditos.
 * - Los formularios solo preparan datos. Las operaciones se delegan por callbacks.
 * - Horas de servicio y créditos: enteros positivos. Horario visual 05:00–22:00.
 *
 * Ubicación: src/ventanas/acuerdos/AcuerdoDetail.tsx
 */

// ──────────────────── 00. PROPIEDADES DE LA VENTANA ────────────────────
export interface AcuerdoDetailProps {
  acuerdos?: Record<string, AcuerdoServicio>;
  onVolver?: () => void;
  onVerPost?: (postId: string) => void;
  onIrChat?: (chatId: string) => void;
  onGuardarDisponibilidad?: (
    acuerdoId: string,
    franjas: IntervaloDisponibilidad[],
  ) => void | Promise<void>;
  onProponerCambio?: (
    acuerdoId: string,
    propuesta: DatosPropuestaCambio,
  ) => void | Promise<void>;
  onResponderPropuesta?: (
    acuerdoId: string,
    propuestaId: string,
    decision: 'aceptada' | 'rechazada',
  ) => void | Promise<void>;
  onConfirmarServicio?: (acuerdoId: string) => void | Promise<void>;
  onCancelarAcuerdo?: (acuerdoId: string) => void | Promise<void>;
  onReportarProblema?: (acuerdoId: string) => void | Promise<void>;
  onCompartirExperiencia?: (acuerdoId: string) => void;
}

const ESTADOS = {
  pending: { texto: 'Pendiente', clases: 'bg-[#FFF9C4] text-[#5A5A00]' },
  accepted: { texto: 'Aceptado', clases: 'bg-[#E8F5F6] text-[#3C9DA0]' },
  completed: { texto: 'Completado', clases: 'bg-green-50 text-green-700' },
  cancelled: { texto: 'Cancelado', clases: 'bg-red-50 text-[#D32F2F]' },
  expired: { texto: 'Expirado', clases: 'bg-[#F0F0F0] text-[#737373]' },
} as const;

const ESTILO_CAMPO =
  'w-full min-w-0 rounded-xl border border-[#E8E8E8] bg-white px-4 py-3 text-sm text-[#0D0D0D] outline-none focus:border-[#3C9DA0] focus-visible:ring-2 focus-visible:ring-[#3C9DA0]/20';
const ESTILO_ACCION =
  'rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] disabled:cursor-not-allowed disabled:opacity-50';

function fechaLocal(fechaISO: string): Date {
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  return new Date(anio, mes - 1, dia, 12);
}
function mostrarFecha(fechaISO?: string): string {
  return fechaISO
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(fechaLocal(fechaISO))
    : 'Por definir';
}
function mostrarHora(hora?: string): string {
  if (!hora) return 'Por definir';
  const [horas, minutos] = hora.split(':').map(Number);
  if (!Number.isFinite(horas) || !Number.isFinite(minutos)) return hora;
  return `${horas % 12 || 12}:${String(minutos).padStart(2, '0')} ${horas < 12 ? 'a. m.' : 'p. m.'}`;
}
function minutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}
function nombreMiembro(id: string): string {
  return MIEMBROS_DEMO[id]?.name ?? 'Miembro de la comunidad';
}

// ──────────────────── 01. PIEZAS VISUALES LOCALES ────────────────────
function AvatarMiembro({ id }: { id: string }) {
  const persona = MIEMBROS_DEMO[id];
  const nombre = nombreMiembro(id);
  const iniciales = nombre.split(' ').slice(0, 2).map((parte) => parte[0]).join('');
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: persona?.avatarColor ?? '#3C9DA0' }}
      aria-label={nombre}
    >
      {persona?.avatar
        ? <img src={persona.avatar} alt="" className="h-full w-full object-cover" />
        : iniciales}
    </div>
  );
}

function Panel({
  titulo,
  children,
}: {
  titulo?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#E8E8E8] bg-white p-4">
      {titulo && <h2 className="mb-3 text-sm font-bold text-[#0D0D0D]">{titulo}</h2>}
      {children}
    </section>
  );
}

function Dato({ titulo, valor, destacar = false }: {
  titulo: string;
  valor: string;
  destacar?: boolean;
}) {
  return (
    <div className={`min-w-0 rounded-xl p-3 ${destacar ? 'bg-[#FFFDE0]' : 'bg-[#F6F6F6]'}`}>
      <p className="text-xs text-[#737373]">{titulo}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#0D0D0D]">{valor}</p>
    </div>
  );
}

// ──────────────────── 02. EDICIÓN DE PROPUESTA (SOLO FORMULARIO) ────────────────────
function FormularioPropuesta({
  acuerdo,
  onCancelar,
  onEnviar,
  enviando,
  aviso,
}: {
  acuerdo: AcuerdoServicio;
  onCancelar: () => void;
  onEnviar?: (datos: DatosPropuestaCambio) => void;
  enviando: boolean;
  aviso?: string;
}) {
  const [fecha, setFecha] = useState(acuerdo.fechaProgramada ?? '');
  const [horaInicio, setHoraInicio] = useState(acuerdo.horaInicio ?? '');
  const [horaFin, setHoraFin] = useState(acuerdo.horaFin ?? '');
  const [duracion, setDuracion] = useState(String(acuerdo.duracionHoras));
  const [motivo, setMotivo] = useState('');
  const horas = Number(duracion);
  const duracionValida = Number.isSafeInteger(horas) && horas > 0;
  const intervaloValido =
    fecha.length > 0 &&
    /^\d{2}:\d{2}$/.test(horaInicio) &&
    /^\d{2}:\d{2}$/.test(horaFin) &&
    horaInicio >= '05:00' &&
    horaFin <= '22:00' &&
    horaFin > horaInicio &&
    duracionValida &&
    minutos(horaFin) - minutos(horaInicio) >= horas * 60;

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-5" data-section="editar-acuerdo">
      <div className="rounded-xl border border-[#FFF176] bg-[#FFFDE0] p-4 text-sm leading-relaxed text-[#5A5A00]">
        Los cambios que propongas requieren aprobación. El acuerdo actual sigue vigente hasta que el backend confirme una modificación.
      </div>
      {aviso && <div className="rounded-xl bg-[#FFFDE0] p-3 text-sm text-[#5A5A00]" role="status">{aviso}</div>}
      <Panel titulo="Horario actual">
        <div className="grid grid-cols-2 gap-2">
          <Dato titulo="Fecha" valor={mostrarFecha(acuerdo.fechaProgramada)} />
          <Dato titulo="Hora" valor={`${mostrarHora(acuerdo.horaInicio)} – ${mostrarHora(acuerdo.horaFin)}`} />
        </div>
      </Panel>
      <Panel titulo="Proponer nuevo horario">
        <div className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#737373]">Fecha propuesta</span>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={ESTILO_CAMPO} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block min-w-0 space-y-1.5">
              <span className="text-xs font-semibold text-[#737373]">Desde</span>
              <input type="time" min="05:00" max="22:00" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className={ESTILO_CAMPO} />
            </label>
            <label className="block min-w-0 space-y-1.5">
              <span className="text-xs font-semibold text-[#737373]">Hasta</span>
              <input type="time" min="05:00" max="22:00" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className={ESTILO_CAMPO} />
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#737373]">Duración (horas enteras)</span>
            <input
              type="number"
              min="1"
              step="1"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              className={ESTILO_CAMPO}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#737373]">Motivo del cambio (opcional)</span>
            <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} className={`${ESTILO_CAMPO} resize-none`} />
          </label>
          {!intervaloValido && (
            <p className="text-xs text-[#737373]">
              Elige una fecha y una franja entre 5:00 a. m. y 10:00 p. m. que cubra la duración entera indicada.
            </p>
          )}
        </div>
      </Panel>
      <div className="flex gap-3">
        <button type="button" onClick={onCancelar} className={`${ESTILO_ACCION} flex-1 border border-[#E8E8E8] bg-white text-[#0D0D0D]`}>
          Cancelar
        </button>
        <button
          type="button"
          disabled={!onEnviar || !intervaloValido || enviando}
          onClick={() => onEnviar?.({ fecha, horaInicio, horaFin, duracionHoras: horas, motivo })}
          className={`${ESTILO_ACCION} flex-1 bg-[#3C9DA0] text-white hover:bg-[#2D8B8E]`}
        >
          {enviando ? 'Enviando…' : 'Proponer cambios'}
        </button>
      </div>
      {!onEnviar && <p className="text-xs text-[#737373]">El envío se habilitará al conectar la API.</p>}
    </div>
  );
}

// ──────────────────── 03. EDICIÓN DE DISPONIBILIDAD ────────────────────
function MiDisponibilidad({
  acuerdo,
  miId,
  onGuardar,
}: {
  acuerdo: AcuerdoServicio;
  miId: string;
  onGuardar?: (franjas: IntervaloDisponibilidad[]) => void | Promise<void>;
}) {
  const registro = acuerdo.disponibilidadParticipantes?.find((item) => item.userId === miId);
  const [franjas, setFranjas] = useState<IntervaloDisponibilidad[]>(
    () => registro?.intervals.length ? registro.intervals : [crearPrimeraFranja()],
  );
  const [idPreferido, setIdPreferido] = useState(franjas[0]?.id ?? '');
  const [procesando, setProcesando] = useState(false);
  const [aviso, setAviso] = useState('');
  const franjasValidas =
    franjas.length > 0 &&
    franjas.every((franja) => cumpleDuracionMinima(franja, acuerdo.duracionHoras));

  async function enviar() {
    if (!onGuardar || !franjasValidas) return;
    setProcesando(true);
    setAviso('');
    try {
      await onGuardar(franjas);
      setAviso('Disponibilidad enviada. Los datos se actualizarán al consultar nuevamente el acuerdo.');
    } catch {
      setAviso('No se pudo enviar la disponibilidad. Inténtalo de nuevo.');
    } finally {
      setProcesando(false);
    }
  }

  return (
    <Panel titulo="Mi disponibilidad">
      <p className="mb-3 text-xs text-[#737373]">
        Puedes agregar, editar y eliminar tus franjas antes de enviarlas.
        {registro?.submitted ? ' Ya enviaste una disponibilidad anteriormente.' : ''}
      </p>
      <EditorFranjasDisponibilidad
        franjas={franjas}
        onCambiar={(nuevas) => { setFranjas(nuevas); setAviso(''); }}
        franjaPreferidaId={idPreferido}
        onCambiarPreferida={setIdPreferido}
        mostrarPreferida={false}
        horasEstimadas={acuerdo.duracionHoras}
      />
      <button
        type="button"
        onClick={enviar}
        disabled={!onGuardar || !franjasValidas || procesando}
        className={`${ESTILO_ACCION} mt-4 w-full bg-[#3C9DA0] text-white hover:bg-[#2D8B8E]`}
      >
        {procesando ? 'Enviando…' : registro?.submitted ? 'Actualizar disponibilidad' : 'Enviar disponibilidad'}
      </button>
      {!onGuardar && <p className="mt-2 text-xs text-[#737373]">El envío se habilitará al conectar la API.</p>}
      {aviso && <p className="mt-2 text-xs text-[#737373]" role="status">{aviso}</p>}
    </Panel>
  );
}

// ──────────────────── 04. VENTANA PRINCIPAL ────────────────────
export default function AcuerdoDetail({
  acuerdos = ACUERDOS_DEMO,
  onVolver,
  onVerPost,
  onIrChat,
  onGuardarDisponibilidad,
  onProponerCambio,
  onResponderPropuesta,
  onConfirmarServicio,
  onCancelarAcuerdo,
  onReportarProblema,
  onCompartirExperiencia,
}: AcuerdoDetailProps) {
  const { acuerdoId } = useParams<{ acuerdoId: string }>();
  const { miembro } = useMiembroSesion();
  const miId = miembro?.id ?? '';
  const acuerdo = acuerdoId ? acuerdos[acuerdoId] : undefined;
  const [modoEdicion, setModoEdicion] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    setModoEdicion(false);
    setAviso('');
  }, [acuerdoId]);

  async function ejecutar(accion: () => void | Promise<void>, mensaje: string): Promise<boolean> {
    setProcesando(true);
    setAviso('');
    try {
      await accion();
      setAviso(mensaje);
      return true;
    } catch {
      setAviso('No se pudo completar la operación. Inténtalo nuevamente.');
      return false;
    } finally {
      setProcesando(false);
    }
  }

  if (!acuerdo) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F6F6F6] px-4">
        <p className="text-sm text-[#737373]">Acuerdo no encontrado.</p>
        <button type="button" onClick={onVolver} disabled={!onVolver} className="text-sm font-semibold text-[#3C9DA0]">Volver</button>
      </main>
    );
  }

  // 04.1 Datos de presentación; las reglas de autorización corresponden a la API.
  const estado = ESTADOS[acuerdo.estado];
  const idsParticipantes = Array.from(new Set([
    acuerdo.proveedorId,
    acuerdo.solicitanteId,
    ...(acuerdo.otrosParticipantesIds ?? []),
  ]));
  const nombres = Object.fromEntries(idsParticipantes.map((id) => [id, nombreMiembro(id)]));
  const esProveedor = acuerdo.proveedorId === miId;
  const esSolicitante = acuerdo.solicitanteId === miId;
  const puedeConfirmarMiembro = esProveedor || esSolicitante;
  const confirmacionPropia = esProveedor
    ? acuerdo.confirmaciones?.proveedorConfirmo
    : acuerdo.confirmaciones?.solicitanteConfirmo;
  const confirmacionOtra = esProveedor
    ? acuerdo.confirmaciones?.solicitanteConfirmo
    : acuerdo.confirmaciones?.proveedorConfirmo;
  const nombreOtraPersona = nombreMiembro(esProveedor ? acuerdo.solicitanteId : acuerdo.proveedorId);
  const sePuedeEditar = acuerdo.estado === 'accepted' || acuerdo.estado === 'pending';
  const propuesta = acuerdo.propuestaCambio;
  const propuestaAjena = propuesta?.autorId !== miId;

  const tituloVista = modoEdicion ? 'Editar acuerdo' : 'Detalle del acuerdo';

  return (
    <div className="min-h-screen min-w-0 bg-[#F6F6F6]" data-section="detalle-acuerdo">
      {/* 05. ENCABEZADO GENERAL */}
      <header className="sticky top-0 z-30 border-b border-[#E8E8E8] bg-white px-4 pb-4 pt-5">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            type="button"
            aria-label={modoEdicion ? 'Cerrar edición' : 'Volver'}
            onClick={() => modoEdicion ? setModoEdicion(false) : onVolver?.()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F6F6F6] text-[#0D0D0D] hover:bg-[#E8E8E8]"
          >
            <ArrowLeft size={19} aria-hidden="true" />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-[#0D0D0D]">{tituloVista}</h1>
          {!modoEdicion && (
            <span className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-semibold ${estado.clases}`}>
              {acuerdo.estadoHorario === 'pending' ? 'Horario pendiente' : estado.texto}
            </span>
          )}
        </div>
      </header>

      {modoEdicion ? (
        <FormularioPropuesta
          key={acuerdo.id}
          acuerdo={acuerdo}
          enviando={procesando}
          aviso={aviso}
          onCancelar={() => setModoEdicion(false)}
          onEnviar={onProponerCambio ? (datos) => {
            void ejecutar(
              () => onProponerCambio(acuerdo.id, datos),
              'Propuesta enviada. El acuerdo actual sigue vigente mientras se revisa.',
            ).then((exitoso) => { if (exitoso) setModoEdicion(false); });
          } : undefined}
        />
      ) : (
        <main className="mx-auto max-w-2xl space-y-4 px-4 py-4">
          {/* 06. MENSAJES DE ESTADO Y RETROALIMENTACIÓN */}
          {aviso && <div className="rounded-xl border border-[#B2DFE0] bg-[#E8F5F6] p-3 text-sm text-[#2D7B7E]" role="status">{aviso}</div>}

          {/* 06.1 MODIFICACIÓN PENDIENTE: se muestra completa, sin desplegables. */}
          {propuesta && propuesta.estado === 'pendiente' && (
            <section
              data-section="aviso-modificacion-pendiente"
              aria-label="Modificación del acuerdo pendiente"
              className="rounded-xl border border-[#E8CA50] bg-[#FFF7B2] p-3 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFE46B] text-[#705900]">
                  <Clock3 size={17} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#0D0D0D]">
                    {propuestaAjena ? 'Modificación pendiente de tu respuesta' : 'Tu modificación está pendiente'}
                  </h2>
                  <p className="text-xs text-[#665600]">
                    {propuestaAjena
                      ? `${nombreMiembro(propuesta.autorId)} propuso cambiar las condiciones.`
                      : 'Esperando la respuesta de los demás participantes.'}
                  </p>
                </div>
              </div>

              {/* Comparación visible de inmediato; no sustituye el acuerdo vigente. */}
              <div className="space-y-1.5 rounded-lg bg-white/55 px-3 py-2.5 text-xs sm:text-sm">
                <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-2">
                  <span className="text-[#655D44]">Actual</span>
                  <span className="text-[#0D0D0D]">
                    {mostrarFecha(acuerdo.fechaProgramada)} · {mostrarHora(acuerdo.horaInicio)} – {mostrarHora(acuerdo.horaFin)} ({acuerdo.duracionHoras} h)
                  </span>
                </div>
                <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-2">
                  <span className="font-bold text-[#705900]">Propuesto</span>
                  <span className="font-semibold text-[#0D0D0D]">
                    {mostrarFecha(propuesta.fecha)} · {mostrarHora(propuesta.horaInicio)} – {mostrarHora(propuesta.horaFin)} ({propuesta.duracionHoras} h)
                  </span>
                </div>
              </div>

              {propuesta.motivo && (
                <p className="mt-2 text-xs leading-relaxed text-[#665600]">
                  <span className="font-semibold">Motivo:</span> {propuesta.motivo}
                </p>
              )}

              <p className="mt-2 text-[11px] leading-snug text-[#705900]">
                El acuerdo actual sigue vigente hasta que se apruebe la propuesta.
              </p>

              {propuestaAjena && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={!onResponderPropuesta || procesando}
                    onClick={() => onResponderPropuesta && void ejecutar(
                      () => onResponderPropuesta(acuerdo.id, propuesta.id, 'rechazada'),
                      'Respuesta enviada. Espera a que se actualice el estado del acuerdo.',
                    )}
                    className={`${ESTILO_ACCION} flex-1 border border-[#D8B946] bg-white py-2.5 text-[#D32F2F]`}
                  >
                    Rechazar cambio
                  </button>
                  <button
                    type="button"
                    disabled={!onResponderPropuesta || procesando}
                    onClick={() => onResponderPropuesta && void ejecutar(
                      () => onResponderPropuesta(acuerdo.id, propuesta.id, 'aceptada'),
                      'Respuesta enviada. Espera a que se actualice el estado del acuerdo.',
                    )}
                    className={`${ESTILO_ACCION} flex-1 bg-[#3C9DA0] py-2.5 text-white`}
                  >
                    Aceptar cambio
                  </button>
                </div>
              )}
              {!onResponderPropuesta && propuestaAjena && (
                <p className="mt-1 text-xs text-[#665600]">Las decisiones se habilitarán al conectar la API.</p>
              )}
            </section>
          )}
          {acuerdo.estado === 'completed' && (
            <div className="rounded-2xl bg-[#FFFF00] p-4 text-center">
              <p className="text-lg font-bold text-[#0D0D0D]">¡Intercambio completado!</p>
              <p className="mt-1 text-sm text-[#5A5A00]">
                {acuerdo.creditosHoras} hora{acuerdo.creditosHoras !== 1 ? 's' : ''} de crédito registradas según el estado del acuerdo.
              </p>
            </div>
          )}
          {(acuerdo.estado === 'cancelled' || acuerdo.estado === 'expired') && (
            <div className="rounded-xl bg-[#FFF9C4] p-3 text-sm text-[#5A5A00]">
              Este acuerdo está {acuerdo.estado === 'cancelled' ? 'cancelado' : 'expirado'} y no admite nuevas acciones.
            </div>
          )}

          {/* 07. TARJETA PRINCIPAL */}
          <Panel>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#737373]">Servicio</p>
                <h2 className="text-lg font-bold text-[#0D0D0D]">{acuerdo.servicio}</h2>
              </div>
              {sePuedeEditar && acuerdo.estadoHorario === 'scheduled' && (
                <button
                  type="button"
                  onClick={() => setModoEdicion(true)}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-[#E8E8E8] px-2.5 py-2 text-xs font-medium text-[#3C9DA0] hover:bg-[#E8F5F6]"
                >
                  <Edit3 size={14} aria-hidden="true" /> Proponer cambio
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Dato titulo="Fecha" valor={mostrarFecha(acuerdo.fechaProgramada)} />
              <Dato titulo="Hora" valor={acuerdo.horaInicio && acuerdo.horaFin
                ? `${mostrarHora(acuerdo.horaInicio)} – ${mostrarHora(acuerdo.horaFin)}`
                : 'Por definir'} />
              <Dato titulo="Duración" valor={`${acuerdo.duracionHoras} h`} />
              <Dato titulo="Créditos" valor={`${acuerdo.creditosHoras} hora${acuerdo.creditosHoras === 1 ? '' : 's'}`} destacar />
            </div>
            {acuerdo.notas && (
              <div className="mt-3 rounded-xl bg-[#F6F6F6] p-3">
                <p className="text-xs text-[#737373]">Notas</p>
                <p className="mt-1 text-sm text-[#0D0D0D]">{acuerdo.notas}</p>
              </div>
            )}
          </Panel>

          {/* 08. REFERENCIA A LA PUBLICACIÓN ORIGINAL */}
          {acuerdo.postId && (
            <button
              type="button"
              onClick={() => onVerPost?.(acuerdo.postId!)}
              disabled={!onVerPost}
              className="flex w-full items-center gap-3 rounded-2xl border border-[#E8E8E8] bg-white p-4 text-left transition-colors hover:bg-[#E8F5F6] disabled:cursor-not-allowed"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F5F6] text-[#3C9DA0]"><TriangleAlert size={18} aria-hidden="true" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#9E9E9E]">Originado desde</p>
                <p className="text-sm font-semibold text-[#3C9DA0]">Ver publicación de ayuda</p>
              </div>
              <ChevronRight size={18} className="text-[#9E9E9E]" aria-hidden="true" />
            </button>
          )}

          {/* 09. PARTICIPANTES */}
          <Panel titulo="Participantes">
            <div className="space-y-3">
              {idsParticipantes.map((id) => (
                <div key={id} className="flex items-center gap-3">
                  <AvatarMiembro id={id} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#0D0D0D]">{nombreMiembro(id)}{id === miId ? ' (tú)' : ''}</p>
                    <p className="text-xs text-[#9E9E9E]">
                      {id === acuerdo.proveedorId ? 'Proveedor del servicio' : id === acuerdo.solicitanteId ? 'Solicitante' : 'Participante'}
                    </p>
                  </div>
                  <CheckCircle2 size={17} className="text-[#3C9DA0]" aria-hidden="true" />
                </div>
              ))}
            </div>
          </Panel>

          {/* 10. ACUERDO CON HORARIO PENDIENTE */}
          {acuerdo.estadoHorario === 'pending' && (acuerdo.estado === 'pending' || acuerdo.estado === 'accepted') && (
            <>
              <Panel titulo="Definir horario">
                <p className="mb-3 text-sm leading-relaxed text-[#737373]">
                  Cada participante propone sus franjas. La API determinará si hay un horario compatible para la duración del acuerdo.
                </p>
                {acuerdo.horarioPreferidoOrigen && (
                  <div className="mb-4 rounded-xl border border-[#FFF176] bg-[#FFFDE0] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#5A5A00]">Horario preferido del post</p>
                    <p className="mt-1 text-sm font-semibold text-[#0D0D0D]">
                      {mostrarFecha(acuerdo.horarioPreferidoOrigen.date)} ·{' '}
                      {mostrarHora(acuerdo.horarioPreferidoOrigen.startTime)} – {mostrarHora(acuerdo.horarioPreferidoOrigen.endTime)}
                    </p>
                    <p className="mt-1 text-xs text-[#737373]">Es una preferencia, no un horario confirmado.</p>
                  </div>
                )}
                <DisponibilidadCompartida
                  participantes={acuerdo.disponibilidadParticipantes ?? []}
                  nombres={nombres}
                  duracion={acuerdo.duracionHoras}
                  resultado={acuerdo.resultadoDisponibilidad ?? { estado: 'pendiente' }}
                  alturaLimitada
                />
              </Panel>
              <MiDisponibilidad
                key={acuerdo.id}
                acuerdo={acuerdo}
                miId={miId}
                onGuardar={onGuardarDisponibilidad
                  ? (franjas) => onGuardarDisponibilidad(acuerdo.id, franjas)
                  : undefined}
              />
            </>
          )}

          {/* 12. ACCIONES PRINCIPALES */}
          {acuerdo.estado !== 'cancelled' && acuerdo.estado !== 'expired' && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!onIrChat || !acuerdo.chatId}
                onClick={() => acuerdo.chatId && onIrChat?.(acuerdo.chatId)}
                className={`${ESTILO_ACCION} flex min-w-[140px] flex-1 items-center justify-center gap-2 bg-[#3C9DA0] text-white`}
              >
                <MessageCircle size={17} aria-hidden="true" /> Ir al chat
              </button>
              {sePuedeEditar && (
                <button
                  type="button"
                  disabled={!onCancelarAcuerdo || procesando}
                  onClick={() => onCancelarAcuerdo && window.confirm('¿Quieres solicitar la cancelación de este acuerdo?') && void ejecutar(
                    () => onCancelarAcuerdo(acuerdo.id),
                    'Solicitud de cancelación enviada. Espera la actualización del acuerdo.',
                  )}
                  className={`${ESTILO_ACCION} min-w-[140px] flex-1 border border-[#E8E8E8] bg-white text-[#D32F2F]`}
                >
                  Cancelar acuerdo
                </button>
              )}
            </div>
          )}

          {/* 13. CONFIRMACIÓN: LA API DECIDE CUÁNDO ESTÁ HABILITADA */}
          {acuerdo.estado === 'accepted' && acuerdo.confirmaciones?.habilitada && puedeConfirmarMiembro && (
            <Panel titulo="¿Se realizó el servicio?">
              <p className="mb-3 text-xs leading-relaxed text-[#737373]">
                Los participantes deben confirmar el servicio. La transferencia de créditos solo puede realizarla el backend.
              </p>
              <div className="mb-4 space-y-2">
                <div className={`rounded-xl px-3 py-2 text-xs ${confirmacionPropia ? 'bg-green-50 text-green-700' : 'bg-[#F6F6F6] text-[#737373]'}`}>
                  Tú: {confirmacionPropia ? 'Confirmado' : 'Pendiente'}
                </div>
                <div className={`rounded-xl px-3 py-2 text-xs ${confirmacionOtra ? 'bg-green-50 text-green-700' : 'bg-[#F6F6F6] text-[#737373]'}`}>
                  {nombreOtraPersona}: {confirmacionOtra ? 'Confirmado' : 'Esperando confirmación'}
                </div>
              </div>
              {!confirmacionPropia && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!onConfirmarServicio || procesando}
                    onClick={() => onConfirmarServicio && void ejecutar(
                      () => onConfirmarServicio(acuerdo.id),
                      'Confirmación enviada. El backend actualizará el acuerdo y los créditos cuando corresponda.',
                    )}
                    className={`${ESTILO_ACCION} flex-1 bg-[#3C9DA0] text-white`}
                  >
                    Sí, confirmar
                  </button>
                  <button
                    type="button"
                    disabled={!onReportarProblema || procesando}
                    onClick={() => onReportarProblema && void ejecutar(
                      () => onReportarProblema(acuerdo.id),
                      'Reporte enviado para revisión.',
                    )}
                    className={`${ESTILO_ACCION} flex-1 border border-[#E8E8E8] text-[#D32F2F]`}
                  >
                    Reportar problema
                  </button>
                </div>
              )}
              {!onConfirmarServicio && !confirmacionPropia && (
                <p className="mt-2 text-xs text-[#737373]">La confirmación se habilitará al conectar la API.</p>
              )}
            </Panel>
          )}

          {/* 14. EXPERIENCIA DESPUÉS DE COMPLETAR UN INTERCAMBIO */}
          {acuerdo.estado === 'completed' && (
            <div className="rounded-2xl border border-[#B2DFE0] bg-[#E8F5F6] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Heart size={19} className="text-[#3C9DA0]" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-[#0D0D0D]">¡Intercambio completado!</p>
                  <p className="text-xs text-[#737373]">Comparte tu experiencia con la comunidad</p>
                </div>
              </div>
              <button
                type="button"
                disabled={!onCompartirExperiencia}
                onClick={() => onCompartirExperiencia?.(acuerdo.id)}
                className={`${ESTILO_ACCION} w-full bg-[#3C9DA0] text-white`}
              >
                Compartir experiencia
              </button>
            </div>
          )}

          <p className="pb-4 text-center text-xs text-[#9E9E9E]">
            Los estados, horarios definitivos y créditos se recibirán del backend.
          </p>
        </main>
      )}
    </div>
  );
}
