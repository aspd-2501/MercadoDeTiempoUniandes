import { useEffect, useState } from 'react';
import { Activity as IconoActividad, ArrowLeft } from 'lucide-react';
import AcuerdoCard from '../componentes/acuerdos/AcuerdoCard';
import { useMiembroSesion } from '../contextos/MiembroSesionContext';
import {
  obtenerAcuerdosMiembro,
  type AcuerdoAPI,
  type FiltroAcuerdosAPI,
} from '../api/acuerdos.api';

/**
 * Vista EXISTENTE: Actividad personal del Banco de Tiempo.
 * Consulta acuerdos del perfil autenticado con MiembroSesionContext, no de los mocks.
 * La navegación a AcuerdoDetail se habilitará cuando esa vista consuma acuerdos reales.
 * La selección por estado y pertenencia al perfil ocurre en NestJS.
 */
export interface ActividadProps {
  onVolver?: () => void;
  onExplorar?: () => void;
  onVerAcuerdo?: (acuerdoId: string) => void;
  onIrChat?: (chatId: string) => void;
}

const PESTANAS: { etiqueta: string; filtro: FiltroAcuerdosAPI }[] = [
  { etiqueta: 'Pendientes', filtro: 'pendientes' },
  { etiqueta: 'Completados', filtro: 'completados' },
  { etiqueta: 'Cancelados', filtro: 'cancelados' },
];

const MENSAJES_VACIOS: Record<FiltroAcuerdosAPI, string> = {
  pendientes: 'Aún no tienes acuerdos pendientes.',
  completados: 'Aún no has completado ningún intercambio.',
  cancelados: 'No tienes acuerdos cancelados.',
};

export default function Actividad({
  onVolver,
  onExplorar,
  onVerAcuerdo,
  onIrChat,
}: ActividadProps) {
  // El contexto almacena el perfil real asociado al JWT; nunca usamos IDs de prueba.
  const { perfil } = useMiembroSesion();
  const perfilId = perfil?.id;
  const [filtroActivo, setFiltroActivo] = useState<FiltroAcuerdosAPI>('pendientes');
  const [acuerdos, setAcuerdos] = useState<AcuerdoAPI[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reintento, setReintento] = useState(0);

  useEffect(() => {
    if (!perfilId) {
      setAcuerdos([]);
      setCargando(false);
      setError(null);
      return;
    }

    let vigente = true;
    setCargando(true);
    setError(null);
    setAcuerdos([]);

    void obtenerAcuerdosMiembro(perfilId, filtroActivo)
      .then((respuesta) => {
        if (vigente) setAcuerdos(respuesta);
      })
      .catch((excepcion: unknown) => {
        if (!vigente) return;
        setError(
          excepcion instanceof Error
            ? excepcion.message
            : 'No se pudieron consultar los acuerdos.',
        );
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => { vigente = false; };
  }, [perfilId, filtroActivo, reintento]);

  return (
    <div className="min-h-screen min-w-0 bg-white" data-section="actividad">
      {/* 01. ENCABEZADO: conservamos la disposición de la ventana existente */}
      <header
        data-section="encabezado-actividad"
        className="sticky top-0 z-30 border-b border-[#E8E8E8] bg-white px-4 pb-0 pt-3 lg:pt-6"
      >
        <div className="mx-auto max-w-2xl min-w-0">
          <div className="mb-3 flex items-center gap-3">
            {onVolver && (
              <button type="button" onClick={onVolver} aria-label="Volver"
                className="rounded-full p-1 text-[#0D0D0D] hover:bg-[#F6F6F6] lg:hidden">
                <ArrowLeft size={22} aria-hidden="true" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-[#0D0D0D]"
              style={{ fontFamily: 'Outfit, sans-serif' }}>Actividad</h1>
          </div>
          <nav aria-label="Categorías de actividad" className="flex min-w-0 gap-1 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}>
            {PESTANAS.map(({ etiqueta, filtro }) => {
              const activa = filtroActivo === filtro;
              return (
                <button
                  key={filtro}
                  type="button"
                  onClick={() => setFiltroActivo(filtro)}
                  aria-pressed={activa}
                  className={`relative shrink-0 rounded-t-xl px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] ${
                    activa ? 'text-[#3C9DA0]' : 'text-[#9E9E9E] hover:text-[#737373]'
                  }`}
                >
                  {etiqueta}
                  {activa && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full bg-[#3C9DA0]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 02. ACUERDOS: vienen exactamente del filtro del backend */}
      <main data-section="lista-actividad" className="mx-auto max-w-2xl space-y-3 px-4 py-4">
        {!perfilId ? (
          <div role="status" className="py-16 text-center text-sm text-[#737373]">
            No pudimos identificar el perfil de tu sesión. Vuelve a iniciar sesión.
          </div>
        ) : cargando ? (
          <p role="status" className="py-16 text-center text-sm text-[#737373]">Cargando acuerdos…</p>
        ) : error ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button type="button" onClick={() => setReintento((v) => v + 1)}
              className="mt-3 rounded-xl bg-[#3C9DA0] px-4 py-2 text-sm font-semibold text-white">
              Reintentar
            </button>
          </div>
        ) : acuerdos.length === 0 ? (
          <div role="status" className="py-16 text-center">
            <IconoActividad size={46} strokeWidth={1.5}
              className="mx-auto mb-3 text-[#E8E8E8]" aria-hidden="true" />
            <p className="text-sm font-medium text-[#737373]">{MENSAJES_VACIOS[filtroActivo]}</p>
            {filtroActivo === 'pendientes' && onExplorar && (
              <button type="button" onClick={onExplorar}
                className="mt-4 rounded-xl bg-[#3C9DA0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2D8B8E]">
                Explorar la comunidad
              </button>
            )}
          </div>
        ) : (
          acuerdos.map((acuerdo) => (
            <AcuerdoCard
              key={acuerdo.id}
              acuerdo={acuerdo}
              miembroActualId={perfilId}
              onVerAcuerdo={onVerAcuerdo}
              onIrChat={onIrChat}
            />
          ))
        )}
      </main>
    </div>
  );
}
