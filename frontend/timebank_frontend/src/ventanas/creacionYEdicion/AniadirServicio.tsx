import { useEffect, useState, type FormEvent } from 'react';
import { useMiembroSesion } from '../../contextos/MiembroSesionContext';
import { obtenerCategoriasRegistro, type CategoriaAPI } from '../../api/identidad.api';
import { crearServicioOfrecido } from '../../api/serviciosOfrecidos.api';
import { ArrowLeft, Camera, Star } from 'lucide-react';

/**
 * VISTA: Formulario para añadir un servicio al Banco de Tiempo.
 *
 * Componente independiente de ServiciosMiembro. Los datos se mantienen en
 * estado local hasta guardar; POST /servicios-ofrecidos confirma la creación.
 * onGuardar comunica el resultado al componente que lo esté mostrando.
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
  estimatedHours?: number;
}

interface AniadirServicioProps {
  onGuardar?: (servicio: NuevoServicio) => void;
  onCerrar?: () => void;
}

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
  const { perfil } = useMiembroSesion();
  const [categorias, setCategorias] = useState<CategoriaAPI[]>([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let vigente = true;
    void obtenerCategoriasRegistro().then(res => { if (vigente) setCategorias(res); })
      .catch(e => { if (vigente) setError(e instanceof Error ? e.message : 'No se pudieron cargar las categorías.'); });
    return () => { vigente = false; };
  }, []);
  const [visible, setVisible] = useState(true);
  const [guardado, setGuardado] = useState(false);

  const formularioValido = Boolean(titulo.trim() && categoriaId && descripcion.trim());

  // Solo confirma éxito después de recibir respuesta satisfactoria del backend.
  async function handleGuardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!formularioValido || guardado || guardando || !perfil || !categoriaId) return;

    const nuevoServicio: NuevoServicio = {
      title: titulo.trim(),
      category: categoria,
      description: descripcion.trim(),
      isVisible: visible,
    };

    setGuardando(true); setError(null);
    try {
      await crearServicioOfrecido({
        titulo: nuevoServicio.title, descripcion: nuevoServicio.description,
        visible: nuevoServicio.isVisible, perfilId: perfil.id, categoriaIds: [categoriaId],
      });
      onGuardar?.(nuevoServicio);
      setGuardado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible crear el servicio.');
    } finally { setGuardando(false); }
  }

  // 02. MENSAJE DE ÉXITO: el servidor confirmó la creación del servicio.
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
          Quedó registrado en tu catálogo personal.
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
            disabled={!formularioValido || guardando}
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
              {categorias.map((opcion) => (
                <ChipCategoria
                  key={opcion.id}
                  label={opcion.nombre}
                  selected={categoriaId === opcion.id}
                  onSelect={() => { setCategoriaId(opcion.id); setCategoria(opcion.nombre); }}
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

          {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {/* 01.3 BOTÓN INFERIOR GUARDAR SERVICIO */}
          <button
            type="submit"
            disabled={!formularioValido || guardando}
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
