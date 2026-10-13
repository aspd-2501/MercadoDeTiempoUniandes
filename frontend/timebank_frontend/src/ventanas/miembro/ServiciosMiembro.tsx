import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';

/**
 * VISTA: Servicios ofrecidos por un miembro del Banco de Tiempo.
 *
 * La lista y las tarjetas usan datos simulados. Las acciones de mostrar,
 * ocultar y eliminar solo modifican el estado local del componente.
 *
 * El formulario de creación es un componente independiente que se encuentra en
 * src/ventanas/creacionYEdicion/AniadirServicio.tsx.
 *
 * Secciones:
 *   00. Tipos y datos simulados
 *   01. Encabezado de Mis servicios
 *   02. Lista de servicios / estado vacío
 *   03. Tarjeta individual de servicio
 */

// ────────────────────────── 00. TIPOS Y DATOS SIMULADOS ───────────────────────
interface ServicioMiembro {
  id: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  isVisible: boolean;   
  estimatedHours: number;
  imageUrl?: string;
}

interface TarjetaServicioProps {
  servicio: ServicioMiembro;
  onCambiarVisibilidad: () => void;
  onEliminar: () => void;
}

const ID_MIEMBRO_DEMO = 'miembro-demo-1';

const SERVICIOS_DEMO: ServicioMiembro[] = [
  {
    id: 'servicio-demo-1',
    userId: ID_MIEMBRO_DEMO,
    title: 'Tutorías de cálculo diferencial',
    category: 'Académico / Matemáticas',
    description:
      'Te ayudo a resolver dudas, estudiar para parciales y practicar ejercicios de cálculo.',
    isVisible: true,
    estimatedHours: 2,
  },
  {
    id: 'servicio-demo-2',
    userId: ID_MIEMBRO_DEMO,
    title: 'Conversación en inglés',
    category: 'Idiomas',
    description:
      'Práctica conversacional de inglés para mejorar tu fluidez y confianza.',
    isVisible: true,
    estimatedHours: 1,
  },
  {
    id: 'servicio-demo-3',
    userId: ID_MIEMBRO_DEMO,
    title: 'Introducción a Photoshop',
    category: 'Diseño',
    description:
      'Aprende las herramientas básicas de edición de imágenes y retoque fotográfico.',
    isVisible: false,
    estimatedHours: 1.5,
  },
];

// Animaciones visuales: no implican navegación ni acciones reales.
const ANIMACION_BOTON =
  'cursor-pointer transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out motion-safe:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2 motion-reduce:transition-none';

const ANIMACION_ELEVACION = 'motion-safe:hover:-translate-y-0.5 hover:shadow-md';

// Categorías en las tarjetas, solamente visuales.
function ChipCategoria({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#E8F5F6] px-2.5 py-1 text-xs font-medium text-[#3C9DA0]">
      {label}
    </span>
  );
}

// ───────────────────────── COMPONENTE PRINCIPAL ─────────────────────────
export default function ServiciosMiembro() {
  const [servicios, setServicios] = useState<ServicioMiembro[]>(SERVICIOS_DEMO);

  // Acciones de demostración: solo actualizan los datos en memoria.
  function cambiarVisibilidad(id: string) {
    setServicios((actuales) =>
      actuales.map((servicio) =>
        servicio.id === id
          ? { ...servicio, isVisible: !servicio.isVisible }
          : servicio
      )
    );
  }

  function eliminarServicio(id: string) {
    setServicios((actuales) => actuales.filter((servicio) => servicio.id !== id));
  }  

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      {/* 01. ENCABEZADO: regreso, título y botón Añadir */}
      <header
        data-section="encabezado-servicios"
        className="sticky top-0 z-30 border-b border-[#E8E8E8] bg-white px-4 pt-12 pb-4 lg:pt-6"
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {/* Navegación pendiente: por ahora solo interacción visual */}
            <button
              type="button"
              aria-label="Volver"
              className={`${ANIMACION_BOTON} flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-[#F6F6F6]`}
            >
              <ArrowLeft size={22} className="text-[#0D0D0D]" />
            </button>
            <h1
              className="text-xl font-bold text-[#0D0D0D]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Mis servicios
            </h1>
          </div>

          <button
            type="button"
            className={`${ANIMACION_BOTON} ${ANIMACION_ELEVACION} flex shrink-0 items-center gap-1.5 rounded-xl bg-[#3C9DA0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2D8B8E]`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <Plus size={16} />
            Añadir
          </button>
        </div>
      </header>

      {/* 02. CONTENIDO: servicios existentes o mensaje de estado vacío */}
      <main
        data-section="lista-servicios"
        className="mx-auto max-w-lg space-y-3 px-4 py-4"
      >
        {servicios.length === 0 ? (
          <section data-section="sin-servicios" className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F0F0F0]">
              <Star size={32} className="text-[#C0C0C0]" />
            </div>
            <h2
              className="mb-1 text-base font-bold text-[#0D0D0D]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Sin servicios publicados
            </h2>
            <p className="mb-5 text-sm text-[#737373]">
              Agrega tus habilidades y empieza a ayudar a la comunidad.
            </p>
            <button
              type="button"
              className={`${ANIMACION_BOTON} ${ANIMACION_ELEVACION} rounded-xl bg-[#3C9DA0] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2D8B8E]`}
            >
              Añadir mi primer servicio
            </button>
          </section>
        ) : (
          servicios.map((servicio) => (
            <TarjetaServicio
              key={servicio.id}
              servicio={servicio}
              onCambiarVisibilidad={() => cambiarVisibilidad(servicio.id)}
              onEliminar={() => eliminarServicio(servicio.id)}
            />
          ))
        )}
      </main>
    </div>
  );
}

