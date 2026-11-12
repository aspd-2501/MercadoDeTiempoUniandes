import { useEffect, useState, type FormEvent } from 'react';
import { Check, ImageIcon, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import {
  ErrorRegistroParcial,
  obtenerCategoriasRegistro,
  type CategoriaAPI,
  type DatosRegistro,
} from '../../api/identidad.api';

interface OnboardingProps {
  /** El callback crea realmente usuario, perfil e intereses mediante NestJS. */
  onFinalizar: (datos: DatosRegistro) => Promise<string | void>;
}

const PASOS = [
  { titulo: 'Cuéntanos quién eres', descripcion: 'Crea tu cuenta y completa los datos de tu perfil.' },
  { titulo: 'Sobre ti', descripcion: 'Escribe una breve descripción para otros miembros.' },
  { titulo: '¿Qué te interesa?', descripcion: 'Selecciona categorías reales del Banco de Tiempo.' },
] as const;

/**
 * Tres pasos, página web de ancho normal y scroll del navegador.
 * Se ajusta al DTO real de PerfilMiembro: no inventa facultad ni organizaciones.
 * El backend actual recibe una URL de imagen; NO admite subir File aquí.
 */
export default function Onboarding({ onFinalizar }: OnboardingProps) {
  const [paso, setPaso] = useState(0);
  const [idUniandes, setIdUniandes] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [afiliacionUniandes, setAfiliacionUniandes] = useState('Estudiante');
  const [imagen, setImagen] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estadoActividad, setEstadoActividad] = useState(true);
  const [categorias, setCategorias] = useState<CategoriaAPI[]>([]);
  const [categoriaIds, setCategoriaIds] = useState<string[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);
  const [errorCategorias, setErrorCategorias] = useState<string | null>(null);
  const [recargarCategorias, setRecargarCategorias] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [registroParcial, setRegistroParcial] = useState<{ usuarioId: string; perfilId?: string } | null>(null);

  useEffect(() => {
    let vigente = true;
    setCargandoCategorias(true);
    setErrorCategorias(null);
    void obtenerCategoriasRegistro()
      .then((lista) => { if (vigente) setCategorias(lista); })
      .catch((excepcion: unknown) => {
        if (vigente) setErrorCategorias(excepcion instanceof Error ? excepcion.message : 'No se pudieron consultar las categorías.');
      })
      .finally(() => { if (vigente) setCargandoCategorias(false); });
    return () => { vigente = false; };
  }, [recargarCategorias]);

  function validarPasoInicial(): string | null {
    if (!idUniandes.trim()) return 'Ingresa tu identificador Uniandes.';
    if (contrasenia.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (contrasenia !== confirmacion) return 'La confirmación de contraseña no coincide.';
    if (!nombre.trim()) return 'Ingresa tu nombre completo.';
    if (!Number.isInteger(Number(edad)) || Number(edad) <= 0) return 'Indica una edad válida en años enteros.';
    if (!afiliacionUniandes.trim()) return 'Selecciona tu afiliación Uniandes.';
    if (!imagen.trim()) return 'Por ahora, el backend exige una URL de imagen.';
    try { new URL(imagen.trim()); } catch { return 'Ingresa una URL válida de imagen (https://...).'; }
    return null;
  }

  /**
   * Se registra solamente al finalizar el tercer paso (o al omitir intereses).
   * Nunca se inicia una creación si sabemos que el backend la rechazará.
   */
  async function finalizarRegistro(categoriasElegidas: string[]) {
    if (guardando || resultado || registroParcial) return;
    setError(null);

    // Comprobar todos los datos antes del primer POST para evitar registros parciales.
    const problema = validarPasoInicial();
    if (problema) {
      setError(problema);
      setPaso(0);
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    // El backend exige una descripción no vacía.
    // Validación preventiva antes de enviar los datos del registro.
    if (!descripcion.trim()) {
      setError('La descripción es obligatoria para crear el perfil.');
      setPaso(1);
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    setGuardando(true);
    try {
      const mensaje = await onFinalizar({
        idUniandes: idUniandes.trim(),
        contrasenia,
        nombre: nombre.trim(),
        edad: Number(edad),
        afiliacionUniandes,
        imagen: imagen.trim(),
        descripcion: descripcion.trim(),
        estadoActividad,
        categoriaIds: categoriasElegidas,
      });
      setResultado(mensaje || 'Cuenta creada correctamente.');
    } catch (excepcion: unknown) {
      if (excepcion instanceof ErrorRegistroParcial) {
        setRegistroParcial({
          usuarioId: excepcion.usuarioId,
          perfilId: excepcion.perfilId,
        });
        setError(
          excepcion.perfilId
            ? 'La cuenta y el perfil ya se crearon, pero quedó un paso pendiente. No intentes registrar la cuenta otra vez.'
            : 'El usuario ya se creó, pero falló la creación del perfil. No intentes registrar la cuenta otra vez.'
        );
      } else {
        setError(excepcion instanceof Error ? excepcion.message : 'No se pudo completar el registro.');
      }
    } finally {
      setGuardando(false);
    }
  }

  async function continuar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (guardando || resultado || registroParcial) return;
    setError(null);

    if (paso === 0) {
      const problema = validarPasoInicial();
      if (problema) { setError(problema); return; }
    }

    if (paso === 1 && !descripcion.trim()) {
      setError('Escribe una descripción para continuar.');
      return;
    }

    if (paso < 2) {
      // Sin peticiones al backend: solo avanzamos en el formulario local.
      setPaso((anterior) => anterior + 1);
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    await finalizarRegistro(categoriaIds);
  }

  function omitirIntereses() {
    if (paso !== 2 || guardando || resultado || registroParcial) return;
    setError(null);
    // No se registran intereses; no se omite la descripción obligatoria.
    setCategoriaIds([]);
    void finalizarRegistro([]);
  }

  return (
    <div className="min-h-dvh w-full bg-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
        <header className="px-5 pb-4 pt-8 sm:px-6 sm:pt-10">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-[#737373]">Paso {paso + 1} de 3</p>
            {paso === 2 && !resultado && !registroParcial && (
              <button
                type="button"
                onClick={omitirIntereses}
                disabled={guardando}
                className="text-sm font-semibold text-[#3C9DA0] hover:underline disabled:opacity-50"
              >
                Omitir
              </button>
            )}
          </div>
          <div role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={paso + 1}
            aria-label="Progreso del registro" className="h-1.5 overflow-hidden rounded-full bg-[#E8E8E8]">
            <div className="h-full rounded-full bg-[#3C9DA0] transition-all duration-300"
              style={{ width: `${((paso + 1) / 3) * 100}%` }} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>{PASOS[paso].titulo}</h1>
          <p className="mt-1 text-sm text-[#737373]">{PASOS[paso].descripcion}</p>
        </header>
        <form onSubmit={(evento) => void continuar(evento)} className="flex w-full flex-1 flex-col">
          <div className="flex-1 space-y-5 px-5 pb-8 sm:px-6">
            {paso === 0 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="registro-id" className="mb-1 block text-xs font-semibold text-[#737373]">IDENTIFICADOR UNIANDES</label>
                    <input id="registro-id" autoComplete="username" value={idUniandes} onChange={(e) => setIdUniandes(e.target.value)}
                      placeholder="Por ejemplo: demo11" className="w-full rounded-xl border border-[#E8E8E8] px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="registro-nombre" className="mb-1 block text-xs font-semibold text-[#737373]">NOMBRE COMPLETO</label>
                    <input id="registro-nombre" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)}
                      className="w-full rounded-xl border border-[#E8E8E8] px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="registro-password" className="mb-1 block text-xs font-semibold text-[#737373]">CONTRASEÑA (MÍN. 6 CARACTERES)</label>
                    <input id="registro-password" type="password" autoComplete="new-password" value={contrasenia} onChange={(e) => setContrasenia(e.target.value)}
                      className="w-full rounded-xl border border-[#E8E8E8] px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="registro-confirmar" className="mb-1 block text-xs font-semibold text-[#737373]">CONFIRMAR CONTRASEÑA</label>
                    <input id="registro-confirmar" type="password" autoComplete="new-password" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)}
                      className="w-full rounded-xl border border-[#E8E8E8] px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="registro-edad" className="mb-1 block text-xs font-semibold text-[#737373]">EDAD</label>
                    <input id="registro-edad" type="number" min={1} step={1} value={edad} onChange={(e) => setEdad(e.target.value)}
                      className="w-full rounded-xl border border-[#E8E8E8] px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="registro-afiliacion" className="mb-1 block text-xs font-semibold text-[#737373]">AFILIACIÓN UNIANDES</label>
                    <select id="registro-afiliacion" value={afiliacionUniandes} onChange={(e) => setAfiliacionUniandes(e.target.value)}
                      className="w-full rounded-xl border border-[#E8E8E8] bg-white px-4 py-3 text-sm">
                      {['Estudiante', 'Profesor', 'Egresado', 'Administrativo', 'Otro'].map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="registro-imagen" className="mb-1 block text-xs font-semibold text-[#737373]">URL DE FOTO DE PERFIL</label>
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#3C9DA0]">
                      {imagen.trim() ? <img src={imagen.trim()} alt="Vista previa de foto" className="h-full w-full object-cover" /> : <ImageIcon className="text-white" />}
                    </div>
                    <input id="registro-imagen" type="url" value={imagen} onChange={(e) => setImagen(e.target.value)}
                      placeholder="https://..." className="min-w-0 flex-1 rounded-xl border border-[#E8E8E8] px-4 py-3 text-sm" />
                  </div>
                  <p className="mt-1 text-xs text-[#737373]">El backend actual almacena una URL, no recibe archivos de imagen.</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                  <input type="checkbox" checked={estadoActividad} onChange={(e) => setEstadoActividad(e.target.checked)} />
                  Mostrar mi perfil en las búsquedas de miembros
                </label>
              </>
            )}
            {paso === 1 && (
              <div>
                <label htmlFor="registro-descripcion" className="mb-1 block text-xs font-semibold text-[#737373]">DESCRIPCIÓN</label>
                <textarea id="registro-descripcion" rows={5} value={descripcion} maxLength={200}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Cuéntanos un poco sobre ti..."
                  className="w-full resize-none rounded-xl border border-[#E8E8E8] px-4 py-3 text-sm" />
                <p className="mt-1 text-xs text-[#737373]">{descripcion.length}/200 caracteres</p>
                <p className="mt-3 text-xs text-[#737373]">
                  La descripción es obligatoria para completar el registro.
                </p>
              </div>
            )}
            {paso === 2 && (
              <section aria-label="Categorías de interés">
                {cargandoCategorias && <p role="status" className="text-sm text-[#737373]">Cargando categorías del backend…</p>}
                {errorCategorias && (
                  <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    {errorCategorias}
                    <button type="button" onClick={() => setRecargarCategorias((v) => v + 1)} className="ml-3 underline">Reintentar</button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {categorias.map((categoria) => {
                    const elegida = categoriaIds.includes(categoria.id);
                    return (
                      <button type="button" key={categoria.id} aria-pressed={elegida}
                        onClick={() => setCategoriaIds((actual) => elegida ? actual.filter((id) => id !== categoria.id) : [...actual, categoria.id])}
                        className={`rounded-full border px-3.5 py-2 text-sm font-medium ${elegida ? 'border-[#3C9DA0] bg-[#E8F5F6] text-[#2D7B7E]' : 'border-[#E8E8E8] text-[#737373]'}`}>
                        {elegida && <Check size={13} className="mr-1 inline" />}{categoria.nombre}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-[#737373]">
                  {categoriaIds.length} intereses seleccionados. Puedes finalizar sin elegir ninguno.
                </p>
                <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#E8F5F6] p-3 text-xs text-[#2D7B7E]">
                  <ShieldCheck size={18} className="shrink-0" />
                  <span>El registro usa la API local. Todavía no hay validación institucional SSO ni creación atómica de cuenta.</span>
                </div>
              </section>
            )}
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {registroParcial && (
              <Link to="/login" className="block rounded-xl bg-[#3C9DA0] px-4 py-3 text-center text-sm font-semibold text-white">
                Ir a iniciar sesión
              </Link>
            )}
            {resultado && (
              <div className="space-y-3">
                <p role="status" className="rounded-xl bg-[#E8F5F6] p-4 text-sm font-medium text-[#2D7B7E]">{resultado}</p>
                <Link to="/login" className="block rounded-xl bg-[#3C9DA0] px-4 py-3 text-center text-sm font-semibold text-white">
                  Ir a iniciar sesión
                </Link>
              </div>
            )}
          </div>
          <footer className="border-t border-[#E8E8E8] bg-white px-5 py-4 sm:px-6">
            {!resultado && !registroParcial && (
              <div className="flex gap-2">
                {paso > 0 && <button type="button" onClick={() => { setError(null); setPaso((p) => p - 1); window.scrollTo(0, 0); }}
                  disabled={guardando} className="rounded-xl border border-[#E8E8E8] px-5 py-3 text-sm font-semibold">Atrás</button>}
                <button type="submit" disabled={guardando}
                  className="flex-1 rounded-xl bg-[#3C9DA0] py-3 text-sm font-bold text-white hover:bg-[#2D8B8E] disabled:opacity-50">
                  {guardando ? 'Creando cuenta…' : paso < 2 ? 'Continuar' : 'Crear cuenta y perfil'}
                </button>
              </div>
            )}
          </footer>
        </form>
      </div>
    </div>
  );
}
