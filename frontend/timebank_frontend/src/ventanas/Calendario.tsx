import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

import {
  CalendarioDiario,
  CalendarioSemanal,
  SelectorDia,
  obtenerSemana,
  type EventoCalendario,
} from '../componentes/calendario/CalendarioFranjasHoras';
import type { AcuerdoCalendario } from '../tipos/acuerdoCalendario';
import { ACUERDOS_CALENDARIO_DEMO } from '../mocks/acuerdosCalendario.mocks';

/**
 * VISTA: calendario personal del miembro autenticado.
 *
 * - Muestra acuerdos confirmados y programados, recibidos como datos preparados.
 * - Reutiliza el calendario visual de lunes a domingo, 05:00–22:00.
 * - Usa navegación semanal y selector diario en pantallas pequeñas.
 * - La navegación al detalle es responsabilidad de App.tsx (callback opcional).
 * - NO filtra estados ni calcula disponibilidades: esas decisiones son del backend.
 *
 * Ubicación: src/ventanas/Calendario.tsx
 */

// ─────────────────────── 00. PROPIEDADES ───────────────────────
export interface CalendarioProps {
  /** Lista ya seleccionada por la API para el miembro con sesión iniciada. */
  acuerdos?: AcuerdoCalendario[];
  /** Conectar cuando esté implementada la ruta de detalle de acuerdos. */
  onVerAcuerdo?: (acuerdoId: string) => void;
}

// ─────────────────────── 01. FORMATO VISUAL DE FECHAS ───────────────────────
function fechaLocalISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function interpretarFecha(fechaISO: string): Date {
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  // Interpretar como fecha local a mediodía evita cambios por zona horaria.
  return new Date(anio, mes - 1, dia, 12);
}

function formatearFecha(fechaISO: string, corta = false): string {
  return new Intl.DateTimeFormat('es-CO',
    corta ? { day: 'numeric', month: 'long' } : { dateStyle: 'full' },
  ).format(interpretarFecha(fechaISO));
}

