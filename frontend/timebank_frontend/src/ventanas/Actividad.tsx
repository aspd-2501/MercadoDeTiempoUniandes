import { useState } from 'react';
import { Activity as IconoActividad, ArrowLeft } from 'lucide-react';

import AcuerdoCard from '../componentes/acuerdos/AcuerdoCard';
import { useMiembroSesion } from '../contextos/MiembroSesionContext';
import { ACUERDOS_PARA_DETALLE_DEMO } from '../mocks/acuerdosPost.mocks';
import type { AcuerdoServicio } from '../tipos/acuerdo';

/**
 * VISTA: Actividad personal del Banco de Tiempo.
 *
 * - Usa el mismo conjunto de acuerdos que AcuerdoDetail.
 * - No aprueba participantes: un miembro se incorpora al pulsar participar.
 * - Las pestañas solamente clasifican datos para presentarlos.
 * - El backend será responsable de entregar únicamente los acuerdos
 *   autorizados del miembro, con sus estados ya establecidos.
 *
 * Ubicación: src/ventanas/Actividad.tsx
 */

// ──────────────────── 00. PESTAÑAS Y PROPIEDADES ────────────────────
type PestanaActividad = 'Pendientes' | 'Completados' | 'Solicitudes' | 'Expirados';
const PESTANAS: PestanaActividad[] = ['Pendientes', 'Completados', 'Solicitudes', 'Expirados'];

export interface ActividadProps {
  /** Colección proporcionada por API o mock; no se modifica en la vista. */
  acuerdos?: Record<string, AcuerdoServicio>;
  onVolver?: () => void;
  onVerAcuerdo?: (acuerdoId: string) => void;
  onIrChat?: (chatId: string) => void;
  onExplorar?: () => void;
}

function EstadoVacio({
  pestana,
  onExplorar,
}: {
  pestana: PestanaActividad;
  onExplorar?: () => void;
}) {
  const mensajes: Record<PestanaActividad, string> = {
    Pendientes: 'Aún no tienes acuerdos en curso.',
    Completados: 'Aún no has completado ningún intercambio.',
    Solicitudes: 'No hay solicitudes para mostrar.',
    Expirados: 'No tienes acuerdos expirados.',
  };

  return (
    <div className="py-16 text-center" role="status">
      <IconoActividad size={46} strokeWidth={1.5} className="mx-auto mb-3 text-[#E8E8E8]" aria-hidden="true" />
      <p className="text-sm font-medium text-[#737373]">{mensajes[pestana]}</p>
      {pestana === 'Solicitudes' && (
        <p className="mx-auto mt-2 max-w-xs text-xs text-[#9E9E9E]">
          La visualización de solicitudes directas se conectará cuando tengamos sus datos.
        </p>
      )}
      {pestana === 'Pendientes' && onExplorar && (
        <button
          type="button"
          onClick={onExplorar}
          className="mt-4 rounded-xl bg-[#3C9DA0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2D8B8E]"
        >
          Explorar la comunidad
        </button>
      )}
    </div>
  );
}

// ──────────────────── 01. VENTANA PRINCIPAL ────────────────────
export default function Actividad({
  acuerdos = ACUERDOS_PARA_DETALLE_DEMO,
  onVolver,
  onVerAcuerdo,
  onIrChat,
  onExplorar,
}: ActividadProps) {
  const { miembro } = useMiembroSesion();
  const [pestanaActiva, setPestanaActiva] = useState<PestanaActividad>('Pendientes');

  // 01.1 PRESENTAR LOS ACUERDOS DEL MIEMBRO AUTENTICADO EN EL MOCK.
  // La API futura deberá hacer este control en el servidor.
  const acuerdosPropios = Object.values(acuerdos).filter((acuerdo) =>
    acuerdo.proveedorId === miembro.id ||
    acuerdo.solicitanteId === miembro.id ||
    (acuerdo.otrosParticipantesIds ?? []).includes(miembro.id)
  );

  // 01.2 DISTRIBUCIÓN VISUAL POR PESTAÑAS.
  // 'Pendientes' incluye acuerdos aún por definir y acuerdos aceptados
  // que siguen activos, con o sin propuesta de modificación pendiente.
  const acuerdosPendientes = acuerdosPropios.filter(
    (acuerdo) => acuerdo.estado === 'pending' || acuerdo.estado === 'accepted',
  );
  const acuerdosCompletados = acuerdosPropios.filter(
    (acuerdo) => acuerdo.estado === 'completed',
  );
  const acuerdosExpirados = acuerdosPropios.filter(
    (acuerdo) => acuerdo.estado === 'expired',
  );

  const acuerdosPorPestana: Record<PestanaActividad, AcuerdoServicio[]> = {
    Pendientes: acuerdosPendientes,
    Completados: acuerdosCompletados,
    Solicitudes: [], // No inventamos un modelo de solicitudes directas.
    Expirados: acuerdosExpirados,
  };
  const elementos = acuerdosPorPestana[pestanaActiva];

  return (
    <div className="min-h-screen min-w-0 bg-white" data-section="actividad">
      {/* 02. ENCABEZADO Y PESTAÑAS */}
      <header className="sticky top-0 z-30 border-b border-[#E8E8E8] bg-white px-4 pb-0 pt-3 lg:pt-6" data-section="encabezado-actividad">
        <div className="mx-auto max-w-2xl min-w-0">
          <div className="mb-3 flex items-center gap-3">
            {onVolver && (
              <button
                type="button"
                onClick={onVolver}
                aria-label="Volver"
                className="rounded-full p-1 text-[#0D0D0D] hover:bg-[#F6F6F6] lg:hidden"
              >
                <ArrowLeft size={22} aria-hidden="true" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Actividad
            </h1>
          </div>
          <nav aria-label="Categorías de actividad" className="flex min-w-0 gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {PESTANAS.map((pestana) => {
              const activa = pestanaActiva === pestana;
              return (
                <button
                  key={pestana}
                  type="button"
                  onClick={() => setPestanaActiva(pestana)}
                  aria-current={activa ? 'page' : undefined}
                  className={`relative shrink-0 rounded-t-xl px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] ${
                    activa ? 'text-[#3C9DA0]' : 'text-[#9E9E9E] hover:text-[#737373]'
                  }`}
                >
                  {pestana}
                  {pestana === 'Pendientes' && acuerdosPendientes.length > 0 && (
                    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3C9DA0] px-1 text-[10px] font-bold text-white">
                      {acuerdosPendientes.length}
                    </span>
                  )}
                  {activa && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full bg-[#3C9DA0]" />}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 03. ACUERDOS DE LA PESTAÑA SELECCIONADA */}
      <main className="mx-auto max-w-2xl space-y-3 px-4 py-4" data-section="lista-actividad">
        {elementos.length === 0 ? (
          <EstadoVacio pestana={pestanaActiva} onExplorar={onExplorar} />
        ) : (
          elementos.map((acuerdo) => (
            <AcuerdoCard
              key={acuerdo.id}
              acuerdo={acuerdo}
              miembroActualId={miembro.id}
              onVerAcuerdo={onVerAcuerdo}
              onIrChat={onIrChat}
            />
          ))
        )}
      </main>
    </div>
  );
}
