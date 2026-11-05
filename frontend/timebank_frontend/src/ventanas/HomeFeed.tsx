import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, Bell, Clock3, Heart, Inbox, Plus } from 'lucide-react';
import PostAyuda from '../componentes/posts/PostAyuda';
import { obtenerPostAyuda, type PostAyudaAPI } from '../api/postsAyuda.api';
import {
  obtenerFeed,
  type PublicacionFeedAPI,
} from '../api/feed.api';

/**
 * VENTANA: Home / feed de publicaciones del Banco de Tiempo.
 * Consulta NestJS GET /feed y reutiliza PostAyuda para entradas POST_AYUDA.
 * Mantiene la tarjeta de saldo demo hasta integrar el login/contexto real.
 * No aplica filtros de búsqueda o categorías. La visibilidad y relevancia
 * de las publicaciones se resuelven en el backend; se mantiene la paginación.
 */

// ─────────────────── 00. MODELOS Y PROPIEDADES ───────────────────
export interface MiembroHome {
  id: string;
  firstName: string;
  faculty: string;
  balance: number;
  initials: string;
  avatar?: string;
}

export interface HomeFeedProps {
  miembro?: MiembroHome;
  /** UUID del perfil real autenticado. Omitir mientras la sesión sea mock. */
  perfilId?: string;
  notificacionesPendientes?: number;
  /** Acciones opcionales: se conectarán a la navegación en otra etapa. */
  onNotificaciones?: () => void;
  onVerPerfil?: () => void;
  onVerMovimientos?: () => void;
  onDonarHoras?: () => void;
  onPedirHoras?: () => void;
  onVerDetallePost?: (postId: string) => void;
  onVerAutorPost?: (miembroId: string) => void;
  onGuardarPost?: (postId: string) => void;
  onCompartirPost?: (postId: string) => void;
}

// ─────────────────── 00.1 SALDO DEMO (se migrará al conectar autenticación) ──────────
const MIEMBRO_DEMO: MiembroHome = {
  id: 'miembro-demo-1',
  firstName: 'María',
  faculty: 'Facultad de Ingeniería',
  balance: 8,
  initials: 'ML',
};

/** Un elemento del feed y, solo cuando aplica, su detalle de ayuda. */
interface EntradaFeed {
  publicacion: PublicacionFeedAPI;
  detalleAyuda: PostAyudaAPI | null;
}

/**
 * El feed devuelve solo el resumen común. Para reutilizar PostAyuda y mostrar
 * horas/cupo reales (que no vienen en /feed), consultamos el detalle por UUID.
 * Si una consulta individual falla, conservamos el resumen original del feed.
 */
async function completarEntradas(publicaciones: PublicacionFeedAPI[]): Promise<EntradaFeed[]> {
  return Promise.all(publicaciones.map(async (publicacion) => {
    if (publicacion.tipo !== 'POST_AYUDA') {
      return { publicacion, detalleAyuda: null };
    }
    try {
      const detalleAyuda = await obtenerPostAyuda(publicacion.id);
      return { publicacion, detalleAyuda };
    } catch {
      return { publicacion, detalleAyuda: null };
    }
  }));
}

// ─────────────────── 00.3 ESTILOS DE INTERACCIÓN ───────────────────
const ANIMACION_BOTON =
  'cursor-pointer transition-[transform,background-color,color,box-shadow] duration-200 ease-out ' +
  'motion-safe:active:scale-[0.96] focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2 ' +
  'motion-reduce:transition-none';

