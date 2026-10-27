/**
 * COMPONENTE: Calendario de franjas horarias del Banco de Tiempo.
 *
 * - Muestra horarios de 05:00 a 22:00 (5 a. m. a 10 p. m.).
 * - La semana incluye los siete días: lunes a domingo.
 * - Vista diaria para móvil y semanal para escritorio.
 * - Solo representa eventos: no gestiona ni guarda disponibilidades.
 * - El contenedor padre controla la fecha seleccionada y los eventos.
 *
 * Ubicación sugerida: src/componentes/calendario/CalendarioFranjasHoras.tsx
 */

// ──────────────────── 00. TIPOS Y CONSTANTES ────────────────────

export type EventoCalendario = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (formato de 24 horas)
  endTime: string; // HH:mm (formato de 24 horas)
  title: string;
  subtitle?: string;
  kind?: 'event' | 'availability' | 'preferred' | 'participant' | 'overlap' | 'insufficient';
  lane?: number;
  laneCount?: number;
  onClick?: () => void;
};

const HORA_INICIO = 5;
const HORA_FIN = 22;
const MINUTOS_VISIBLES = (HORA_FIN - HORA_INICIO) * 60;
const ALTURA_CALENDARIO = 'h-[1020px]'; // 17 horas × 60 px por hora
const HORAS = Array.from(
  { length: HORA_FIN - HORA_INICIO + 1 },
  (_, indice) => HORA_INICIO + indice,
);

const ESTILOS_EVENTO: Record<NonNullable<EventoCalendario['kind']>, string> = {
  event: 'border-[#3C9DA0] bg-[#E8F5F6] text-[#0D0D0D]',
  availability: 'border-[#3C9DA0] bg-[#CFEAEC] text-[#0D0D0D]',
  preferred: 'border-[#0D0D0D] bg-[#FFFF00] text-[#0D0D0D]',
  participant: 'border-[#3C9DA0] bg-white text-[#0D0D0D]',
  overlap: 'z-20 border-[#0D0D0D] bg-[#FFFF00] text-[#0D0D0D] shadow-sm',
  insufficient: 'z-20 border-dashed border-[#737373] bg-white/95 text-[#0D0D0D]',
};

// ──────────────────── 01. UTILIDADES DE FECHAS Y HORAS ────────────────────

function interpretarFechaLocal(fechaISO: string): Date {
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  if (!anio || !mes || !dia) {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 12);
  }
  // Mediodía local: evita cambios accidentales de día por zona horaria.
  return new Date(anio, mes - 1, dia, 12);
}

function fechaISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function horaAMinutos(hora: string): number {
  const partes = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hora);
  return partes ? Number(partes[1]) * 60 + Number(partes[2]) : Number.NaN;
}

/** Devuelve lunes, martes, miércoles, jueves, viernes, sábado y domingo. */
export function obtenerSemana(fechaReferencia: string): string[] {
  const lunes = interpretarFechaLocal(fechaReferencia);
  const diasDesdeLunes = (lunes.getDay() + 6) % 7;
  lunes.setDate(lunes.getDate() - diasDesdeLunes);

  return Array.from({ length: 7 }, (_, indice) => {
    const dia = new Date(lunes);
    dia.setDate(lunes.getDate() + indice);
    return fechaISO(dia);
  });
}

// ──────────────────── 02. SELECTOR DE DÍA (MÓVIL) ────────────────────

