import { useState, type FormEvent } from 'react';
import { ArrowLeft, Camera, Star } from 'lucide-react';

/**
 * VISTA: Formulario para añadir un servicio al Banco de Tiempo.
 *
 * Componente independiente de ServiciosMiembro. Los datos se mantienen en
 * estado local hasta guardar; onGuardar comunica el resultado al componente
 * que lo esté mostrando. No hay backend ni persistencia real.
 *
 * Secciones:
 *   00. Tipo de datos y categorías
 *   01. Formulario y controles visuales
 *   02. Confirmación visual de guardado
 */

// ─────────────────────────── 00. DATOS DEL FORMULARIO ─────────────────────────
export interface NuevoServicio {
  title: string;
  category: string;
  description: string;
  isVisible: boolean;
  estimatedHours: number;
}

interface AniadirServicioProps {
  onGuardar?: (servicio: NuevoServicio) => void;
  onCerrar?: () => void;
}

const CATEGORIAS = [
  'Tecnología',
  'Idiomas',
  'Académico',
  'Diseño',
  'Música',
  'Arte',
  'Bienestar',
  'Deportes',
  'Otros',
];

const ANIMACION_BOTON =
  'cursor-pointer transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out motion-safe:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2 motion-reduce:transition-none';

function ChipCategoria({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${ANIMACION_BOTON} ${
        selected ? 'bg-[#3C9DA0] text-white' : 'bg-[#E8F5F6] text-[#3C9DA0]'
      }`}
    >
      {label}
    </button>
  );
}

// ─────────────────────────── 01. VISTA AÑADIR SERVICIO ────────────────────────
export default function AñadirServicio({ onGuardar, onCerrar }: AniadirServicioProps) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [horas, setHoras] = useState('1');
  const [visible, setVisible] = useState(true);
  const [guardado, setGuardado] = useState(false);

  const formularioValido = Boolean(titulo.trim() && categoria && descripcion.trim());

  // Solo simula el guardado; el dato se agrega al estado local del listado.
  function handleGuardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!formularioValido || guardado) return;

    const nuevoServicio: NuevoServicio = {
      title: titulo.trim(),
      category: categoria,
      description: descripcion.trim(),
      isVisible: visible,
      estimatedHours: Number(horas),
    };

    setGuardado(true);
    // Solo demuestra el flujo visual; quien monta la vista decide qué hacer.
    window.setTimeout(() => onGuardar?.(nuevoServicio), 1500);
  }

  // 02. MENSAJE DE ÉXITO (solamente visual; no registra nada en el servidor).
  if (guardado) {
    return (
      <main
        data-section="servicio-guardado"
        className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center"
      >
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFFF00] motion-safe:animate-[pulse_500ms_ease-out_1]">
          <Star size={32} strokeWidth={2} className="text-[#0D0D0D]" />
        </div>
        <h1
          className="text-xl font-bold text-[#0D0D0D]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          ¡Servicio guardado!
        </h1>
        <p className="mt-2 text-sm text-[#737373]">
          Ya aparece en tu perfil y en Explorar.
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 01.1 ENCABEZADO DEL FORMULARIO */}
      <header
        data-section="encabezado-formulario"
        className="sticky top-0 z-30 border-b border-[#E8E8E8] bg-white px-4 pt-12 pb-4 lg:pt-6"
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar formulario"
            className={`${ANIMACION_BOTON} flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F6F6F6]`}
          >
            <ArrowLeft size={22} className="text-[#0D0D0D]" />
          </button>
          <h1
            className="min-w-0 flex-1 text-lg font-bold text-[#0D0D0D]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Añadir servicio
          </h1>
          <button
            type="submit"
            form="formulario-nuevo-servicio"
            disabled={!formularioValido}
            className={`${ANIMACION_BOTON} rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:active:scale-100 ${
              formularioValido
                ? 'bg-[#3C9DA0] text-white hover:bg-[#2D8B8E]'
                : 'bg-[#F0F0F0] text-[#9E9E9E]'
            }`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Guardar
          </button>
        </div>
      </header>

      {/* 01.2 CAMPOS DEL SERVICIO */}
      <main className="w-full flex-1">
        <form
          id="formulario-nuevo-servicio"
          data-section="formulario-servicio"
          onSubmit={handleGuardar}
          className="mx-auto w-full max-w-lg space-y-5 px-4 py-5"
        >
          {/* 01.2.1 NOMBRE */}
          <div data-section="nombre-servicio">
            <label
              htmlFor="servicio-nombre"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#737373]"
            >
              Nombre del servicio *
            </label>
            <input
              id="servicio-nombre"
              value={titulo}
              onChange={(evento) => setTitulo(evento.target.value)}
              placeholder="ej: Tutoría de Excel avanzado"
              className="w-full rounded-xl border border-[#E8E8E8] px-4 py-3 text-sm outline-none transition-colors focus:border-[#3C9DA0]"
            />
          </div>

          {/* 01.2.2 CATEGORÍA */}
          <fieldset data-section="categoria-servicio">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#737373]">
              Categoría *
            </legend>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map((opcion) => (
                <ChipCategoria
                  key={opcion}
                  label={opcion}
                  selected={categoria === opcion}
                  onSelect={() => setCategoria(opcion)}
                />
              ))}
            </div>
          </fieldset>

          {/* 01.2.3 DESCRIPCIÓN */}
          <div data-section="descripcion-servicio-formulario">
            <label
              htmlFor="servicio-descripcion"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#737373]"
            >
              Descripción *
            </label>
            <textarea
              id="servicio-descripcion"
              value={descripcion}
              onChange={(evento) => setDescripcion(evento.target.value)}
              placeholder="¿Qué incluye tu servicio? ¿Qué aprenderá quien lo tome?"
              rows={4}
              className="w-full resize-none rounded-xl border border-[#E8E8E8] px-4 py-3 text-sm outline-none transition-colors focus:border-[#3C9DA0]"
            />
          </div>

          {/* 01.2.4 DURACIÓN */}
          <div data-section="duracion-servicio">
            <label
              htmlFor="servicio-duracion"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#737373]"
            >
              Duración estimada
            </label>
            <select
              id="servicio-duracion"
              value={horas}
              onChange={(evento) => setHoras(evento.target.value)}
              className="w-full rounded-xl border border-[#E8E8E8] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#3C9DA0]"
            >
              {['0.5', '1', '1.5', '2', '3'].map((valor) => (
                <option key={valor} value={valor}>
                  {valor} hora{Number(valor) !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 01.2.5 IMÁGENES: botón solamente visual por ahora */}
          <div data-section="imagenes-servicio">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#737373]">
              Imágenes (opcional)
            </p>
            <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[#E8E8E8] p-6 text-center transition-colors hover:border-[#3C9DA0]">
              <Camera size={24} className="text-[#C0C0C0]" />
              <p className="text-sm text-[#9E9E9E]">
                Agregar fotos del servicio
              </p>
            </div>
          </div>

          {/* 01.2.6 VISIBILIDAD AL PUBLICAR */}
          <div
            data-section="visibilidad-inicial"
            className="flex items-center justify-between gap-3 rounded-xl bg-[#F6F6F6] p-4"
          >
            <div>
              <p className="text-sm font-medium text-[#0D0D0D]">
                Visible al publicar
              </p>
              <p className="text-xs text-[#737373]">
                Aparece en Explorar y tu perfil
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={visible}
              aria-label="Visible al publicar"
              onClick={() => setVisible((actual) => !actual)}
              className={`${ANIMACION_BOTON} relative h-6 w-12 shrink-0 rounded-full ${
                visible ? 'bg-[#3C9DA0]' : 'bg-[#D0D0D0]'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${
                  visible ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* 01.3 BOTÓN INFERIOR GUARDAR SERVICIO */}
          <button
            type="submit"
            disabled={!formularioValido}
            className={`${ANIMACION_BOTON} w-full rounded-2xl py-4 text-base font-bold disabled:cursor-not-allowed disabled:active:scale-100 ${
              formularioValido
                ? 'bg-[#3C9DA0] text-white hover:bg-[#2D8B8E]'
                : 'bg-[#F0F0F0] text-[#9E9E9E]'
            }`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Guardar servicio
          </button>
        </form>
      </main>
    </div>
  );
}
