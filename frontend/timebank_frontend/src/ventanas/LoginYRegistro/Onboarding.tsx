import { useEffect, useRef, useState } from 'react';
import { Camera, UserRound } from 'lucide-react';

// 01. DATOS DEL FORMULARIO (SOLO FRONTEND; NO CREA UNA CUENTA)
export interface DatosOnboarding {
  nombre: string;
  facultad: string;
  organizaciones: string[];
  biografia: string;
  intereses: string[];
  foto: File | null;
}

interface OnboardingProps {
  /** Se ejecuta tras completar los 3 pasos. La persistencia corresponde al backend. */
  onFinalizar: (datos: DatosOnboarding) => void;
  /** Acción cuando se omite el formulario; en el prototipo la define App. */
  onOmitir: () => void;
}

type PasoRegistro = {
  id: 'photo' | 'bio' | 'interests';
  label: string;
  titulo: string;
  descripcion: string;
};

const PASOS: PasoRegistro[] = [
  {
    id: 'photo',
    label: 'Foto y nombre',
    titulo: 'Cuéntanos quién eres',
    descripcion: 'Así te conocerán los demás miembros.',
  },
  {
    id: 'bio',
    label: 'Sobre ti',
    titulo: 'Sobre ti',
    descripcion: 'Una descripción corta de quién eres.',
  },
  {
    id: 'interests',
    label: 'Intereses',
    titulo: '¿Qué te interesa?',
    descripcion: 'Elige los temas que más te apasionan.',
  },
];

const FACULTADES = [
  'Ingeniería',
  'Administración',
  'Diseño',
  'Arquitectura',
  'Derecho',
  'Medicina',
  'Psicología',
  'Artes y Humanidades',
];

const ORGANIZACIONES = [
  'AIESEC',
  'IEEE',
  'Enactus',
  'Banda Universitaria',
  'Club de Fotografía',
  'Bienestar Uniandes',
  'Cruz Roja',
  'Debates Uniandes',
];

const INTERESES = [
  'Académico',
  'Idiomas',
  'Tecnología',
  'Diseño',
  'Deportes',
  'Música',
  'Arte',
  'Bienestar',
  'Fotografía',
  'Sostenibilidad',
  'Emprendimiento',
  'Voluntariado',
];

function alternarSeleccion(seleccion: string[], elemento: string): string[] {
  return seleccion.includes(elemento)
    ? seleccion.filter((item) => item !== elemento)
    : [...seleccion, elemento];
}

function ChipSeleccionable({
  texto,
  seleccionado,
  onClick,
}: {
  texto: string;
  seleccionado: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={seleccionado}
      onClick={onClick}
      className={
        'rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2 ' +
        (seleccionado
          ? 'border-[#3C9DA0] bg-[#E8F5F6] text-[#2D7B7E]'
          : 'border-[#E8E8E8] bg-white text-[#737373] hover:border-[#3C9DA0] hover:text-[#2D7B7E]')
      }
    >
      {texto}
    </button>
  );
}

