import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

import MiembroCard from '../componentes/miembros/MiembroCard';
import ServicioCard from '../componentes/servicios/ServicioCard';
import PostAyuda from '../componentes/posts/PostAyuda';

import type { PerfilMiembroAPI } from '../api/perfilesMiembro.api';

//Llamados al API
import { buscarMiembros } from '../api/perfilesMiembro.api';
import { buscarServicios, type ResultadoServicioAPI } from '../api/serviciosOfrecidos.api';
import { buscarPostsAyuda, type PostAyudaAPI } from '../api/postsAyuda.api';

/**
 * VISTA: Explorar miembros, solicitudes, servicios y actividades.
 *
 * - Reutiliza MiembroCard, PostAyuda y ServicioCard.
 * - Miembros: consulta real de GET /buscar/miembros.
 * - Solicitudes: GET /buscar/posts-ayuda?tipo=solicitud.
 * - Servicios: GET /buscar/servicios (ofrecimientos y servicios de organizaciones).
 * - Las acciones de navegación se reciben como propiedades desde App.tsx.
 * - La pestaña Actividades queda preparada hasta definir su modelo y sus datos.
 *
 * Ubicación: src/ventanas/Explorar.tsx
 */

// ────────────────────── 00. TIPOS Y CONSTANTES ──────────────────────
type PestanaExplorar = 'Miembros' | 'Solicitudes' | 'Servicios' | 'Actividades';

const PESTANAS: PestanaExplorar[] = [
  'Miembros',
  'Solicitudes',
  'Servicios',
  'Actividades',
];

export interface ExplorarProps {
  onVerPerfil?: (miembroId: string) => void;
  onVerDetallePost?: (postId: string) => void;
  onGuardarPost?: (postId: string) => void;
  onCompartirPost?: (postId: string) => void;
}

// ────────────────────── 00.1 ESTADO VACÍO REUTILIZABLE ──────────────────────
function EstadoVacio({ mensaje }: { mensaje: string }) {
  return (
    <div className="py-16 text-center" role="status">
      <Search size={48} strokeWidth={1.5} className="mx-auto mb-3 text-[#E8E8E8]" aria-hidden="true" />
      <p className="text-sm font-medium text-[#737373]">{mensaje}</p>
    </div>
  );
}

