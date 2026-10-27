import { CalendarDays, Clock3, Plus, Star, Trash2 } from 'lucide-react';
import type { IntervaloDisponibilidad } from '../../tipos/disponibilidad';

/**
 * COMPONENTE: editor visual de franjas de disponibilidad.
 * La validación aquí es de formato y límites de entrada (05:00–22:00).
 * Las reglas de negocio y la persistencia pertenecen al backend.
 *
 * Ubicación: src/componentes/calendario/EditorFranjasDisponibilidad.tsx
 */

export interface EditorFranjasDisponibilidadProps {
  franjas: IntervaloDisponibilidad[];
  onCambiar: (franjas: IntervaloDisponibilidad[]) => void;
  franjaPreferidaId: string;
  horasEstimadas: number;
  onCambiarPreferida: (id: string) => void;
  /** En los acuerdos se oculta el selector de preferencia; en CrearPostAyuda permanece visible. */
  mostrarPreferida?: boolean;
}

function fechaLocalISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function fechaManana(): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 1);
  return fechaLocalISO(fecha);
}

/** Se exporta para inicializar el formulario sin fechas fijas de Figma. */
export function crearPrimeraFranja(): IntervaloDisponibilidad {
  return { id: 'franja-1', date: fechaManana(), startTime: '14:00', endTime: '17:00' };
}

/** Validación inmediata de campos; el servidor validará nuevamente al publicar. */
export function esFranjaValida(franja: IntervaloDisponibilidad): boolean {
  return (
    Boolean(franja.date) &&
    /^\d{2}:\d{2}$/.test(franja.startTime) &&
    /^\d{2}:\d{2}$/.test(franja.endTime) &&
    franja.startTime >= '05:00' &&
    franja.endTime <= '22:00' &&
    franja.endTime > franja.startTime
  );
}

/** Comprobación inmediata de duración para el formulario; el backend vuelve a validarla. */
export function duracionFranjaEnMinutos(franja: IntervaloDisponibilidad): number {
  const [horaInicio, minutoInicio] = franja.startTime.split(':').map(Number);
  const [horaFin, minutoFin] = franja.endTime.split(':').map(Number);
  return horaFin * 60 + minutoFin - (horaInicio * 60 + minutoInicio);
}

export function cumpleDuracionMinima(
  franja: IntervaloDisponibilidad,
  horasEstimadas: number,
): boolean {
  return esFranjaValida(franja) &&
    Number.isSafeInteger(horasEstimadas) &&
    horasEstimadas > 0 &&
    duracionFranjaEnMinutos(franja) >= horasEstimadas * 60;
}

const ESTILO_CONTROL =
  'min-w-0 w-full rounded-xl border border-[#E8E8E8] bg-white px-3 py-2.5 text-sm text-[#0D0D0D] outline-none transition-colors focus:border-[#3C9DA0] focus-visible:ring-2 focus-visible:ring-[#3C9DA0]/20';