// ─────────────────────── 02. COMPONENTE PRINCIPAL ───────────────────────
export default function Calendario({
  acuerdos = ACUERDOS_CALENDARIO_DEMO,
  onVerAcuerdo,
}: CalendarioProps) {
  // 02.1 ESTADO DE PRESENTACIÓN: día y semana que el miembro está consultando.
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => fechaLocalISO(new Date()));
  const [semanaReferencia, setSemanaReferencia] = useState(() => fechaLocalISO(new Date()));
  const fechasSemana = obtenerSemana(semanaReferencia);

  // 02.2 TRANSFORMACIÓN PARA EL COMPONENTE VISUAL.
  // Los acuerdos llegan confirmados por la API (o el mock temporal).
  const eventos: EventoCalendario[] = useMemo(
    () => acuerdos.map((acuerdo) => ({
      id: acuerdo.id,
      date: acuerdo.fecha,
      startTime: acuerdo.horaInicio,
      endTime: acuerdo.horaFin,
      title: acuerdo.servicio,
      subtitle: acuerdo.participantes,
      kind: 'event' as const,
      onClick: onVerAcuerdo ? () => onVerAcuerdo(acuerdo.id) : undefined,
    })),
    [acuerdos, onVerAcuerdo],
  );

  // 02.3 SOLO PARA MOSTRAR SI HAY EVENTOS EN LA SEMANA VISIBLE.
  // No decide cuáles acuerdos son válidos.
  const hayEventosEstaSemana = eventos.some((evento) => fechasSemana.includes(evento.date));

  // 02.4 NAVEGACIÓN ENTRE SEMANAS (INTERACCIÓN LOCAL DE LA INTERFAZ).
  function cambiarSemana(cantidadSemanas: number) {
    const nuevaFecha = interpretarFecha(semanaReferencia);
    nuevaFecha.setDate(nuevaFecha.getDate() + cantidadSemanas * 7);
    const proximaReferencia = fechaLocalISO(nuevaFecha);
    setSemanaReferencia(proximaReferencia);
    setFechaSeleccionada(obtenerSemana(proximaReferencia)[0]);
  }

  function volverAHoy() {
    const hoy = fechaLocalISO(new Date());
    setSemanaReferencia(hoy);
    setFechaSeleccionada(hoy);
  }

  return (
    <div className="flex h-dvh min-h-0 min-w-0 flex-col overflow-hidden bg-[#F6F6F6]" data-section="calendario-personal">
      {/* 03. ENCABEZADO Y CONTROLES DE NAVEGACIÓN */}
      <header
        data-section="encabezado-calendario"
        className="z-30 shrink-0 border-b border-[#E8E8E8] bg-white px-4 py-4 lg:py-6"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Calendario
            </h1>
            <p className="mt-0.5 text-xs text-[#737373]">Tus próximos acuerdos confirmados</p>
          </div>

          <div className="flex shrink-0 items-center gap-2" aria-label="Navegación del calendario">
            <button
              type="button"
              onClick={volverAHoy}
              className="rounded-xl border border-[#E8E8E8] px-3 py-2 text-xs font-semibold text-[#0D0D0D] transition-colors hover:bg-[#F6F6F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => cambiarSemana(-1)}
              aria-label="Semana anterior"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F6F6F6] text-[#0D0D0D] transition-colors hover:bg-[#E8F5F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => cambiarSemana(1)}
              aria-label="Semana siguiente"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F6F6F6] text-[#0D0D0D] transition-colors hover:bg-[#E8F5F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* 04. CONTENIDO */}
      <main className="mx-auto flex w-full max-w-6xl min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 py-4" data-section="contenido-calendario">
        <h2 className="mb-3 shrink-0 text-sm font-bold text-[#0D0D0D] sm:text-base">
          Semana del {formatearFecha(fechasSemana[0], true)} al {formatearFecha(fechasSemana[6], true)}
        </h2>

        {eventos.length === 0 ? (
          /* 04.1 LA API (O EL MOCK) NO DEVOLVIÓ ACUERDOS PROGRAMADOS */
          <section className="rounded-2xl border border-[#E8E8E8] bg-white px-4 py-16 text-center" role="status">
            <CalendarDays size={36} className="mx-auto mb-3 text-[#C8C8C8]" aria-hidden="true" />
            <p className="text-sm font-medium text-[#737373]">No tienes actividades programadas.</p>
            <p className="mx-auto mt-1 max-w-xs text-xs text-[#9E9E9E]">
              Cuando se confirme la fecha y hora de un acuerdo, aparecerá aquí.
            </p>
          </section>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {!hayEventosEstaSemana && (
              <p className="mb-3 shrink-0 text-xs text-[#737373]" role="status">
                No tienes acuerdos programados para esta semana. Puedes consultar otras semanas con las flechas.
              </p>
            )}

            {/* 04.2 VISTA MÓVIL: SELECCIÓN DE DÍA + FRANJAS HORARIAS */}
            <div className="flex min-h-0 flex-1 flex-col lg:hidden">
              <div className="mb-4 shrink-0 rounded-2xl border border-[#E8E8E8] bg-white p-3">
                <SelectorDia
                  fechas={fechasSemana}
                  fechaSeleccionada={fechaSeleccionada}
                  onSeleccionar={setFechaSeleccionada}
                />
                <p className="mt-3 text-xs font-semibold capitalize text-[#0D0D0D]">
                  {formatearFecha(fechaSeleccionada)}
                </p>
              </div>
              <div className="min-h-0 flex-1">
                <CalendarioDiario fecha={fechaSeleccionada} eventos={eventos} scrollInterno />
              </div>
            </div>

            {/* 04.3 VISTA DE ESCRITORIO: CALENDARIO DE LUNES A DOMINGO */}
            <div className="hidden min-h-0 flex-1 flex-col overflow-hidden lg:flex">
              {onVerAcuerdo && (
                <p className="mb-3 shrink-0 text-right text-xs text-[#737373]">
                  Selecciona una actividad para abrir el acuerdo
                </p>
              )}
              <div className="min-h-0 flex-1">
                <CalendarioSemanal fechas={fechasSemana} eventos={eventos} scrollInterno />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