// ─────────────────────── 03. TARJETA DE SERVICIO ───────────────────────
function TarjetaServicio({
  servicio,
  onCambiarVisibilidad,
  onEliminar,
}: TarjetaServicioProps) {
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);

  return (
    <article
      data-section="tarjeta-servicio"
      className={`overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white ${
        servicio.isVisible ? '' : 'opacity-70'
      }`}
    >
      {/* 03.1 IMAGEN OPCIONAL DEL SERVICIO */}
      {servicio.imageUrl && (
        <div data-section="imagen-servicio" className="h-36 bg-[#E8E8E8]">
          <img
            src={servicio.imageUrl}
            alt={servicio.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* 03.2 NOMBRE, CATEGORÍA Y DURACIÓN ESTIMADA */}
        <div data-section="informacion-servicio" className="mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className="text-sm font-bold text-[#0D0D0D]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {servicio.title}
            </h2>
            {!servicio.isVisible && (
              <span className="rounded-full bg-[#F0F0F0] px-2 py-0.5 text-xs text-[#9E9E9E]">
                Oculto
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <ChipCategoria label={servicio.category} />
            <span className="text-xs text-[#9E9E9E]">
              {servicio.estimatedHours} h
            </span>
          </div>
        </div>

        {/* 03.3 DESCRIPCIÓN DEL SERVICIO */}
        <p
          data-section="descripcion-servicio"
          className="mb-3 line-clamp-2 text-sm text-[#737373]"
        >
          {servicio.description}
        </p>

        {/* 03.4 BOTONES: editar (visual), mostrar/ocultar y eliminar */}
        <div
          data-section="acciones-servicio"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            className={`${ANIMACION_BOTON} flex items-center gap-1.5 rounded-xl bg-[#F6F6F6] px-3 py-2 text-sm font-medium text-[#0D0D0D] hover:bg-[#E8E8E8]`}
          >
            <Pencil size={14} />
            Editar
          </button>
          <button
            type="button"
            onClick={onCambiarVisibilidad}
            className={`${ANIMACION_BOTON} flex items-center gap-1.5 rounded-xl bg-[#F6F6F6] px-3 py-2 text-sm font-medium text-[#0D0D0D] hover:bg-[#E8E8E8]`}
          >
            {servicio.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
            {servicio.isVisible ? 'Ocultar' : 'Mostrar'}
          </button>

          <div className="min-w-0 flex-1" />

          {/* 03.5 CONFIRMACIÓN LOCAL DE ELIMINACIÓN */}
          {!confirmarEliminacion ? (
            <button
              type="button"
              onClick={() => setConfirmarEliminacion(true)}
              aria-label={`Eliminar servicio ${servicio.title}`}
              className={`${ANIMACION_BOTON} flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 hover:bg-red-100`}
            >
              <Trash2 size={15} className="text-red-500" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setConfirmarEliminacion(false)}
                className={`${ANIMACION_BOTON} rounded-xl bg-[#F0F0F0] px-3 py-2 text-xs font-medium text-[#737373] hover:bg-[#E8E8E8]`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onEliminar}
                className={`${ANIMACION_BOTON} rounded-xl bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600`}
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 03.6 INDICADOR DE VISIBILIDAD */}
      <footer
        data-section="estado-visibilidad"
        className={`flex items-center gap-1.5 border-t border-[#F0F0F0] px-4 py-2 text-xs ${
          servicio.isVisible ? 'text-green-600' : 'text-[#9E9E9E]'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            servicio.isVisible ? 'bg-green-500' : 'bg-[#C0C0C0]'
          }`}
        />
        {servicio.isVisible
          ? 'Visible en Explorar y tu perfil'
          : 'Oculto temporalmente'}
      </footer>
    </article>
  );
}

