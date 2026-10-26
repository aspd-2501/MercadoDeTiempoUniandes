import { useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';

import {
  CalendarioDiario,
  CalendarioSemanal,
  SelectorDia,
  obtenerSemana,
  type EventoCalendario,
} from './CalendarioFranjasHoras';
import type {
  DisponibilidadParticipante,
  IntervaloDisponibilidad,
  ResultadoDisponibilidad,
} from '../../tipos/disponibilidad';

/**
 * COMPONENTES: visualización de disponibilidades del Banco de Tiempo.
 *
 * - Muestran propuestas, estados de participantes y resultados de planificación.
 * - Reutilizan el calendario visual de 05:00 a 22:00, lunes a domingo.
 * - Reciben resultados ya calculados por el backend (o mocks).
 * - NO calculan coincidencias, validan acuerdos ni guardan disponibilidades.
 *
 * Ubicación: src/componentes/calendario/CalendarioDisponibilidad.tsx
 */

// ──────────────────── 00. TIPOS DE PROPIEDADES ────────────────────

export interface CalendarioDisponibilidadPostAyudaProps {
  intervalos: IntervaloDisponibilidad[];
  idPreferido?: string;
  duracion: number;
}

export interface EstadoDisponibilidadParticipantesProps {
  participantes: DisponibilidadParticipante[];
  nombres: Record<string, string>;
}

export interface DisponibilidadCompartidaProps
  extends EstadoDisponibilidadParticipantesProps {
  duracion: number;
  /** Respuesta de planificación del backend o un mock con la misma forma. */
  resultado: ResultadoDisponibilidad;
}

// ──────────────────── 01. FORMATO PARA LA INTERFAZ ────────────────────

/** Estas funciones solo formatean fechas/horas para mostrarlas; no planifican. */
function fechaLocal(fechaISO: string): Date | null {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaISO);
  if (!coincidencia) return null;

  const [, anio, mes, dia] = coincidencia.map(Number);
  const fecha = new Date(anio, mes - 1, dia, 12);
  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) return null;

  return fecha;
}

function aFechaISO(fecha: Date): string {
  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0'),
  ].join('-');
}

function fechaDeHoy(): string {
  return aFechaISO(new Date());
}

function sumarDias(fechaISO: string, cantidad: number): string {
  const fecha = fechaLocal(fechaISO);
  if (!fecha) return fechaISO;
  fecha.setDate(fecha.getDate() + cantidad);
  return aFechaISO(fecha);
}

function mostrarFecha(fechaISO: string): string {
  const fecha = fechaLocal(fechaISO);
  return fecha
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'full' }).format(fecha)
    : fechaISO;
}

function mostrarHora(hora: string): string {
  const coincidencia = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hora);
  if (!coincidencia) return hora;

  const horas = Number(coincidencia[1]);
  const hora12 = horas % 12 || 12;
  const periodo = horas < 12 ? 'a. m.' : 'p. m.';
  return `${hora12}:${coincidencia[2]} ${periodo}`;
}

function etiquetaDuracion(duracion: number): string {
  return `${duracion} hora${duracion === 1 ? '' : 's'}`;
}

// ──────────────────── 02. CALENDARIO RESPONSIVO REUTILIZABLE ────────────────────

/**
 * Se encarga exclusivamente de cambiar el día o semana que se muestra.
 * Navegar entre fechas es estado de interfaz, no lógica del backend.
 */
function VistaCalendarioDisponibilidad({
  fechaInicial,
  eventos,
}: {
  fechaInicial: string;
  eventos: EventoCalendario[];
}) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaInicial);
  const fechas = obtenerSemana(fechaSeleccionada);

  return (
    <div className="space-y-3" data-section="calendario-disponibilidad">
      {/* 02.1 NAVEGACIÓN ENTRE SEMANAS */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setFechaSeleccionada((fecha) => sumarDias(fecha, -7))}
          aria-label="Semana anterior"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E8E8E8] text-[#737373] transition-colors hover:bg-[#F6F6F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        <span className="min-w-0 text-center text-xs font-semibold text-[#0D0D0D]">
          Semana del {mostrarFecha(fechas[0])}
        </span>

        <button
          type="button"
          onClick={() => setFechaSeleccionada((fecha) => sumarDias(fecha, 7))}
          aria-label="Semana siguiente"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E8E8E8] text-[#737373] transition-colors hover:bg-[#F6F6F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      {/* 02.2 VISTA MÓVIL: selector y calendario diario */}
      <div className="space-y-3 lg:hidden">
        <SelectorDia
          fechas={fechas}
          fechaSeleccionada={fechaSeleccionada}
          onSeleccionar={setFechaSeleccionada}
        />
        <p className="text-xs font-semibold capitalize text-[#0D0D0D]">
          {mostrarFecha(fechaSeleccionada)}
        </p>
        <CalendarioDiario fecha={fechaSeleccionada} eventos={eventos} />
      </div>

      {/* 02.3 VISTA DE ESCRITORIO: calendario semanal */}
      <div className="hidden lg:block">
        <CalendarioSemanal fechas={fechas} eventos={eventos} />
      </div>
    </div>
  );
}