// ────────────────────── 01. COMPONENTE PRINCIPAL ──────────────────────
export default function Explorar({
  onVerPerfil,
  onVerDetallePost,
  onGuardarPost,
  onCompartirPost,
}: ExplorarProps) {
  // 01.1 BÚSQUEDA Y PESTAÑAS
  const [busqueda, setBusqueda] = useState('');
  const [pestanaActiva, setPestanaActiva] = useState<PestanaExplorar>('Miembros');

  // 01.2 PERFILES: GET /api/v1/perfiles-miembro
  const [perfiles, setPerfiles] = useState<PerfilMiembroAPI[]>([]);
  const [cargandoPerfiles, setCargandoPerfiles] = useState(true);
  const [errorPerfiles, setErrorPerfiles] = useState<string | null>(null);
  const [numeroConsulta, setNumeroConsulta] = useState(0);

  // 01.2.1 Efecto para buscar miembros cuando la pestaña activa es "Miembros" y la búsqueda cambia
  useEffect(() => {
    if (pestanaActiva !== 'Miembros') return;

    let vigente = true;

    setCargandoPerfiles(true);
    setErrorPerfiles(null);

    const temporizador = window.setTimeout(() => {
      void buscarMiembros(busqueda.trim())
        .then((respuesta) => {
          if (vigente) {
            setPerfiles(respuesta);
          }
        })
        .catch((error: unknown) => {
          if (!vigente) return;

          setErrorPerfiles(
            error instanceof Error
              ? error.message
              : 'No se pudieron consultar los perfiles.'
          );
        })
        .finally(() => {
          if (vigente) {
            setCargandoPerfiles(false);
          }
        });
    }, 300);

    return () => {
      vigente = false;
      window.clearTimeout(temporizador);
    };
  }, [busqueda, pestanaActiva, numeroConsulta]);

  // 01.3 SERVICIOS: GET /api/v1/buscar/servicios
  const [servicios, setServicios] = useState<ResultadoServicioAPI[]>([]);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [errorServicios, setErrorServicios] = useState<string | null>(null);
  const [reintentoServicios, setReintentoServicios] = useState(0);

  // 01.3.1 Efecto para buscar servicios cuando la pestaña activa es "Servicios" y la búsqueda cambia

  useEffect(() => {
    if (pestanaActiva !== 'Servicios') return;

    let vigente = true;
    setCargandoServicios(true);
    setErrorServicios(null);

    const temporizador = window.setTimeout(() => {
      void buscarServicios(busqueda)
        .then((respuesta) => {
          if (vigente) setServicios(respuesta);
        })
        .catch((error: unknown) => {
          if (vigente) {
            setErrorServicios(
              error instanceof Error
                ? error.message
                : 'No se pudieron consultar los servicios.'
            );
          }
        })
        .finally(() => {
          if (vigente) setCargandoServicios(false);
        });
    }, 300);

    return () => {
      vigente = false;
      window.clearTimeout(temporizador);
    };
  }, [pestanaActiva, busqueda, reintentoServicios]);


  // 01.4 SOLICITUDES DE AYUDA: GET /api/v1/buscar/posts-ayuda
  const [solicitudes, setSolicitudes] = useState<PostAyudaAPI[]>([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(false);
  const [errorSolicitudes, setErrorSolicitudes] = useState<string | null>(null);
  const [reintentoSolicitudes, setReintentoSolicitudes] = useState(0);

  
  useEffect(() => {
    // Consultar solamente cuando estamos en Solicitudes
    if (pestanaActiva !== 'Solicitudes') return;

    let vigente = true;

    setCargandoSolicitudes(true);
    setErrorSolicitudes(null);

    const temporizador = window.setTimeout(() => {
      void buscarPostsAyuda(busqueda.trim(), 'solicitud')
        .then((respuesta) => {
          if (vigente) {
            setSolicitudes(respuesta);
          }
        })
        .catch((error: unknown) => {
          if (vigente) {
            setErrorSolicitudes(
              error instanceof Error
                ? error.message
                : 'No se pudieron cargar las solicitudes.'
            );
          }
        })
        .finally(() => {
          if (vigente) {
            setCargandoSolicitudes(false);
          }
        });
    }, 300);

    return () => {
      vigente = false;
      window.clearTimeout(temporizador);
    };
  }, [pestanaActiva, busqueda, reintentoSolicitudes]);


  return (
    <div className="min-h-screen min-w-0 bg-white" data-section="explorar">
      {/* 02. ENCABEZADO: título, buscador y pestañas */}
      <header
        data-section="encabezado-explorar"
        className="sticky top-0 z-30 min-w-0 border-b border-[#E8E8E8] bg-white px-4 pb-0 pt-3 lg:pt-6"
      >
        <div className="mx-auto max-w-2xl min-w-0">
          <h1
            className="mb-3 text-2xl font-bold text-[#0D0D0D]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Explorar
          </h1>

          {/* 02.1 BUSCADOR: comparte la búsqueda entre pestañas */}
          <div className="relative mb-3" data-section="buscador-explorar">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar personas, habilidades o ayuda…"
              aria-label="Buscar en Explorar"
              className="w-full min-w-0 rounded-2xl border border-transparent bg-[#F6F6F6] py-3 pl-11 pr-11 text-sm text-[#0D0D0D] placeholder:text-[#9E9E9E] outline-none transition-[background-color,border-color] focus:border-[#3C9DA0] focus:bg-white"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#9E9E9E] transition-colors hover:bg-[#E8E8E8] hover:text-[#0D0D0D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* 02.2 PESTAÑAS: desplazables en pantallas estrechas */}
          <nav
            aria-label="Categorías de exploración"
            data-section="pestanas-explorar"
            className="-mb-px flex min-w-0 overflow-x-auto border-b border-[#E8E8E8]"
          >
            {PESTANAS.map((pestana) => {
              const activa = pestanaActiva === pestana;
              return (
                <button
                  key={pestana}
                  type="button"
                  onClick={() => setPestanaActiva(pestana)}
                  aria-current={activa ? 'page' : undefined}
                  className={`relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors sm:flex-1 sm:px-2 ${
                    activa ? 'text-[#3C9DA0]' : 'text-[#9E9E9E] hover:text-[#737373]'
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3C9DA0]`}
                >
                  {pestana}
                  {activa && (
                    <span
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full bg-[#3C9DA0]"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 03. CONTENIDO DE LA PESTAÑA ACTIVA */}
      <main className="mx-auto w-full max-w-2xl min-w-0 space-y-3 px-4 py-4" data-section="resultados-explorar">
        {/* 03.1 MIEMBROS */}
        {pestanaActiva === 'Miembros' && (
          <section aria-label="Miembros" className="space-y-3">
            {cargandoPerfiles ? (
              <p role="status" className="py-16 text-center text-sm text-[#737373]">
                Cargando miembros desde el backend…
              </p>
            ) : errorPerfiles ? (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center">
                <p className="text-sm font-medium text-red-700">No pudimos cargar los miembros.</p>
                <p className="mt-1 text-xs text-red-700">{errorPerfiles}</p>
                <button
                  type="button"
                  onClick={() => setNumeroConsulta((actual) => actual + 1)}
                  className="mt-3 rounded-xl bg-[#3C9DA0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2D8B8E]"
                >
                  Reintentar
                </button>
              </div>
            ) : perfiles.length === 0 ? (
              <EstadoVacio mensaje="No encontramos miembros. Prueba con otra búsqueda." />
            ) : (
              perfiles.map((perfil) => (
                <MiembroCard key={perfil.id} miembro={perfil} onVerPerfil={onVerPerfil} habilitarDetalle={Boolean(onVerPerfil)}/>
              ))
            )}
          </section>
        )}

        {/* 03.2 SOLICITUDES DE AYUDA */}
          {pestanaActiva === 'Solicitudes' && (
            <section
              aria-label="Solicitudes de ayuda"
              className="space-y-3"
            >
              {cargandoSolicitudes ? (
                <p
                  role="status"
                  className="py-16 text-center text-sm text-[#737373]"
                >
                  Cargando solicitudes...
                </p>
              ) : errorSolicitudes ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center"
                >
                  <p className="text-sm text-red-700">
                    {errorSolicitudes}
                  </p>

                  <button
                    type="button"
                    onClick={() => setReintentoSolicitudes((n) => n + 1)}
                    className="mt-3 rounded-xl bg-[#3C9DA0] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Reintentar
                  </button>
                </div>
              ) : solicitudes.length === 0 ? (
                <EstadoVacio
                  mensaje="No encontramos solicitudes. Prueba con otra búsqueda."
                />
              ) : (
                solicitudes.map((post) => (
                  <PostAyuda
                    key={post.id}
                    post={post}
                    onVerDetalle={onVerDetallePost}
                    onVerAutor={onVerPerfil}
                    onGuardar={onGuardarPost}
                    onCompartir={onCompartirPost}
                  />
                ))
              )}
            </section>
          )}

        {/* 03.3 SERVICIOS DEL CATÁLOGO */}
        {pestanaActiva === 'Servicios' && (
          <section aria-label="Servicios" className="space-y-3">
            {cargandoServicios ? (
              <p>Cargando servicios...</p>
            ) : errorServicios ? (
              <p>{errorServicios}</p>
            ) : servicios.length === 0 ? (
              <EstadoVacio mensaje="No encontramos servicios." />
            ) : (
              servicios.map((servicio) => (
                <ServicioCard
                  key={servicio.id}
                  servicio={servicio}
                  onVerPerfil={onVerPerfil}
                  onVerDetallePost={onVerDetallePost}
                />
              ))
            )}
          </section>
        )}

        {/* 03.4 ACTIVIDADES: pendientes de modelo y mocks compartidos */}
        {pestanaActiva === 'Actividades' && (
          <section aria-label="Actividades">
            <EstadoVacio mensaje="Próximamente podrás explorar actividades de la comunidad." />
          </section>
        )}
      </main>
    </div>
  );
}
