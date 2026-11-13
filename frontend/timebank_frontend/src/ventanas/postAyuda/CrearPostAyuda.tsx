import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Check, ChevronRight, Clock3, ImagePlus, Star, TriangleAlert, X } from 'lucide-react';

import { useMiembroSesion } from '../../contextos/MiembroSesionContext';
import { urlImagen } from '../../api/imagenes.api';
import { obtenerServiciosMiembro } from '../../api/perfilResumen.api';
import { obtenerCategoriasRegistro, type CategoriaAPI } from '../../api/identidad.api';
import type { ServicioOfrecidoAPI } from '../../api/serviciosOfrecidos.api';
import type { IntervaloDisponibilidad } from '../../tipos/disponibilidad';
import EditorFranjasDisponibilidad, {
  crearPrimeraFranja,
  cumpleDuracionMinima,
} from '../../componentes/calendario/EditorFranjasDisponibilidad';

/**
 * VISTA: crear una solicitud u oferta de ayuda.
 *
 * El modo llega desde App.tsx según el botón elegido en MenuCrear.
 * - 'pide': abre directamente el formulario.
 * - 'ofrece': permite precargar un servicio propio del catálogo o continuar sin él.
 * - El estado del formulario y la previsualización de imagen son locales.
 * - La publicación definitiva la hará la API, por medio de onPublicar.
 *
 * Ubicación: src/ventanas/postAyuda/CrearPostAyuda.tsx
 */

// ─────────────────────── 00. TIPOS Y CONSTANTES ───────────────────────
export type TipoCreacionAyuda = 'pide' | 'ofrece';

/** Datos que se enviarán al backend; userId se obtiene de la sesión en el servidor. */
export interface NuevaPublicacionAyuda {
  type: 'help-request' | 'help-offer';
  title: string;
  categoryId: string;
  description: string;
  estimatedHours: number;
  availability: IntervaloDisponibilidad[];
  preferredAvailabilityId: string;
  maxParticipants: number;
  servicioCatalogoId?: string;
  /** URL HTTP(S) o ruta de imagen ya guardada en el backend. */
  imagenUrl: string;
}

export interface CrearPostAyudaProps {
  tipo: TipoCreacionAyuda;
  onVolver?: () => void;
  /** Debe guardar mediante API. Si no se proporciona, no se afirma que el post está publicado. */
  onPublicar: (publicacion: NuevaPublicacionAyuda) => Promise<string>;
  onVerPublicacion?: (postId: string) => void;
  onVolverInicio?: () => void;
}

const OPCIONES_PERSONAS = ['1', '2', '3', '4', '5', '8', '10'];
const CLASE_CAMPO =
  'w-full min-w-0 rounded-xl border border-[#E8E8E8] bg-white px-4 py-3 text-sm text-[#0D0D0D] outline-none focus:border-[#3C9DA0] focus-visible:ring-2 focus-visible:ring-[#3C9DA0]/20';
const CLASE_ETIQUETA = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#737373]';