export default function EditorFranjasDisponibilidad({
  franjas,
  onCambiar,
  franjaPreferidaId,
  horasEstimadas,
  onCambiarPreferida,
  mostrarPreferida = true,
}: EditorFranjasDisponibilidadProps) {
  const hoy = fechaLocalISO(new Date());

  // 01. MODIFICAR ÚNICAMENTE LA FRANJA SELECCIONADA.
  function actualizarFranja(id: string, campo: 'date' | 'startTime' | 'endTime', valor: string) {
    onCambiar(franjas.map((franja) =>
      franja.id === id ? { ...franja, [campo]: valor } : franja,
    ));
  }

  // 02. AÑADIR O ELIMINAR FRANJAS: acciones locales del formulario.
  function agregarFranja() {
    const nueva: IntervaloDisponibilidad = {
      id: `franja-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: franjas[franjas.length - 1]?.date ?? fechaManana(),
      startTime: '14:00',
      endTime: '17:00',
    };
    onCambiar([...franjas, nueva]);
    if (franjas.length === 0) onCambiarPreferida(nueva.id);
  }

  function eliminarFranja(id: string) {
    const restantes = franjas.filter((franja) => franja.id !== id);
    onCambiar(restantes);
    if (franjaPreferidaId === id) onCambiarPreferida(restantes[0]?.id ?? '');
  }

  return (
    <div data-section="editor-franjas-disponibilidad" className="space-y-3">
      {franjas.map((franja, indice) => {
        const preferida = franjaPreferidaId === franja.id;
        const valida = esFranjaValida(franja);
        const duracionSuficiente = cumpleDuracionMinima(franja, horasEstimadas);
        const horasValidas = Number.isSafeInteger(horasEstimadas) && horasEstimadas > 0;

        return (
          <div
            key={franja.id}
            className={`rounded-2xl border bg-white p-3 transition-colors ${preferida ? 'border-[#3C9DA0]' : 'border-[#E8E8E8]'}`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#0D0D0D]">Opción {indice + 1}</span>
              <button
                type="button"
                onClick={() => eliminarFranja(franja.id)}
                aria-label={`Eliminar opción ${indice + 1}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#9E9E9E] hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block space-y-1.5">
                <span className="flex items-center gap-1 text-xs font-medium text-[#737373]">
                  <CalendarDays size={13} aria-hidden="true" /> Fecha
                </span>
                <input
                  type="date"
                  min={hoy}
                  value={franja.date}
                  onChange={(evento) => actualizarFranja(franja.id, 'date', evento.target.value)}
                  className={ESTILO_CONTROL}
                  required
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block min-w-0 space-y-1.5">
                  <span className="flex items-center gap-1 text-xs font-medium text-[#737373]">
                    <Clock3 size={13} aria-hidden="true" /> Desde
                  </span>
                  <input
                    type="time"
                    min="05:00"
                    max="22:00"
                    step={1800}
                    value={franja.startTime}
                    onChange={(evento) => actualizarFranja(franja.id, 'startTime', evento.target.value)}
                    className={ESTILO_CONTROL}
                    required
                  />
                </label>
                <label className="block min-w-0 space-y-1.5">
                  <span className="flex items-center gap-1 text-xs font-medium text-[#737373]">
                    <Clock3 size={13} aria-hidden="true" /> Hasta
                  </span>
                  <input
                    type="time"
                    min="05:00"
                    max="22:00"
                    step={1800}
                    value={franja.endTime}
                    onChange={(evento) => actualizarFranja(franja.id, 'endTime', evento.target.value)}
                    className={ESTILO_CONTROL}
                    required
                  />
                </label>
              </div>
            </div>

            {!valida && (
              <p className="mt-2 text-xs text-red-600" role="alert">
                Indica una fecha y un intervalo válido entre 5:00 a. m. y 10:00 p. m.
              </p>
            )}

            {valida && horasValidas && !duracionSuficiente && (
              <p className="mt-2 text-xs text-red-600" role="alert">
                Esta franja dura {duracionFranjaEnMinutos(franja) / 60} h y debe tener al menos {horasEstimadas} h.
                Amplía el horario o cambia las horas estimadas.
              </p>
            )}

            {mostrarPreferida && (
            <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-[#F0F0F0] pt-3">
              <input
                type="radio"
                name="franja-preferida"
                checked={preferida}
                onChange={() => onCambiarPreferida(franja.id)}
                className="accent-[#3C9DA0]"
              />
              <Star size={14} className={preferida ? 'text-[#F57F17]' : 'text-[#9E9E9E]'} aria-hidden="true" />
              <span className="text-xs font-medium text-[#737373]">
                {preferida ? 'Horario preferido' : 'Marcar como horario preferido'}
              </span>
            </label>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={agregarFranja}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#3C9DA0] px-4 py-3 text-sm font-semibold text-[#3C9DA0] hover:bg-[#E8F5F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]"
      >
        <Plus size={17} aria-hidden="true" /> Agregar otra franja
      </button>
      <p className="text-xs text-[#737373]">
        Puedes proponer varias fechas de lunes a domingo, entre las 5:00 a. m. y las 10:00 p. m.
      </p>
    </div>
  );
}