// 02. VENTANA PÚBLICA DE REGISTRO EN 3 PASOS
export default function Onboarding({ onFinalizar, onOmitir }: OnboardingProps) {
  const [paso, setPaso] = useState(0);
  const [nombre, setNombre] = useState('');
  const [facultad, setFacultad] = useState('');
  const [organizaciones, setOrganizaciones] = useState<string[]>([]);
  const [biografia, setBiografia] = useState('');
  const [intereses, setIntereses] = useState<string[]>([]);
  const [foto, setFoto] = useState<File | null>(null);
  const [vistaFoto, setVistaFoto] = useState<string | null>(null);
  const [errorNombre, setErrorNombre] = useState('');
  const entradaFoto = useRef<HTMLInputElement>(null);

  // 02.1 PREVISUALIZACIÓN LOCAL DE LA FOTO (SIN SUBIRLA)
  useEffect(() => {
    if (!foto) {
      setVistaFoto(null);
      return;
    }

    const url = URL.createObjectURL(foto);
    setVistaFoto(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  const progreso = ((paso + 1) / PASOS.length) * 100;
  const pasoActual = PASOS[paso];

  function continuar() {
    if (paso === 0 && !nombre.trim()) {
      setErrorNombre('Escribe tu nombre para continuar.');
      return;
    }

    if (paso < PASOS.length - 1) {
      setPaso((actual) => actual + 1);
      // Cada paso comienza arriba en el scroll normal del navegador.
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    onFinalizar({
      nombre: nombre.trim(),
      facultad,
      organizaciones,
      biografia: biografia.trim(),
      intereses,
      foto,
    });
  }

  const iniciales = nombre.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toLocaleUpperCase('es'))
    .join('');

  return (
    <div className="min-h-dvh w-full bg-white">
      {/* Contenido alineado como las demás vistas, sin simular una pantalla móvil. */}
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
        {/* 03. ENCABEZADO Y PROGRESO */}
        <header className="px-5 pb-4 pt-8 sm:px-6 sm:pt-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="text-sm text-[#737373]">
              Paso {paso + 1} de {PASOS.length}
            </span>
            <button
              type="button"
              onClick={onOmitir}
              className="rounded-md px-1 text-sm font-medium text-[#3C9DA0] hover:text-[#2D8B8E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]"
            >
              Omitir
            </button>
          </div>

          <div
            role="progressbar"
            aria-label="Progreso del registro"
            aria-valuemin={0}
            aria-valuemax={PASOS.length}
            aria-valuenow={paso + 1}
            className="h-1.5 overflow-hidden rounded-full bg-[#E8E8E8]"
          >
            <div
              className="h-full rounded-full bg-[#3C9DA0] transition-all duration-300"
              style={{ width: `${progreso}%` }}
            />
          </div>

          <div className="mt-4">
            <h1
              className="text-2xl font-bold text-[#0D0D0D]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {pasoActual.titulo}
            </h1>
            <p className="mt-1 text-sm text-[#737373]">{pasoActual.descripcion}</p>
          </div>
        </header>

          {/* 04. CONTENIDO EN EL FLUJO NORMAL DE LA PÁGINA */}
        <div className="w-full flex-1 px-5 pb-8 sm:px-6">
          {paso === 0 && (
            <div className="space-y-5">
              {/* 04.1 FOTO DE PERFIL */}
              <div className="flex flex-col items-center py-4">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#3C9DA0]">
                    {vistaFoto ? (
                      <img
                        src={vistaFoto}
                        alt="Vista previa de tu foto de perfil"
                        className="h-full w-full object-cover"
                      />
                    ) : iniciales ? (
                      <span
                        className="text-3xl font-bold text-white"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                      >
                        {iniciales}
                      </span>
                    ) : (
                      <UserRound size={38} className="text-white" aria-hidden="true" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => entradaFoto.current?.click()}
                    aria-label="Agregar foto de perfil"
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#FFFF00] shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]"
                  >
                    <Camera size={15} className="text-[#0D0D0D]" aria-hidden="true" />
                  </button>
                  <input
                    ref={entradaFoto}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    aria-label="Seleccionar foto de perfil"
                    onChange={(evento) => setFoto(evento.target.files?.[0] ?? null)}
                  />
                </div>
                <p className="mt-2 text-xs text-[#737373]">Toca para agregar foto</p>
              </div>

              {/* 04.2 NOMBRE */}
              <div>
                <label
                  htmlFor="registro-nombre"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#737373]"
                >
                  Nombre completo
                </label>
                <input
                  id="registro-nombre"
                  autoComplete="name"
                  value={nombre}
                  onChange={(evento) => {
                    setNombre(evento.target.value);
                    if (errorNombre) setErrorNombre('');
                  }}
                  placeholder="Tu nombre y apellido"
                  aria-invalid={Boolean(errorNombre)}
                  aria-describedby={errorNombre ? 'error-registro-nombre' : undefined}
                  className="w-full rounded-xl border border-[#E8E8E8] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3C9DA0] focus:outline-none focus:ring-1 focus:ring-[#3C9DA0]"
                />
                {errorNombre && (
                  <p id="error-registro-nombre" role="alert" className="mt-1 text-xs text-red-600">
                    {errorNombre}
                  </p>
                )}
              </div>

              {/* 04.3 FACULTAD */}
              <div>
                <label
                  htmlFor="registro-facultad"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#737373]"
                >
                  Facultad
                </label>
                <select
                  id="registro-facultad"
                  value={facultad}
                  onChange={(evento) => setFacultad(evento.target.value)}
                  className="w-full rounded-xl border border-[#E8E8E8] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3C9DA0] focus:outline-none"
                >
                  <option value="">Selecciona tu facultad</option>
                  {FACULTADES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* 04.4 ORGANIZACIONES */}
              <fieldset>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#737373]">
                  Organizaciones o grupos universitarios
                </legend>
                <div className="flex flex-wrap gap-2">
                  {ORGANIZACIONES.map((organizacion) => (
                    <ChipSeleccionable
                      key={organizacion}
                      texto={organizacion}
                      seleccionado={organizaciones.includes(organizacion)}
                      onClick={() =>
                        setOrganizaciones((actual) => alternarSeleccion(actual, organizacion))
                      }
                    />
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {paso === 1 && (
            <div>
              <label
                htmlFor="registro-biografia"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#737373]"
              >
                Descripción
              </label>
              <textarea
                id="registro-biografia"
                value={biografia}
                onChange={(evento) => setBiografia(evento.target.value)}
                maxLength={200}
                placeholder="Cuéntanos un poco sobre ti, qué estudias, qué te apasiona…"
                rows={5}
                className="w-full resize-none rounded-xl border border-[#E8E8E8] bg-white px-4 py-3 text-sm text-[#0D0D0D] focus:border-[#3C9DA0] focus:outline-none focus:ring-1 focus:ring-[#3C9DA0]"
              />
              <p className="mt-1 text-xs text-[#737373]">{biografia.length}/200 caracteres</p>
            </div>
          )}

          {paso === 2 && (
            <div>
              <fieldset>
                <legend className="sr-only">Selecciona tus intereses</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {INTERESES.map((interes) => (
                    <ChipSeleccionable
                      key={interes}
                      texto={interes}
                      seleccionado={intereses.includes(interes)}
                      onClick={() => setIntereses((actual) => alternarSeleccion(actual, interes))}
                    />
                  ))}
                </div>
              </fieldset>
              {intereses.length > 0 && (
                <p className="mt-4 text-xs text-[#737373]">
                  {intereses.length} {intereses.length === 1 ? 'interés seleccionado' : 'intereses seleccionados'}
                </p>
              )}
            </div>
          )}
        </div>

          {/* 05. PIE EN EL FLUJO NORMAL: EL SCROLL ES DEL NAVEGADOR */}
        <footer className="border-t border-[#E8E8E8] bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={continuar}
            className="w-full rounded-2xl bg-[#3C9DA0] py-4 text-base font-bold text-white transition-colors hover:bg-[#2D8B8E] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {paso < PASOS.length - 1 ? 'Continuar' : 'Explorar el Banco de Tiempo'}
          </button>
        </footer>
      </div>
    </div>
  );
}