// ─────────────────── 01. VENTANA HOME ───────────────────
export default function HomeFeed({
  miembro = MIEMBRO_DEMO,
  perfilId,
  notificacionesPendientes = 3,
  onNotificaciones,
  onVerPerfil,
  onVerMovimientos,
  onDonarHoras,
  onPedirHoras,
  onVerDetallePost,
  onVerAutorPost,
  onGuardarPost,
  onCompartirPost,
}: HomeFeedProps) {
  // 01.2 DATOS Y ESTADOS DEL FEED REAL
  const [entradas, setEntradas] = useState<EntradaFeed[]>([]);
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorMas, setErrorMas] = useState<string | null>(null);
  const [reintento, setReintento] = useState(0);
  const versionConsulta = useRef(0);
  // Elemento que detecta cuándo nos acercamos al final del feed.
  const marcadorFinalRef = useRef<HTMLDivElement | null>(null);
  // Evita peticiones duplicadas si el marcador sigue siendo visible.
  const cargaMasEnCursoRef = useRef(false);

  // 01.4 PRIMERA PÁGINA: GET /feed sin búsqueda ni filtros de categoría
  useEffect(() => {
    const version = ++versionConsulta.current;
    cargaMasEnCursoRef.current = false;
    setCargando(true);
    setError(null);
    setErrorMas(null);
    setEntradas([]);
    setPagina(1);
    setHayMas(false);
    setCargandoMas(false);

    void (async () => {
      try {
        const respuesta = await obtenerFeed({
          perfilId,
          pagina: 1,
          tamano: 10,
        });
        const completas = await completarEntradas(respuesta.publicaciones);
        if (version !== versionConsulta.current) return;
        setEntradas(completas);
        setPagina(respuesta.pagina);
        setHayMas(respuesta.hayMas);
      } catch (excepcion: unknown) {
        if (version !== versionConsulta.current) return;
        setError(excepcion instanceof Error ? excepcion.message : 'No se pudo cargar el feed.');
      } finally {
        if (version === versionConsulta.current) setCargando(false);
      }
    })();
  }, [perfilId, reintento]);

  // 01.5 PÁGINAS POSTERIORES: se cargan en segundo plano al acercarnos al final.
  const cargarMas = useCallback(async () => {
    if (cargando || cargandoMas || cargaMasEnCursoRef.current || !hayMas) return;
    cargaMasEnCursoRef.current = true;
    const version = versionConsulta.current;
    setCargandoMas(true);
    setErrorMas(null);
    try {
      const respuesta = await obtenerFeed({
        perfilId,
        pagina: pagina + 1,
        tamano: 10,
      });
      const completas = await completarEntradas(respuesta.publicaciones);
      // Si se inició otra consulta del feed, ignorar resultados anteriores.
      if (version !== versionConsulta.current) return;
      setEntradas((anteriores) => [...anteriores, ...completas]);
      setPagina(respuesta.pagina);
      setHayMas(respuesta.hayMas);
    } catch (excepcion: unknown) {
      if (version !== versionConsulta.current) return;
      setErrorMas(excepcion instanceof Error ? excepcion.message : 'No se pudieron cargar más publicaciones.');
    } finally {
      if (version === versionConsulta.current) {
        cargaMasEnCursoRef.current = false;
        setCargandoMas(false);
      }
    }
  }, [cargando, cargandoMas, hayMas, pagina, perfilId]);

  // 01.6 SCROLL INFINITO: observa el documento, no crea un scroll interno.
  useEffect(() => {
    const marcador = marcadorFinalRef.current;
    if (!marcador || !hayMas || cargando || cargandoMas || error || errorMas) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) void cargarMas();
      },
      {
        root: null, // El scroll del navegador es el que manda.
        rootMargin: '0px 0px 320px 0px', // Precarga antes de llegar al final.
        threshold: 0,
      },
    );

    observador.observe(marcador);
    return () => observador.disconnect();
  }, [cargarMas, hayMas, cargando, cargandoMas, error, errorMas]);

  return (
    <div data-section="ventana-home" className="min-h-screen min-w-0 bg-[#F6F6F6]">
      {/* 02. ENCABEZADO: identidad y accesos, sin buscador ni categorías */}
      <header
        data-section="encabezado-home"
        className="sticky top-0 z-30 bg-white px-4 pb-3 pt-3 shadow-[0_1px_0_#E8E8E8] lg:pt-4 lg:pb-4"
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3C9DA0] lg:hidden">
              <span
                className="text-xs font-bold text-[#FFFF00]"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                BT
              </span>
            </div>
            <span
              className="text-base font-bold text-[#0D0D0D]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Inicio
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 02.1 NOTIFICACIONES */}
            <button
              type="button"
              onClick={onNotificaciones}
              aria-label={`Notificaciones${notificacionesPendientes ? `: ${notificacionesPendientes} pendientes` : ''}`}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F6F6] hover:bg-[#E8F5F6] ${ANIMACION_BOTON}`}
            >
              <Bell size={20} className="text-[#0D0D0D]" aria-hidden="true" />
              {notificacionesPendientes > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3C9DA0] px-0.5 text-[9px] font-bold text-white">
                  {notificacionesPendientes > 9 ? '9+' : notificacionesPendientes}
                </span>
              )}
            </button>

            {/* 02.2 ACCESO AL PERFIL */}
            <button
              type="button"
              onClick={onVerPerfil}
              aria-label="Abrir mi perfil"
              className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#3C9DA0] hover:opacity-90 ${ANIMACION_BOTON}`}
            >
              {miembro.avatar ? (
                <img src={miembro.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span
                  className="text-sm font-bold text-white"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {miembro.initials}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 03. CONTENIDO PRINCIPAL DEL FEED */}
      <div data-section="contenido-home" className="mx-auto max-w-2xl space-y-3 px-4 py-4">
        {/* 03.1 TARJETA DE SALDO: componente interno, extraíble en el futuro */}
        <BalanceCard
          miembro={miembro}
          onVerMovimientos={onVerMovimientos}
          onDonarHoras={onDonarHoras}
          onPedirHoras={onPedirHoras}
        />

        {/* 03.2 PUBLICACIONES DEL FEED (ayuda, comunitarias y causas) */}
        <section data-section="publicaciones-home" aria-label="Publicaciones recientes" className="space-y-3">
          {cargando && (
            <p role="status" className="py-12 text-center text-sm text-[#737373]">Cargando publicaciones…</p>
          )}

          {!cargando && error && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
              <p className="text-sm text-red-700">{error}</p>
              <button type="button" onClick={() => setReintento((n) => n + 1)}
                className="mt-3 rounded-xl bg-[#3C9DA0] px-4 py-2 text-sm font-semibold text-white">
                Reintentar
              </button>
            </div>
          )}

          {!cargando && !error && entradas.map(({ publicacion, detalleAyuda }) => {
            // Reutilizamos la tarjeta existente sin adaptar ni inventar horas/cupos.
            if (publicacion.tipo === 'POST_AYUDA' && detalleAyuda) {
              return (
                <PostAyuda
                  key={`${publicacion.tipo}-${publicacion.id}`}
                  post={detalleAyuda}
                  categoriasFeed={publicacion.categorias}
                  onVerDetalle={onVerDetallePost}
                  onVerAutor={onVerAutorPost}
                  onGuardar={onGuardarPost}
                  onCompartir={onCompartirPost}
                />
              );
            }

            // El feed puede incluir otras entidades. No las transformamos en posts
            // de ayuda, ni inventamos para ellas un botón «Quiero ayudar».
            const etiqueta = publicacion.tipo === 'POST_COMUNITARIO'
              ? 'Publicación comunitaria'
              : publicacion.tipo === 'CAUSA'
                ? 'Causa'
                : 'Publicación de ayuda';
            const fecha = new Date(publicacion.fecha);
            const fechaTexto = Number.isNaN(fecha.getTime())
              ? ''
              : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(fecha);
            return (
              <article key={`${publicacion.tipo}-${publicacion.id}`}
                className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-sm">
                {publicacion.imagen && (
                  <img src={publicacion.imagen} alt="" className="h-40 w-full object-cover" />
                )}
                <div className="p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    {publicacion.autor ? (
                      <button type="button" disabled={!onVerAutorPost}
                        onClick={() => onVerAutorPost?.(publicacion.autor!.id)}
                        className="text-xs font-medium text-[#3C9DA0] disabled:text-[#737373]">
                        {publicacion.autor.nombre}
                      </button>
                    ) : <span className="text-xs text-[#737373]">Autor no disponible</span>}
                    <span className="rounded-full bg-[#E8F5F6] px-2 py-1 text-xs font-semibold text-[#3C9DA0]">
                      {etiqueta}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0D0D0D]">{publicacion.titulo}</h3>
                  <p className="mt-1 text-sm text-[#737373]">{publicacion.descripcion}</p>
                  {publicacion.categorias.length > 0 && (
                    <p className="mt-2 text-xs text-[#9E9E9E]">{publicacion.categorias.join(' · ')}</p>
                  )}
                  {fechaTexto && <p className="mt-2 text-xs text-[#9E9E9E]">{fechaTexto}</p>}
                  {publicacion.tipo === 'POST_AYUDA' && onVerDetallePost && (
                    <button type="button" onClick={() => onVerDetallePost(publicacion.id)}
                      className="mt-3 w-full rounded-xl bg-[#3C9DA0] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#2D8B8E]">
                      Ver publicación
                    </button>
                  )}
                </div>
              </article>
            );
          })}

          {!cargando && !error && entradas.length === 0 && (
            <div data-section="sin-resultados" className="py-16 text-center">
              <Inbox size={40} className="mx-auto mb-3 text-[#E8E8E8]" aria-hidden="true" />
              <p className="font-medium text-[#737373]">No encontramos publicaciones.</p>
              <p className="mt-1 text-sm text-[#9E9E9E]">Vuelve más tarde para ver nuevas publicaciones.</p>
            </div>
          )}

          {errorMas && (
            <div role="alert" className="py-4 text-center text-sm text-red-700">
              <p>{errorMas}</p>
              <button type="button" onClick={() => void cargarMas()}
                className="mt-2 font-semibold text-[#3C9DA0] underline underline-offset-4">
                Reintentar
              </button>
            </div>
          )}
          {!cargando && !error && hayMas && (
            <div ref={marcadorFinalRef} data-section="fin-visible-del-feed" className="min-h-6 py-3 text-center">
              {cargandoMas && (
                <p role="status" className="text-xs text-[#737373]">Cargando más publicaciones…</p>
              )}
            </div>
          )}
          {!cargando && !error && !hayMas && entradas.length > 0 && (
            <p className="py-6 text-center text-xs text-[#9E9E9E]">Has visto todas las publicaciones recientes</p>
          )}
        </section>
      </div>
    </div>
  );
}

