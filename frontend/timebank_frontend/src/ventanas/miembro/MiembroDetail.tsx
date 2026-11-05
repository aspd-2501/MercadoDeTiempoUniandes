import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router';
import {
  ArrowLeft,
  Award,
  Ban,
  Flag,
  MessageCircle,
  MoreHorizontal,
  Star,
  TriangleAlert,
  Users,
} from 'lucide-react';

import type { PerfilMiembroAPI } from '../../api/perfilesMiembro.api';
import {
  obtenerInteresesPerfil,
  obtenerPerfilPorId,
  obtenerReconocimientosPerfil,
  obtenerServiciosVisiblesPerfil,
  type CategoriaAPI,
  type ServicioOfrecidoAPI,
  type ReconocimientoOtorgadoAPI,
} from '../../api/miembroDetalle.api';

/**
 * Vista pública de un miembro obtenida por UUID desde NestJS.
 * Ruta existente: /:miembroId
 *
 * Solo maneja presentación, estados de carga/error y callbacks.
 * No introduce operaciones del backend ni datos ficticios.
 */

interface MiembroDetailProps {
  onVolver?: () => void;
  onSolicitarAyuda?: (perfilId: string) => void;
  onEnviarMensaje?: (perfilId: string) => void;
}

interface DatosComplementarios {
  intereses: CategoriaAPI[];
  servicios: ServicioOfrecidoAPI[];
  reconocimientos: ReconocimientoOtorgadoAPI[];
}

const DATOS_VACIOS: DatosComplementarios = {
  intereses: [],
  servicios: [],
  reconocimientos: [],
};

const ANIMACION_BOTON =
  'transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out motion-safe:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2 motion-reduce:transition-none';
const ANIMACION_ELEVACION =
  'motion-safe:hover:-translate-y-0.5 hover:shadow-md';