// ──────────────────── 03. PROPUESTA DE DISPONIBILIDAD DE UN POST ────────────────────

/** Muestra las franjas propuestas por quien publicó una solicitud de ayuda. */
export function CalendarioDisponibilidadPostAyuda({
  intervalos,
  idPreferido,
  duracion,
}: CalendarioDisponibilidadPostAyudaProps) {
  const eventos: EventoCalendario[] = intervalos.map((intervalo) => ({
    ...intervalo,
    title: intervalo.id === idPreferido ? 'Horario preferido' : 'Disponible',
    subtitle: 'Disponibilidad del autor',
    kind: intervalo.id === idPreferido ? 'preferred' : 'availability',
  }));

  const fechaInicial = intervalos[0]?.date ?? fechaDeHoy();

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white" data-section="disponibilidad-post-ayuda">
      <header className="border-b border-[#F0F0F0] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#0D0D0D]">
              Disponibilidad propuesta
            </h3>
            <p className="mt-0.5 text-xs text-[#737373]">
              Franjas propuestas por quien publica
            </p>
          </div>
          <span className="rounded-full bg-[#E8F5F6] px-2.5 py-1 text-xs font-semibold text-[#3C9DA0]">
            Duración requerida: {etiquetaDuracion(duracion)}
          </span>
        </div>
      </header>

      <div className="space-y-4 p-4">
        {intervalos.length > 0 ? (
          <VistaCalendarioDisponibilidad
            key={fechaInicial}
            fechaInicial={fechaInicial}
            eventos={eventos}
          />
        ) : (
          <p className="rounded-xl bg-[#F6F6F6] p-4 text-sm text-[#737373]" role="status">
            Todavía no hay franjas de disponibilidad propuestas.
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-[11px] text-[#737373]">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-[#CFEAEC]" aria-hidden="true" />
            Disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-[#0D0D0D] bg-[#FFFF00]" aria-hidden="true" />
            Horario preferido
          </span>
        </div>
      </div>
    </section>
  );
}

// ──────────────────── 04. ESTADO DE RESPUESTA DE LOS PARTICIPANTES ────────────────────

/** Lista de quién ya envió sus disponibilidades y quién sigue pendiente. */
export function EstadoDisponibilidadParticipantes({
  participantes,
  nombres,
}: EstadoDisponibilidadParticipantesProps) {
  if (participantes.length === 0) {
    return <p className="text-sm text-[#737373]">Todavía no hay participantes registrados.</p>;
  }

  return (
    <div className="space-y-2" data-section="estado-disponibilidad-participantes">
      {participantes.map((participante) => {
        const nombre = nombres[participante.userId] ?? 'Participante';

        return (
          <div
            key={participante.userId}
            className="flex items-center gap-3 rounded-xl bg-[#F6F6F6] px-3 py-2.5"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                participante.submitted
                  ? 'bg-[#3C9DA0] text-white'
                  : 'border border-[#9E9E9E] bg-white text-[#737373]'
              }`}
              aria-hidden="true"
            >
              {nombre.trim().charAt(0).toUpperCase() || '?'}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#0D0D0D]">
              {nombre}
            </span>
            <span
              className={`flex shrink-0 items-center gap-1 text-xs font-medium ${
                participante.submitted ? 'text-[#3C9DA0]' : 'text-[#737373]'
              }`}
            >
              {participante.submitted ? (
                <CheckCircle2 size={14} aria-hidden="true" />
              ) : (
                <Clock3 size={14} aria-hidden="true" />
              )}
              {participante.submitted ? 'Disponibilidad enviada' : 'Pendiente'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────── 05. DISPONIBILIDAD COMPARTIDA ────────────────────

/**
 * Dibuja los intervalos de los participantes y el resultado que llega del backend.
 * No busca ni determina coincidencias: `resultado` es una prop obligatoria.
 */
export function DisponibilidadCompartida({
  participantes,
  nombres,
  duracion,
  resultado,
}: DisponibilidadCompartidaProps) {
  // 05.1 CONVERSIÓN DE DATOS A EVENTOS VISUALES
  const enviados = participantes.filter((participante) => participante.submitted);
  const eventosParticipantes: EventoCalendario[] = enviados.flatMap(
    (participante, indice) =>
      participante.intervals.map((intervalo) => ({
        ...intervalo,
        id: `${participante.userId}-${intervalo.id}`,
        title: nombres[participante.userId] ?? 'Participante',
        subtitle: `${mostrarHora(intervalo.startTime)} – ${mostrarHora(intervalo.endTime)}`,
        kind: 'participant' as const,
        lane: indice,
        laneCount: Math.max(1, enviados.length),
      })),
  );

  // 05.2 REPRESENTACIÓN DEL RESULTADO SUMINISTRADO (SIN CÁLCULOS)
  const eventoResultado: EventoCalendario | null =
    resultado.estado === 'compatible'
      ? {
          ...resultado.intervalo,
          id: 'resultado-compatible',
          title: 'Todos disponibles',
          subtitle: 'Horario compatible',
          kind: 'overlap',
        }
      : resultado.estado === 'insuficiente'
        ? {
            ...resultado.intervalo,
            id: 'resultado-insuficiente',
            title: 'Coincidencia insuficiente',
            subtitle: `No alcanza ${etiquetaDuracion(duracion)}`,
            kind: 'insufficient',
          }
        : null;

  const eventos = eventoResultado
    ? [...eventosParticipantes, eventoResultado]
    : eventosParticipantes;

  const fechaInicial =
    eventoResultado?.date ??
    enviados.find((participante) => participante.intervals.length > 0)?.intervals[0]?.date ??
    fechaDeHoy();

  return (
    <section className="space-y-4" data-section="disponibilidad-compartida">
      {/* 05.3 ESTADO DE ENVÍO */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-[#0D0D0D]">
          Disponibilidad de participantes
        </h3>
        <EstadoDisponibilidadParticipantes
          participantes={participantes}
          nombres={nombres}
        />
      </div>

      {/* 05.4 DURACIÓN Y TEXTO DE CONTEXTO */}
      <div className="flex items-center gap-2 rounded-xl bg-[#FFFDE0] px-3 py-2.5 text-xs text-[#5A5A00]">
        <Clock3 size={15} className="shrink-0" aria-hidden="true" />
        <strong>Duración necesaria: {etiquetaDuracion(duracion)}</strong>
      </div>
      <p className="text-xs leading-relaxed text-[#737373]">
        El sistema revisará las disponibilidades enviadas y mostrará aquí el resultado de la planificación.
      </p>

      {/* 05.5 CALENDARIO Y LEYENDA */}
      <VistaCalendarioDisponibilidad
        key={fechaInicial}
        fechaInicial={fechaInicial}
        eventos={eventos}
      />

      <div className="flex flex-wrap gap-3 text-[11px] text-[#737373]">
        {enviados.map((participante) => {
          const nombre = nombres[participante.userId] ?? 'Participante';
          return (
            <span key={participante.userId} className="flex items-center gap-1.5">
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E8F5F6] text-[9px] font-bold text-[#3C9DA0]"
                aria-hidden="true"
              >
                {nombre.trim().charAt(0).toUpperCase() || '?'}
              </span>
              {nombre}
            </span>
          );
        })}
      </div>

      {/* 05.6 RESPUESTA DEL BACKEND (O DEL MOCK) */}
      {resultado.estado === 'pendiente' && (
        <div className="rounded-xl bg-[#E8F5F6] p-3 text-sm text-[#2D7B7E]" role="status">
          Resultado pendiente. Aún no se ha confirmado un horario común.
        </div>
      )}

      {resultado.estado === 'compatible' && (
        <div className="rounded-xl border border-[#FFF176] bg-[#FFFF00] p-3" role="status">
          <p className="text-sm font-bold text-[#0D0D0D]">
            Todos disponibles · Horario compatible
          </p>
          <p className="mt-0.5 text-xs text-[#0D0D0D]">
            {mostrarFecha(resultado.intervalo.date)} ·{' '}
            {mostrarHora(resultado.intervalo.startTime)} –{' '}
            {mostrarHora(resultado.intervalo.endTime)}
          </p>
        </div>
      )}

      {resultado.estado === 'insuficiente' && (
        <div className="rounded-xl bg-[#FFFDE0] p-3" role="status">
          <p className="text-sm font-bold text-[#0D0D0D]">
            Coincidencia insuficiente
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#737373]">
            {mostrarFecha(resultado.intervalo.date)} ·{' '}
            {mostrarHora(resultado.intervalo.startTime)} –{' '}
            {mostrarHora(resultado.intervalo.endTime)}.
            Esta franja no alcanza la duración requerida de {etiquetaDuracion(duracion)}.
          </p>
        </div>
      )}

      {resultado.estado === 'sin-coincidencia' && (
        <div className="rounded-xl bg-[#FFFDE0] p-3" role="status">
          <p className="text-sm font-bold text-[#0D0D0D]">
            No encontramos una franja en común con la duración necesaria.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#737373]">
            Los participantes pueden proponer nuevas franjas de disponibilidad.
          </p>
        </div>
      )}
    </section>
  );
}