// ─────────────────── 04. TARJETA DE SALDO DEL HOME ───────────────────
// Se conserva dentro de este archivo porque aún no hemos decidido extraerla.
// En el futuro puede moverse a src/componentes sin modificar HomeFeed.
interface BalanceCardProps {
  miembro: MiembroHome;
  onVerMovimientos?: () => void;
  onDonarHoras?: () => void;
  onPedirHoras?: () => void;
}

function BalanceCard({
  miembro,
  onVerMovimientos,
  onDonarHoras,
  onPedirHoras,
}: BalanceCardProps) {
  return (
    <section
      data-section="tarjeta-saldo-home"
      aria-label="Resumen de horas"
      className="relative overflow-hidden rounded-2xl bg-[#3C9DA0] p-5"
    >
      {/* 04.1 ACENTOS DECORATIVOS */}
      <div aria-hidden="true" className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/4 rounded-full bg-white/5" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 h-24 w-24 -translate-x-1/4 translate-y-1/2 rounded-full bg-[#FFFF00]/10" />

      <div className="relative">
        {/* 04.2 SALUDO, FACULTAD Y AVATAR DEL MIEMBRO */}
        <header className="mb-4 flex items-start justify-between">
          <div>
            <h2
              className="text-xl font-bold leading-tight text-white"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Hola, {miembro.firstName} 👋
            </h2>
            <p className="mt-0.5 text-sm text-white/70">{miembro.faculty}</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-2 ring-white/30">
            {miembro.avatar ? (
              <img src={miembro.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-base font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {miembro.initials}
              </span>
            )}
          </div>
        </header>

        {/* 04.3 SALDO ACTUAL */}
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/60">Tu saldo</p>
        <div className="mb-5 flex items-end gap-2">
          <span
            className="text-5xl font-bold leading-none text-white"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {miembro.balance}
          </span>
          <span className="mb-1 text-xl font-semibold text-white/80">horas</span>
          <div className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFFF00]">
            <Clock3 size={20} strokeWidth={2.5} className="text-[#0D0D0D]" aria-hidden="true" />
          </div>
        </div>

        {/* 04.4 ACCIONES: ver movimientos, donar horas y pedir horas */}
        <div data-section="acciones-saldo" className="space-y-2">
          <button
            type="button"
            onClick={onVerMovimientos}
            className={`flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-[#0D0D0D] hover:bg-[#F6F6F6] ${ANIMACION_BOTON}`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <Activity size={14} aria-hidden="true" />
            Ver movimientos
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onDonarHoras}
              className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FFFF00] px-3 py-2.5 text-xs font-semibold text-[#0D0D0D] hover:bg-[#F0F000] ${ANIMACION_BOTON}`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <Heart size={14} aria-hidden="true" />
              Donar horas
            </button>
            <button
              type="button"
              onClick={onPedirHoras}
              className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/20 px-3 py-2.5 text-xs font-semibold text-white hover:bg-white/30 ${ANIMACION_BOTON}`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <Plus size={14} aria-hidden="true" />
              Pedir horas
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