function AvatarMiembro({ miembro }: { miembro: PerfilMiembroAPI }) {
  const iniciales = miembro.nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <div
      className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#3C9DA0] ring-4 ring-white"
      aria-label={`Avatar de ${miembro.nombre}`}
    >
      {miembro.imagen ? (
        <img
          src={miembro.imagen}
          alt={`Foto de ${miembro.nombre}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {iniciales}
        </span>
      )}
    </div>
  );
}

function Etiqueta({ texto, variante = 'turquesa' }: {
  texto: string;
  variante?: 'turquesa' | 'amarillo';
}) {
  const colores = variante === 'turquesa'
    ? 'bg-[#E8F5F6] text-[#3C9DA0]'
    : 'bg-[#FFF9C4] text-[#5A5A00]';

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${colores}`}>
      {texto}
    </span>
  );
}

function SeccionPerfil({
  titulo,
  identificador,
  children,
}: {
  titulo: string;
  identificador: string;
  children: ReactNode;
}) {
  return (
    <section
      data-section={identificador}
      aria-label={titulo}
      className="mb-3 rounded-2xl border border-[#E8E8E8] bg-white p-4"
    >
      <h2 className="mb-3 text-sm font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export default function MiembroDetail({
  onVolver,
  onSolicitarAyuda,
  onEnviarMensaje,
}: MiembroDetailProps) {
  const { miembroId } = useParams<{ miembroId: string }>();
  const [perfil, setPerfil] = useState<PerfilMiembroAPI | null>(null);
  const [datos, setDatos] = useState<DatosComplementarios>(DATOS_VACIOS);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avisoComplementos, setAvisoComplementos] = useState(false);
  const [reintento, setReintento] = useState(0);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  useEffect(() => {
    let vigente = true;

    setPerfil(null);
    setDatos(DATOS_VACIOS);
    setCargando(true);
    setError(null);
    setAvisoComplementos(false);

    if (!miembroId) {
      setError('No se recibió el identificador del perfil.');
      setCargando(false);
      return () => { vigente = false; };
    }

    // Cargar el perfil antes de consultar información complementaria.
    // Las operaciones adicionales son de lectura y pueden fallar parcialmente.
    void (async () => {
      try {
        const perfilRecibido = await obtenerPerfilPorId(miembroId);
        if (!vigente) return;

        // Protección de presentación: no exponemos perfiles ocultos en esta vista.
        // El control de acceso definitivo también debe existir en el backend.
        if (!perfilRecibido.estadoActividad) {
          setError('Este perfil no está disponible públicamente.');
          return;
        }
        setPerfil(perfilRecibido);

        const [intereses, servicios, reconocimientos] = await Promise.allSettled([
          obtenerInteresesPerfil(miembroId),
          obtenerServiciosVisiblesPerfil(miembroId),
          obtenerReconocimientosPerfil(miembroId),
        ]);
        if (!vigente) return;

        setDatos({
          intereses: intereses.status === 'fulfilled' ? intereses.value : [],
          servicios: servicios.status === 'fulfilled' ? servicios.value : [],
          reconocimientos: reconocimientos.status === 'fulfilled' ? reconocimientos.value : [],
        });
        setAvisoComplementos(
          [intereses, servicios, reconocimientos].some((resultado) => resultado.status === 'rejected'),
        );
      } catch (excepcion: unknown) {
        if (!vigente) return;
        setError(
          excepcion instanceof Error
            ? excepcion.message
            : 'No pudimos obtener este perfil.',
        );
      } finally {
        if (vigente) setCargando(false);
      }
    })();

    return () => { vigente = false; };
  }, [miembroId, reintento]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] px-4 py-14 text-center text-sm text-[#737373]" role="status">
        Cargando perfil desde el backend…
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] px-4 py-14">
        <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-[#E8E8E8] bg-white p-6 text-center">
          <h1 className="font-bold text-[#0D0D0D]">No se pudo mostrar el perfil</h1>
          <p className="mt-2 text-sm text-[#737373]">{error ?? 'El perfil no existe.'}</p>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={() => setReintento((v) => v + 1)}
              className="rounded-xl bg-[#3C9DA0] px-4 py-2 text-sm font-semibold text-white">
              Reintentar
            </button>
            {onVolver && (
              <button type="button" onClick={onVolver}
                className="rounded-xl border border-[#E8E8E8] bg-white px-4 py-2 text-sm">
                Volver
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const serviciosVisibles = datos.servicios.filter((s) => s.visible);
  const estadisticas = [
    { label: 'Servicios', value: serviciosVisibles.length },
    { label: 'Reconocimientos', value: datos.reconocimientos.length },
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      {/* 01. Banner superior */}
      <header className="relative h-36 bg-[#3C9DA0]" data-section="banner-perfil">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #FFFF00 0%, transparent 60%)' }} />

        <div className="absolute top-12 right-4 left-4 z-20 flex items-center justify-between">
          {onVolver ? (
            <button type="button" onClick={onVolver} aria-label="Volver"
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 ${ANIMACION_BOTON}`}>
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
          ) : <span />}

          <div className="relative">
            <button
              type="button"
              aria-label="Más opciones sobre este miembro"
              aria-expanded={mostrarOpciones}
              aria-controls="menu-opciones-miembro"
              onClick={() => setMostrarOpciones((v) => !v)}
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 ${ANIMACION_BOTON}`}
            >
              <MoreHorizontal size={20} aria-hidden="true" />
            </button>
            {mostrarOpciones && (
              <div id="menu-opciones-miembro"
                className="absolute top-12 right-0 z-30 w-52 overflow-hidden rounded-xl border border-[#E8E8E8] bg-white shadow-lg">
                <button type="button" disabled title="Pendiente de integración"
                  className="flex w-full cursor-not-allowed items-center gap-3 px-4 py-3 text-left text-sm text-[#9E9E9E]">
                  <Flag size={16} aria-hidden="true" />
                  Reportar miembro
                </button>
                <button type="button" disabled title="Pendiente de integración"
                  className="flex w-full cursor-not-allowed items-center gap-3 border-t border-[#F0F0F0] px-4 py-3 text-left text-sm text-[#9E9E9E]">
                  <Ban size={16} aria-hidden="true" />
                  Bloquear miembro
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main data-section="contenido-perfil" className="relative z-10 mx-auto max-w-2xl px-4">
        {/* 02. Cabecera y resumen */}
        <article className="relative -mt-10 mb-3 rounded-2xl border border-[#E8E8E8] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start gap-4">
            <div className="relative -mt-8 shrink-0">
              <AvatarMiembro miembro={perfil} />
            </div>
            <div className="min-w-0 flex-1 pt-6">
              <h1 className="text-lg leading-tight font-bold text-[#0D0D0D]"
                style={{ fontFamily: 'Outfit, sans-serif' }}>{perfil.nombre}</h1>
              {perfil.afiliacionUniandes && (
                <p className="mt-1 text-xs text-[#737373]">{perfil.afiliacionUniandes}</p>
              )}
            </div>
          </div>

          {perfil.descripcion && (
            <p className="mb-4 text-sm leading-relaxed text-[#737373]">{perfil.descripcion}</p>
          )}

          <section aria-label="Estadísticas del miembro" className="mb-4 grid grid-cols-2 gap-2">
            {estadisticas.map((estadistica) => (
              <div key={estadistica.label} className="rounded-xl bg-[#F6F6F6] p-3 text-center">
                <div className="text-xl font-bold text-[#0D0D0D]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}>{estadistica.value}</div>
                <div className="mt-0.5 text-xs text-[#737373]">{estadistica.label}</div>
              </div>
            ))}
          </section>

          <div className="flex gap-2" data-section="acciones-perfil">
            <button
              type="button"
              disabled={!onSolicitarAyuda}
              onClick={() => onSolicitarAyuda?.(perfil.id)}
              title={!onSolicitarAyuda ? 'Pendiente de integración' : undefined}
              className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#3C9DA0] px-2 py-3 text-sm font-bold text-white hover:bg-[#2D8B8E] disabled:cursor-not-allowed disabled:opacity-50 ${ANIMACION_BOTON} ${ANIMACION_ELEVACION}`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <TriangleAlert size={16} aria-hidden="true" />
              Pedir ayuda
            </button>
            <button
              type="button"
              disabled={!onEnviarMensaje}
              onClick={() => onEnviarMensaje?.(perfil.id)}
              title={!onEnviarMensaje ? 'Pendiente de integración' : undefined}
              className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-[#E8E8E8] px-2 py-3 text-sm font-medium text-[#0D0D0D] hover:bg-[#F6F6F6] disabled:cursor-not-allowed disabled:opacity-50 ${ANIMACION_BOTON} ${ANIMACION_ELEVACION}`}
            >
              <MessageCircle size={16} aria-hidden="true" />
              Enviar mensaje
            </button>
          </div>
        </article>

        {avisoComplementos && (
          <p role="status" className="mb-3 rounded-xl bg-[#FFF9C4] px-4 py-3 text-sm text-[#705900]">
            Parte de la información complementaria no se pudo cargar.
            Puedes volver a intentar desde esta página.
          </p>
        )}

        {/* 03. Intereses: CategoriaEntity[] */}
        {datos.intereses.length > 0 && (
          <SeccionPerfil titulo="Intereses" identificador="intereses">
            <div className="flex flex-wrap gap-2">
              {datos.intereses.map((c) => (
                <Etiqueta key={c.id} texto={c.nombre} />
              ))}
            </div>
          </SeccionPerfil>
        )}

        {/* 04. Servicios: ServicioOfrecidoEntity[], sin duración inexistente */}
        {serviciosVisibles.length > 0 && (
          <SeccionPerfil titulo="Servicios ofrecidos" identificador="servicios-ofrecidos">
            <div className="space-y-3">
              {serviciosVisibles.map((s) => {
                const categorias = (s.categorias ?? [])
                  .map((relacion) => relacion.categoria?.nombre)
                  .filter((nombre): nombre is string => Boolean(nombre));

                return (
                  <article key={s.id} className="flex items-start gap-3 rounded-xl bg-[#F6F6F6] p-3">
                    {s.imagen ? (
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                        <img src={s.imagen} alt={s.titulo} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#3C9DA0]">
                        <Star size={22} className="text-white" aria-hidden="true" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[#0D0D0D]"
                        style={{ fontFamily: 'Outfit, sans-serif' }}>{s.titulo}</h3>
                      {categorias.length > 0 && (
                        <p className="mt-0.5 text-xs text-[#737373]">{categorias.join(' · ')}</p>
                      )}
                      <p className="mt-1 line-clamp-2 text-xs text-[#9E9E9E]">{s.descripcion}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </SeccionPerfil>
        )}

        {/* 05. Reconocimientos: ReconocimientoOtorgadoEntity[] */}
        {datos.reconocimientos.length > 0 && (
          <SeccionPerfil titulo="Reconocimientos recibidos" identificador="reconocimientos">
            <div className="flex flex-wrap gap-2">
              {datos.reconocimientos.map((otorgamiento) => (
                <span key={otorgamiento.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFF00] px-3 py-1.5 text-xs font-bold text-[#0D0D0D]">
                  <Award size={13} aria-hidden="true" />
                  {otorgamiento.reconocimiento.nombre}
                </span>
              ))}
            </div>
          </SeccionPerfil>
        )}

        {/* 06. No se muestran habilidades, organizaciones o intercambios
            ficticios: la consulta actual no aporta esos datos. */}
        <div aria-hidden="true" className="pb-8" />
      </main>
    </div>
  );
}