export function SelectorDia({
  fechas,
  fechaSeleccionada,
  onSeleccionar,
}: {
  fechas: string[];
  fechaSeleccionada: string;
  onSeleccionar: (fecha: string) => void;
}) {
  return (
    <nav aria-label="Seleccionar día del calendario" className="grid grid-cols-7 gap-1">
      {fechas.map((fecha) => {
        const dia = interpretarFechaLocal(fecha);
        const diaSemana = new Intl.DateTimeFormat('es-CO', { weekday: 'short' })
          .format(dia)
          .replace('.', '');
        const activo = fechaSeleccionada === fecha;

        return (
          <button
            key={fecha}
            type="button"
            onClick={() => onSeleccionar(fecha)}
            aria-pressed={activo}
            aria-label={new Intl.DateTimeFormat('es-CO', { dateStyle: 'full' }).format(dia)}
            className={`min-w-0 rounded-xl px-0.5 py-2 text-center transition-[background-color,color,transform] duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] ${
              activo ? 'bg-[#3C9DA0] text-white' : 'bg-[#F6F6F6] text-[#737373] hover:bg-[#E8F5F6]'
            }`}
          >
            <span className="block truncate text-[10px] font-semibold capitalize">{diaSemana}</span>
            <span className="block text-sm font-bold">{dia.getDate()}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ──────────────────── 03. ELEMENTOS INTERNOS DEL CALENDARIO ────────────────────

function BloqueHorario({ evento }: { evento: EventoCalendario }) {
  const inicio = horaAMinutos(evento.startTime);
  const fin = horaAMinutos(evento.endTime);

  // No representar intervalos inválidos o completamente fuera de 05:00–22:00.
  if (!Number.isFinite(inicio) || !Number.isFinite(fin) || fin <= inicio) return null;
  if (fin <= HORA_INICIO * 60 || inicio >= HORA_FIN * 60) return null;

  const inicioVisible = Math.max(inicio, HORA_INICIO * 60);
  const finVisible = Math.min(fin, HORA_FIN * 60);
  const superior = ((inicioVisible - HORA_INICIO * 60) / MINUTOS_VISIBLES) * 100;
  const altoReal = ((finVisible - inicioVisible) / MINUTOS_VISIBLES) * 100;
  const alto = Math.min(Math.max(altoReal, 2.5), 100 - superior);

  const cantidadCarriles = Math.max(1, Math.trunc(evento.laneCount ?? 1));
  const carril = Math.min(Math.max(0, Math.trunc(evento.lane ?? 0)), cantidadCarriles - 1);
  const izquierda = (carril / cantidadCarriles) * 100;
  const ancho = 100 / cantidadCarriles;

  const estilos = ESTILOS_EVENTO[evento.kind ?? 'event'];
  const clases = `absolute overflow-hidden rounded-lg border-l-4 p-1.5 text-left ${estilos}`;
  const posicion = {
    top: `${superior}%`,
    height: `${alto}%`,
    left: `calc(${izquierda}% + 2px)`,
    width: `calc(${ancho}% - 4px)`,
  };
  const contenido = (
    <>
      <span className="block truncate text-[10px] font-bold leading-tight">
        {evento.startTime}–{evento.endTime}
      </span>
      <span className="mt-0.5 block line-clamp-2 text-[11px] font-bold leading-tight">
        {evento.title}
      </span>
      {evento.subtitle && (
        <span className="mt-0.5 block truncate text-[9px] leading-tight opacity-75">
          {evento.subtitle}
        </span>
      )}
    </>
  );

  if (evento.onClick) {
    return (
      <button
        type="button"
        onClick={evento.onClick}
        className={`${clases} cursor-pointer transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D]`}
        style={posicion}
        aria-label={`${evento.title}, de ${evento.startTime} a ${evento.endTime}`}
        title={`${evento.title}: ${evento.startTime}–${evento.endTime}`}
      >
        {contenido}
      </button>
    );
  }

  return (
    <div className={clases} style={posicion} title={`${evento.title}: ${evento.startTime}–${evento.endTime}`}>
      {contenido}
    </div>
  );
}

function EjeHoras() {
  return (
    <div className={`relative w-14 shrink-0 border-r border-[#E8E8E8] bg-white ${ALTURA_CALENDARIO}`}>
      {HORAS.map((hora, indice) => (
        <span
          key={hora}
          className="absolute right-1 text-[9px] font-medium text-[#737373]"
          style={{
            top: `${(indice / (HORA_FIN - HORA_INICIO)) * 100}%`,
            transform: indice === 0 ? 'translateY(1px)' : indice === HORAS.length - 1 ? 'translateY(-100%)' : 'translateY(-50%)',
          }}
        >
          {String(hora).padStart(2, '0')}:00
        </span>
      ))}
    </div>
  );
}

function ColumnaDia({ eventos }: { eventos: EventoCalendario[] }) {
  return (
    <div className={`relative min-w-0 bg-white ${ALTURA_CALENDARIO}`}>
      {HORAS.map((hora, indice) => (
        <div
          key={hora}
          aria-hidden="true"
          className="pointer-events-none absolute right-0 left-0 border-t border-[#E8E8E8]"
          style={{ top: `${(indice / (HORA_FIN - HORA_INICIO)) * 100}%` }}
        />
      ))}
      {eventos.map((evento) => (
        <BloqueHorario key={evento.id} evento={evento} />
      ))}
    </div>
  );
}

// ──────────────────── 04. VISTAS REUTILIZABLES ────────────────────

/** Representa una sola fecha. Ideal para acompañar SelectorDia en móvil. */
export function CalendarioDiario({
  fecha,
  eventos,
  scrollInterno = false,
}: {
  fecha: string;
  eventos: EventoCalendario[];
  scrollInterno?: boolean;
}) {
  return (
    <section
      aria-label={`Calendario del ${fecha}`}
      className={`rounded-2xl border border-[#E8E8E8] bg-white ${scrollInterno ? 'h-full min-h-0 overflow-y-auto overflow-x-hidden' : 'overflow-hidden'}`}
    >
      <div className="flex">
        <EjeHoras />
        <div className="min-w-0 flex-1">
          <ColumnaDia eventos={eventos.filter((evento) => evento.date === fecha)} />
        </div>
      </div>
    </section>
  );
}

/** Representa siete días (lunes a domingo); permite desplazamiento horizontal. */
export function CalendarioSemanal({
  fechas,
  eventos,
  scrollInterno = false,
}: {
  fechas: string[];
  eventos: EventoCalendario[];
  scrollInterno?: boolean;
}) {
  return (
    <section
      aria-label="Calendario semanal de lunes a domingo"
      className={`min-w-0 rounded-2xl border border-[#E8E8E8] bg-white ${scrollInterno ? 'h-full min-h-0 overflow-auto' : 'overflow-x-auto'}`}
    >
      <div className="min-w-[840px]">
        <div className={`grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-[#E8E8E8] ${scrollInterno ? 'sticky top-0 z-30 bg-white' : ''}`}>
          <div aria-hidden="true" />
          {fechas.map((fecha) => {
            const dia = interpretarFechaLocal(fecha);
            return (
              <div key={fecha} className="border-l border-[#E8E8E8] px-1 py-3 text-center">
                <span className="block truncate text-[10px] font-semibold uppercase text-[#737373]">
                  {new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(dia).replace('.', '')}
                </span>
                <span className="block text-sm font-bold text-[#0D0D0D]">{dia.getDate()}</span>
              </div>
            );
          })}
        </div>
        <div className="flex">
          <EjeHoras />
          <div className="grid min-w-0 flex-1 grid-cols-7">
            {fechas.map((fecha) => (
              <div key={fecha} className="min-w-0 border-l border-[#E8E8E8]">
                <ColumnaDia eventos={eventos.filter((evento) => evento.date === fecha)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