// ─────────────────────── 01. COMPONENTE PRINCIPAL ───────────────────────
export default function CrearPostAyuda({
  tipo,
  onVolver,
  onPublicar,
  onVerPublicacion,
  onVolverInicio,
}: CrearPostAyudaProps) {
  const { perfil } = useMiembroSesion();
  const esOferta = tipo === 'ofrece';

  // 01.1 PASOS: el menú Crear ya decide el tipo de publicación.
  const [paso, setPaso] = useState<'catalogo' | 'formulario' | 'exito'>(
    esOferta ? 'catalogo' : 'formulario',
  );
  const [titulo, setTitulo] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [horas, setHoras] = useState('1');
  const [personas, setPersonas] = useState('1');
  const [franjas, setFranjas] = useState<IntervaloDisponibilidad[]>(() => [crearPrimeraFranja()]);
  const [preferidaId, setPreferidaId] = useState('franja-1');
  const [servicioCatalogoId, setServicioCatalogoId] = useState<string | undefined>();
  const [imagenUrl, setImagenUrl] = useState('');
  const [postCreadoId, setPostCreadoId] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [publicacionPorVerificar, setPublicacionPorVerificar] = useState(false);

  // 01.2 CATÁLOGO Y CATEGORÍAS REALES. El backend decide qué servicios son visibles.
  const [serviciosPropios, setServiciosPropios] = useState<ServicioOfrecidoAPI[]>([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(esOferta);
  const [errorCatalogo, setErrorCatalogo] = useState<string | null>(null);
  const [categoriasApi, setCategoriasApi] = useState<CategoriaAPI[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [errorCategorias, setErrorCategorias] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    setCargandoCategorias(true);
    void obtenerCategoriasRegistro()
      .then(datos => { if (vigente) setCategoriasApi(datos); })
      .catch(e => { if (vigente) setErrorCategorias(e instanceof Error ? e.message : 'No se pudieron cargar las categorías.'); })
      .finally(() => { if (vigente) setCargandoCategorias(false); });
    return () => { vigente = false; };
  }, []);

  useEffect(() => {
    if (!esOferta || !perfil?.id) return;
    let vigente = true;
    setCargandoCatalogo(true);
    void obtenerServiciosMiembro(perfil.id)
      .then(datos => { if (vigente) setServiciosPropios(datos); })
      .catch(e => { if (vigente) setErrorCatalogo(e instanceof Error ? e.message : 'No se pudieron cargar tus servicios.'); })
      .finally(() => { if (vigente) setCargandoCatalogo(false); });
    return () => { vigente = false; };
  }, [esOferta, perfil?.id]);

  // 01.3 COMPROBACIONES BÁSICAS DEL FORMULARIO (NO REEMPLAZAN VALIDACIÓN DE API).
  // Las horas de servicio y los créditos del Banco de Tiempo siempre son enteros positivos.
  const horasEnterasValidas = /^\d+$/.test(horas) &&
    Number.isSafeInteger(Number(horas)) && Number(horas) > 0;

  // Una franja individual dentro del horario 05:00–22:00 dura, como máximo, 17 horas.
  // Duraciones superiores requerirán un futuro modelo de encuentros en varias sesiones.
  const superaDuracionFranjaDiaria = horasEnterasValidas && Number(horas) > 17;
  const franjasValidas = horasEnterasValidas && franjas.length > 0 &&
    franjas.every((franja) => cumpleDuracionMinima(franja, Number(horas)));
  const preferidaExiste = franjas.some((franja) => franja.id === preferidaId);
  // La versión del backend compartida exige una imagen no vacía y todavía no
  // admite subir archivos. Aceptamos una URL o una ruta ya persistida del catálogo.
  function imagenCompatible(valor: string): boolean {
    const url = valor.trim();
    if (url.startsWith('/uploads/')) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
  const formularioValido = Boolean(
    perfil?.id && titulo.trim() && categoriaId && descripcion.trim() &&
    imagenCompatible(imagenUrl) &&
    franjasValidas && preferidaExiste && horasEnterasValidas && Number(personas) > 0 &&
    !cargandoCategorias && !errorCategorias && !publicacionPorVerificar,
  );

  // 02. PRECARGA DE DATOS DESDE EL CATÁLOGO.
  function utilizarServicio(servicio: ServicioOfrecidoAPI) {
    setTitulo(servicio.titulo);
    setDescripcion(servicio.descripcion);
    // La entidad servicio no almacena una duración. El miembro la define aquí.
    const categoriaDelCatalogo = servicio.categorias?.find((c) =>
      categoriasApi.some((disponible) => disponible.id === c.idCategoria),
    );
    setCategoriaId(categoriaDelCatalogo?.idCategoria ?? '');
    setServicioCatalogoId(servicio.id);
    setImagenUrl(servicio.imagen ?? '');
    setPaso('formulario');
  }

  function volver() {
    if (paso === 'formulario' && esOferta) {
      setPaso('catalogo');
    } else {
      onVolver?.();
    }
  }

  // 03. PUBLICACIÓN REAL A TRAVÉS DEL CALLBACK DE APP Y LA CAPA API.
  async function publicar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensajeError('');
    if (!formularioValido || enviando || publicacionPorVerificar) return;
    const datos: NuevaPublicacionAyuda = {
      type: esOferta ? 'help-offer' : 'help-request',
      title: titulo.trim(),
      categoryId: categoriaId,
      description: descripcion.trim(),
      estimatedHours: Number(horas),
      availability: franjas,
      preferredAvailabilityId: preferidaId,
      maxParticipants: Number(personas),
      servicioCatalogoId,
      imagenUrl: imagenUrl.trim(),
    };

    setEnviando(true);
    try {
      const idCreado = await onPublicar(datos);
      setPostCreadoId(idCreado);
      setPaso('exito');
    } catch (error: unknown) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido.';
      if (mensaje.includes('each value in categoriaIds must be a UUID')) {
        setMensajeError(
          'El backend exige categorías con UUID v4, pero la base de datos de prueba contiene UUID v5. ' +
          'Solicita corregir la validación de CrearPostAyudaDto. La solicitud fue rechazada antes de crear el post.',
        );
      } else {
        // El backend guarda post, categorías y horarios en operaciones separadas.
        // Tras un fallo no podemos garantizar que no exista un registro parcial.
        setPublicacionPorVerificar(true);
        setMensajeError(
          `No pudimos confirmar el registro: ${mensaje}. Antes de repetir la publicación, ` +
          'comprueba mediante GET /posts-ayuda o en PostgreSQL si ya existe, para evitar duplicados.',
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  // ─────────────────────── 04. CONFIRMACIÓN REAL DEL CALLBACK ───────────────────────
  if (paso === 'exito') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#3C9DA0]">
          <Check size={36} strokeWidth={3} className="text-white" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>¡Publicado!</h1>
        <p className="max-w-sm text-sm text-[#737373]">
          {esOferta ? 'Tu oferta fue registrada correctamente.' : 'Tu solicitud fue registrada correctamente.'}
        </p>
        {postCreadoId && onVerPublicacion && (
          <button
            type="button"
            onClick={() => onVerPublicacion(postCreadoId)}
            className="mt-6 rounded-xl bg-[#3C9DA0] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2D8B8E]"
          >
            Ver publicación
          </button>
        )}
        <button
          type="button"
          onClick={onVolverInicio ?? onVolver}
          className={`${postCreadoId && onVerPublicacion ? 'mt-3' : 'mt-6'} rounded-xl border border-[#3C9DA0] px-6 py-3 text-sm font-semibold text-[#3C9DA0] hover:bg-[#E8F5F6]`}
        >
          Volver al inicio
        </button>
      </main>
    );
  }

  // ─────────────────────── 05. SELECCIÓN OPCIONAL DE SERVICIO ───────────────────────
  if (paso === 'catalogo') {
    return (
      <div className="min-h-screen bg-white" data-section="seleccionar-servicio-catalogo">
        <header className="sticky top-0 z-30 border-b border-[#E8E8E8] bg-white px-4 py-4 lg:py-6">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <button type="button" onClick={onVolver} aria-label="Volver" className="rounded-full p-2 hover:bg-[#F6F6F6]">
              <ArrowLeft size={22} aria-hidden="true" />
            </button>
            <h1 className="text-lg font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>Usar servicio del catálogo</h1>
          </div>
        </header>
        <main className="mx-auto max-w-lg space-y-4 px-4 py-5">
          <p className="text-sm text-[#737373]">
            Elige uno de tus servicios para completar automáticamente el título, la descripción y la imagen de tu oferta.
          </p>
          {cargandoCatalogo ? (
            <p role="status" className="py-8 text-center text-sm text-[#737373]">Cargando tus servicios…</p>
          ) : errorCatalogo ? (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorCatalogo}</p>
          ) : serviciosPropios.length === 0 ? (
            <div className="rounded-2xl border border-[#E8E8E8] px-4 py-12 text-center">
              <Star size={36} className="mx-auto mb-3 text-[#C0C0C0]" aria-hidden="true" />
              <p className="text-sm font-medium text-[#737373]">No tienes servicios visibles en tu catálogo.</p>
              <p className="mt-1 text-xs text-[#9E9E9E]">También puedes crear la oferta manualmente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {serviciosPropios.map((servicio) => (
                <button
                  key={servicio.id}
                  type="button"
                  onClick={() => utilizarServicio(servicio)}
                  className="flex w-full items-start gap-3 rounded-2xl border border-[#E8E8E8] p-4 text-left transition-colors hover:border-[#3C9DA0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]"
                >
                  {servicio.imagen ? (
                    <img src={servicio.imagen} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#3C9DA0]">
                      <Star size={22} className="text-white" aria-hidden="true" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#0D0D0D]">{servicio.titulo}</span>
                    <span className="mt-0.5 block text-xs text-[#737373]">{servicio.categorias?.map(c => c.categoria?.nombre).filter(Boolean).join(', ')}</span>
                    <span className="mt-1 line-clamp-2 block text-xs text-[#9E9E9E]">{servicio.descripcion}</span>
                  </span>
                  <ChevronRight size={18} className="mt-1 shrink-0 text-[#C0C0C0]" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setPaso('formulario')}
            className="w-full rounded-xl border border-[#E8E8E8] py-3 text-sm font-medium text-[#737373] hover:bg-[#F6F6F6]"
          >
            Continuar sin seleccionar
          </button>
        </main>
      </div>
    );
  }

  // ─────────────────────── 06. FORMULARIO DE PUBLICACIÓN ───────────────────────
  return (
    <div className="min-h-screen min-w-0 bg-white" data-section="crear-post-ayuda">
      <header className="sticky top-0 z-30 border-b border-[#E8E8E8] bg-white px-4 py-4 lg:py-6">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button type="button" onClick={volver} aria-label="Volver" className="rounded-full p-2 hover:bg-[#F6F6F6]">
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
          <h1 className="min-w-0 flex-1 text-base font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {esOferta ? 'Publicar oferta de ayuda' : 'Publicar solicitud de ayuda'}
          </h1>
          <span className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide ${esOferta ? 'bg-[#FFFF00] text-[#0D0D0D]' : 'bg-[#E8F5F6] text-[#3C9DA0]'}`}>
            {esOferta ? 'Ofrece ayuda' : 'Pide ayuda'}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 py-5">
        <form id="formulario-post-ayuda" onSubmit={publicar} className="space-y-5">
          {/* 06.1 TÍTULO */}
          <label className="block">
            <span className={CLASE_ETIQUETA}>Título *</span>
            <input
              type="text"
              value={titulo}
              onChange={(evento) => setTitulo(evento.target.value)}
              placeholder={esOferta ? 'Ej.: Taller de Excel avanzado' : 'Ej.: Necesito ayuda con Excel'}
              maxLength={120}
              required
              className={CLASE_CAMPO}
            />
          </label>

          {/* 06.2 CATEGORÍA */}
          <fieldset>
            <legend className={CLASE_ETIQUETA}>Categoría *</legend>
            {cargandoCategorias && <p role="status" className="text-xs text-[#737373]">Cargando categorías…</p>}
            {errorCategorias && <p role="alert" className="text-xs text-red-600">{errorCategorias}</p>}
            <div className="flex flex-wrap gap-2">
              {categoriasApi.map((opcion) => (
                <button
                  key={opcion.id}
                  type="button"
                  aria-pressed={categoriaId === opcion.id}
                  onClick={() => setCategoriaId(opcion.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] ${categoriaId === opcion.id ? 'bg-[#3C9DA0] text-white' : 'bg-[#E8F5F6] text-[#3C9DA0] hover:bg-[#D8F0F0]'}`}
                >
                  {opcion.nombre}
                </button>
              ))}
            </div>
          </fieldset>

          {/* 06.3 DESCRIPCIÓN */}
          <label className="block">
            <span className={CLASE_ETIQUETA}>{esOferta ? 'Descripción de la ayuda *' : '¿Qué necesitas? *'}</span>
            <textarea
              value={descripcion}
              onChange={(evento) => setDescripcion(evento.target.value)}
              placeholder={esOferta
                ? 'Describe qué vas a enseñar o hacer y qué necesitan los participantes…'
                : 'Describe qué necesitas, qué sabes hasta ahora y cómo pueden ayudarte…'}
              rows={4}
              maxLength={2000}
              required
              className={`${CLASE_CAMPO} resize-y`}
            />
          </label>

          {/* 06.4 DURACIÓN Y CANTIDAD DE PERSONAS */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block min-w-0">
              <span className={CLASE_ETIQUETA}>Horas estimadas *</span>
              <input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={horas}
                onChange={(evento) => setHoras(evento.target.value)}
                aria-invalid={!horasEnterasValidas}
                aria-describedby="ayuda-horas-estimadas"
                required
                className={CLASE_CAMPO}
              />
            </label>
            <label className="block min-w-0">
              <span className={CLASE_ETIQUETA}>{esOferta ? 'Máx. participantes' : 'Ayudantes necesarios'}</span>
              <select value={personas} onChange={(evento) => setPersonas(evento.target.value)} className={CLASE_CAMPO}>
                {OPCIONES_PERSONAS.map((opcion) => <option key={opcion} value={opcion}>
                  {opcion} {opcion === '1' ? 'persona' : 'personas'}
                </option>)}
              </select>
            </label>
          </div>

          <div id="ayuda-horas-estimadas" className="-mt-3 space-y-1" aria-live="polite">
            {!horasEnterasValidas && (
              <p role="alert" className="text-xs text-red-600">
                Introduce un número entero positivo de horas (1, 2, 3, ...). No se permiten fracciones.
              </p>
            )}
            {superaDuracionFranjaDiaria && (
              <p role="alert" className="text-xs text-red-600">
                Has indicado {horas} horas. Cada franja puede cubrir como máximo 17 horas
                (de 5:00 a. m. a 10:00 p. m.). Para duraciones mayores necesitaremos organizar
                el servicio en varias sesiones; esa funcionalidad aún no está disponible.
              </p>
            )}
          </div>

          {/* 06.5 MÚLTIPLES FRANJAS Y PREFERENCIA */}
          <section aria-labelledby="titulo-disponibilidad" className="rounded-2xl bg-[#F6F6F6] p-4">
            <h2 id="titulo-disponibilidad" className="text-sm font-bold text-[#0D0D0D]">Disponibilidad</h2>
            <p className="mb-3 mt-1 text-xs leading-relaxed text-[#737373]">
              Propón varias franjas de al menos {horasEnterasValidas ? `${horas} hora${Number(horas) === 1 ? '' : 's'}` : 'la duración indicada'} cada una y marca tu horario preferido. Esto no confirma automáticamente ningún acuerdo. El backend todavía no guarda cuál franja marcaste como preferida.
            </p>
            <EditorFranjasDisponibilidad
              franjas={franjas}
              onCambiar={setFranjas}
              franjaPreferidaId={preferidaId}
              horasEstimadas={Number(horas)}
              onCambiarPreferida={setPreferidaId}
            />
          </section>

          {/* 06.6 IMAGEN: el backend exige un texto, no dispone de endpoint de carga de archivos. */}
          <div className="space-y-2">
            <label htmlFor="imagen-url-post-ayuda" className={CLASE_ETIQUETA}>URL de imagen *</label>
            <input
              id="imagen-url-post-ayuda"
              type="text"
              value={imagenUrl}
              onChange={(evento) => setImagenUrl(evento.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              aria-invalid={Boolean(imagenUrl.trim()) && !imagenCompatible(imagenUrl)}
              required
              className={CLASE_CAMPO}
            />
            <div className="flex min-h-28 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-[#E8E8E8] p-4">
              {imagenCompatible(imagenUrl) ? (
                <img
                  src={urlImagen(imagenUrl.trim())}
                  alt="Vista previa de imagen"
                  className="max-h-48 w-full rounded-xl object-contain"
                />
              ) : (
                <>
                  <ImagePlus size={26} className="text-[#C0C0C0]" aria-hidden="true" />
                  <span className="text-sm text-[#9E9E9E]">Vista previa de imagen</span>
                </>
              )}
              <span className="text-xs text-[#9E9E9E]">Puedes usar la imagen de tu servicio o pegar una URL.</span>
            </div>
            {imagenUrl && (
              <button
                type="button"
                onClick={() => setImagenUrl('')}
                className="inline-flex items-center gap-1 text-xs text-[#737373] hover:text-[#0D0D0D]"
              >
                <X size={14} aria-hidden="true" /> Quitar imagen
              </button>
            )}
            <p className="text-xs text-[#737373]">
              Por ahora el backend requiere una imagen, pero no permite subir archivos directamente.
            </p>
          </div>

          {/* 06.7 RECORDATORIO Y ENVÍO */}
          <div className="flex items-center gap-2 rounded-xl bg-[#FFFDE0] p-3">
            <Clock3 size={16} className="shrink-0 text-[#F57F17]" aria-hidden="true" />
            <p className="text-xs text-[#5A5A00]">Recuerda: 1 hora de ayuda = 1 crédito de tiempo</p>
          </div>

          {mensajeError && (
            <div role="alert" className="space-y-2 rounded-xl border border-[#F2CECE] bg-red-50 p-3 text-sm text-red-700">
              <p>{mensajeError}</p>
              {publicacionPorVerificar && onVolverInicio && (
                <button
                  type="button"
                  onClick={onVolverInicio}
                  className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold hover:bg-red-100"
                >
                  Volver al inicio
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!formularioValido || enviando}
            className={`w-full rounded-2xl py-4 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] ${formularioValido && !enviando ? 'bg-[#3C9DA0] text-white hover:bg-[#2D8B8E]' : 'cursor-not-allowed bg-[#F0F0F0] text-[#9E9E9E]'}`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {enviando ? 'Publicando…' : publicacionPorVerificar ? 'Verifica si ya se publicó' : esOferta ? 'Publicar oferta' : 'Publicar solicitud'}
          </button>

        </form>
      </main>
    </div>
  );
}
