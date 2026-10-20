import { useState } from 'react';
import { Search, X } from 'lucide-react';

import MiembroCard from '../componentes/miembros/MiembroCard';
import ServicioCard from '../componentes/servicios/ServicioCard';
import PostAyuda from '../componentes/posts/PostAyuda';

import { useMiembroSesion } from '../contextos/MiembroSesionContext';
import { MIEMBROS_DEMO } from '../mocks/miembros.mocks';
import { PUBLICACIONES_DEMO } from '../mocks/postsAyuda.mocks';
import { SERVICIOS_DEMO } from '../mocks/servicios.mocks';

/**
 * VISTA: Explorar miembros, solicitudes, servicios y actividades.
 *
 * - Reutiliza MiembroCard, PostAyuda y ServicioCard.
 * - Los datos provienen de los mocks compartidos; no se duplican aquí.
 * - El miembro autenticado se obtiene del contexto de sesión.
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
  // 01.1 MIEMBRO AUTENTICADO
  const { miembro } = useMiembroSesion();

  // 01.2 ESTADOS LOCALES DE BÚSQUEDA Y PESTAÑAS
  const [busqueda, setBusqueda] = useState('');
  const [pestanaActiva, setPestanaActiva] = useState<PestanaExplorar>('Miembros');
  const termino = busqueda.trim().toLocaleLowerCase();

  // 01.3 MIEMBROS: excluir al miembro autenticado y buscar por perfil
  const miembrosFiltrados = Object.values(MIEMBROS_DEMO).filter((otroMiembro) => {
    if (otroMiembro.id === miembro.id) return false;
    if (!termino) return true;

    return (
      otroMiembro.name.toLocaleLowerCase().includes(termino) ||
      (otroMiembro.skills ?? []).some((habilidad) =>
        habilidad.toLocaleLowerCase().includes(termino),
      ) ||
      (otroMiembro.bio ?? '').toLocaleLowerCase().includes(termino) ||
      (otroMiembro.faculty ?? '').toLocaleLowerCase().includes(termino)
    );
  });

  // 01.4 SOLICITUDES: solo peticiones de ayuda, no ofrecimientos
  const solicitudesFiltradas = PUBLICACIONES_DEMO.filter((post) => {
    if (post.type !== 'help-request' || !MIEMBROS_DEMO[post.userId]) return false;
    if (!termino) return true;

    return (
      post.title.toLocaleLowerCase().includes(termino) ||
      post.description.toLocaleLowerCase().includes(termino) ||
      post.category.toLocaleLowerCase().includes(termino)
    );
  });

  // 01.5 SERVICIOS: solo los visibles y con un proveedor existente
  const serviciosFiltrados = SERVICIOS_DEMO.filter((servicio) => {
    if (!servicio.isVisible || !MIEMBROS_DEMO[servicio.userId]) return false;
    if (!termino) return true;

    return (
      servicio.title.toLocaleLowerCase().includes(termino) ||
      servicio.description.toLocaleLowerCase().includes(termino) ||
      servicio.category.toLocaleLowerCase().includes(termino)
    );
  });

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
            {miembrosFiltrados.length === 0 ? (
              <EstadoVacio mensaje="No encontramos miembros. Prueba con otra habilidad." />
            ) : (
              miembrosFiltrados.map((otroMiembro) => (
                <MiembroCard
                  key={otroMiembro.id}
                  miembro={otroMiembro}
                  onVerPerfil={onVerPerfil}
                />
              ))
            )}
          </section>
        )}

        {/* 03.2 SOLICITUDES DE AYUDA */}
        {pestanaActiva === 'Solicitudes' && (
          <section aria-label="Solicitudes de ayuda" className="space-y-3">
            {solicitudesFiltradas.length === 0 ? (
              <EstadoVacio mensaje="No encontramos solicitudes. Prueba con otra búsqueda." />
            ) : (
              solicitudesFiltradas.map((post) => {
                const autor = MIEMBROS_DEMO[post.userId];
                if (!autor) return null;

                return (
                  <PostAyuda
                    key={post.id}
                    post={post}
                    autor={autor}
                    onVerDetalle={onVerDetallePost}
                    onVerAutor={onVerPerfil}
                    onGuardar={onGuardarPost}
                    onCompartir={onCompartirPost}
                  />
                );
              })
            )}
          </section>
        )}

        {/* 03.3 SERVICIOS DEL CATÁLOGO */}
        {pestanaActiva === 'Servicios' && (
          <section aria-label="Servicios" className="space-y-3">
            {serviciosFiltrados.length === 0 ? (
              <EstadoVacio mensaje="No encontramos servicios. Prueba con otro término." />
            ) : (
              serviciosFiltrados.map((servicio) => {
                const proveedor = MIEMBROS_DEMO[servicio.userId];
                if (!proveedor) return null;

                return (
                  <ServicioCard
                    key={servicio.id}
                    servicio={servicio}
                    proveedor={proveedor}
                    onVerPerfil={onVerPerfil}
                  />
                );
              })
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
