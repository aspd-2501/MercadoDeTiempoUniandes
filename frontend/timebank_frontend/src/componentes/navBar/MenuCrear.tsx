import { useEffect } from 'react';
import { Heart, Star, TriangleAlert, type LucideIcon } from 'lucide-react';

// 00. TIPOS Y OPCIONES DEL MENÚ
// Estas acciones son identificadores de interfaz, no rutas de navegación.
export type AccionMenuCrear =
  | 'pedir-ayuda'
  | 'ofrecer-ayuda'
  | 'gestionar-servicios'
  | 'compartir-experiencia';

interface MenuCrearProps {
  onClose: () => void;
  onSelect?: (accion: AccionMenuCrear) => void;
}

interface OpcionCrear {
  id: AccionMenuCrear;
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
  clasesIcono: string;
  clasesColorIcono: string;
  clasesHover: string;
  distintivo?: {
    texto: string;
    clases: string;
  };
}

const OPCIONES_CREAR: OpcionCrear[] = [
  {
    id: 'pedir-ayuda',
    titulo: 'Pedir ayuda',
    descripcion: 'Publica lo que necesitas y la comunidad te ayuda',
    icono: TriangleAlert,
    clasesIcono: 'bg-[#E8F5F6]',
    clasesColorIcono: 'text-[#3C9DA0]',
    clasesHover: 'hover:bg-[#E8F5F6]',
    distintivo: {
      texto: 'Pide ayuda',
      clases: 'bg-[#E8F5F6] text-[#3C9DA0]',
    },
  },
  {
    id: 'ofrecer-ayuda',
    titulo: 'Ofrecer ayuda',
    descripcion: 'Publica lo que puedes hacer y otros se unen',
    icono: Star,
    clasesIcono: 'bg-[#FFFDE7]',
    clasesColorIcono: 'text-[#F57F17]',
    clasesHover: 'hover:bg-[#FFFDE7]',
    distintivo: {
      texto: 'Ofrece ayuda',
      clases: 'bg-[#FFFF00] text-[#0D0D0D]',
    },
  },
  {
    id: 'gestionar-servicios',
    titulo: 'Gestionar mis servicios',
    descripcion: 'Agrega o edita servicios en tu perfil',
    icono: Star,
    clasesIcono: 'bg-[#3C9DA0]',
    clasesColorIcono: 'text-white',
    clasesHover: 'hover:bg-[#E8F5F6]',
  },
  {
    id: 'compartir-experiencia',
    titulo: 'Compartir experiencia',
    descripcion: 'Celebra un intercambio completado con la comunidad',
    icono: Heart,
    clasesIcono: 'bg-[#0D0D0D]',
    clasesColorIcono: 'text-white',
    clasesHover: 'hover:bg-[#E8F5F6]',
  },
];

const BUTTON_FEEDBACK =
  'cursor-pointer transition-[transform,background-color,box-shadow] duration-200 ease-out ' +
  'motion-safe:active:scale-[0.98] focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2 ' +
  'motion-reduce:transition-none';

// 01. COMPONENTE PRINCIPAL: MENÚ DEL BOTÓN CREAR
// Se muestra como una hoja inferior en móvil y como un diálogo centrado en escritorio.
export default function MenuCrear({ onClose, onSelect }: MenuCrearProps) {
  // 01.1 CERRAR CON LA TECLA ESCAPE
  useEffect(() => {
    function manejarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', manejarTecla);
    return () => document.removeEventListener('keydown', manejarTecla);
  }, [onClose]);

  // 01.2 ELECCIÓN VISUAL: sin navegación ni lógica de negocio todavía
  function seleccionarOpcion(accion: AccionMenuCrear) {
    onSelect?.(accion);
    onClose();
  }

  return (
    <div
      data-section="menu-crear"
      className="fixed inset-0 z-50 flex items-end justify-center lg:items-center"
    >
      {/* 01.3 FONDO OSCURECIDO: pulsarlo cierra el menú */}
      <button
        type="button"
        aria-label="Cerrar menú Crear"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-[#0D0D0D]/50"
      />

      {/* 01.4 PANEL DEL MENÚ */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-crear-titulo"
        data-section="panel-menu-crear"
        className="menu-crear-panel relative w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl lg:rounded-2xl"
      >
        {/* Indicador visual de hoja inferior, visible solamente en móvil */}
        <div
          aria-hidden="true"
          className="mx-auto h-1 w-12 rounded-full bg-[#D0D0D0] lg:hidden"
        />

        {/* 01.5 TÍTULO */}
        <header data-section="encabezado-menu-crear">
          <h2
            id="menu-crear-titulo"
            className="mb-5 mt-4 text-lg font-bold text-[#0D0D0D]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            ¿Qué quieres hacer?
          </h2>
        </header>

        {/* 01.6 OPCIONES: Pedir ayuda, Ofrecer ayuda, Servicios y Experiencia */}
        <div data-section="opciones-menu-crear" className="space-y-3">
          {OPCIONES_CREAR.map((opcion) => {
            const Icono = opcion.icono;

            return (
              <button
                key={opcion.id}
                type="button"
                data-section={`opcion-${opcion.id}`}
                onClick={() => seleccionarOpcion(opcion.id)}
                className={`group flex w-full items-center gap-4 rounded-2xl bg-[#F6F6F6] p-4 text-left ${BUTTON_FEEDBACK} ${opcion.clasesHover}`}
              >
                {/* Ícono de la opción */}
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${opcion.clasesIcono}`}
                >
                  <Icono
                    size={22}
                    className={opcion.clasesColorIcono}
                    aria-hidden="true"
                  />
                </span>

                {/* Título, distintivo y descripción */}
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-sm font-semibold text-[#0D0D0D]"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {opcion.titulo}
                    </span>

                    {opcion.distintivo && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${opcion.distintivo.clases}`}
                      >
                        {opcion.distintivo.texto}
                      </span>
                    )}
                  </span>

                  <span className="mt-0.5 block text-xs text-[#737373]">
                    {opcion.descripcion}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* 01.7 BOTÓN CANCELAR */}
        <footer data-section="cancelar-menu-crear">
          <button
            type="button"
            onClick={onClose}
            className={`mt-4 w-full rounded-xl py-3 text-sm font-medium text-[#737373] hover:bg-[#F6F6F6] ${BUTTON_FEEDBACK}`}
          >
            Cancelar
          </button>
        </footer>
      </section>

      {/* 01.8 ANIMACIÓN DE ENTRADA DEL PANEL (independiente del CSS global) */}
      <style>{`
        @keyframes menu-crear-entrada-movil {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes menu-crear-entrada-escritorio {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .menu-crear-panel {
            animation: menu-crear-entrada-movil 220ms ease-out both;
          }
          @media (min-width: 1024px) {
            .menu-crear-panel {
              animation: menu-crear-entrada-escritorio 180ms ease-out both;
            }
          }
        }
      `}</style>
    </div>
  );
}
