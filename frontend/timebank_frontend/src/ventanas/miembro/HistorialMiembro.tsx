import { useEffect, useState } from 'react';
import { obtenerMovimientos, type MovimientoAPI } from '../../api/perfilResumen.api';
import { useMiembroSesion } from '../../contextos/MiembroSesionContext';
import {
  ArrowLeft,
  Award,
  Clock,
  Heart,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * VISTA: Historial de horas de un miembro del Banco de Tiempo.
 *
 * Migración visual del mockup de Figma a React + TypeScript.
 * Los movimientos del miembro autenticado se obtienen del backend.
 *
 * Organización:
 * 01. Encabezado y saldo
 * 02. Resumen de horas ganadas y gastadas
 * 03. Acciones visuales
 * 04. Historial de movimientos
 */

// ─────────────────────────── TIPOS DE DATOS ───────────────────────────
type TipoMovimiento =
  | 'earned'
  | 'spent'
  | 'donated'
  | 'community'
  | 'received-donation';

export interface MovimientoHistorial {
  id: string;
  type: TipoMovimiento;
  amount: number;
  description: string;
  createdAt: string;
}

interface HistorialMiembroProps {
  transactions?: MovimientoHistorial[];
  onDonarHoras: () => void;
}

// Adaptación de tipos de transacción: signo y orden provienen del backend.
function mapearMovimiento(m: MovimientoAPI): MovimientoHistorial {
  const tipos: Record<MovimientoAPI['tipo'], TipoMovimiento> = {
    SERVICIO_RECIBIDO: 'spent', SERVICIO_PRESTADO: 'earned', APORTE_FONDO: 'community',
    DONACION_ENVIADA: 'donated', DONACION_RECIBIDA: 'received-donation',
  };
  const etiquetas: Record<MovimientoAPI['tipo'], string> = {
    SERVICIO_RECIBIDO: 'Servicio recibido', SERVICIO_PRESTADO: 'Servicio prestado',
    APORTE_FONDO: 'Aporte al fondo comunitario', DONACION_ENVIADA: 'Donación enviada',
    DONACION_RECIBIDA: 'Donación recibida',
  };
  return {
    id: m.id, type: tipos[m.tipo], amount: m.horas,
    description: etiquetas[m.tipo],
    createdAt: new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(m.fecha)),
  };
}

// ────────────────────── ESTILOS DE LOS MOVIMIENTOS ──────────────────────
// Centralizamos los íconos y colores para evitar condicionales largos en el JSX.
const ESTILOS_MOVIMIENTO: Record<
  TipoMovimiento,
  { Icono: LucideIcon; fondo: string; color: string }
> = {
  earned: {
    Icono: TrendingUp,
    fondo: 'bg-green-50',
    color: 'text-green-600',
  },
  spent: {
    Icono: Clock,
    fondo: 'bg-red-50',
    color: 'text-red-500',
  },
  donated: {
    Icono: Heart,
    fondo: 'bg-pink-50',
    color: 'text-pink-500',
  },
  community: {
    Icono: Users,
    fondo: 'bg-[#E8F5F6]',
    color: 'text-[#3C9DA0]',
  },
  'received-donation': {
    Icono: Award,
    fondo: 'bg-[#FFF9C4]',
    color: 'text-[#F57F17]',
  },
};

// ───────────────────────── COMPONENTE PRINCIPAL ─────────────────────────
export default function HistorialMiembro({
  transactions,
  onDonarHoras
}: HistorialMiembroProps) {
  // 00. MIEMBRO AUTENTICADO
  const { perfil } = useMiembroSesion();
  const balance = perfil?.saldo ?? 0;
  const [transaccionesApi, setTransaccionesApi] = useState<MovimientoHistorial[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (transactions !== undefined || !perfil?.id) return;
    let vigente = true;
    setCargando(true); setError(null);
    void obtenerMovimientos(perfil.id)
      .then(res => { if (vigente) setTransaccionesApi(res.map(mapearMovimiento)); })
      .catch(e => { if (vigente) setError(e instanceof Error ? e.message : 'Error consultando tus movimientos.'); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [perfil?.id, transactions, revision]);
  const movimientos = transactions ?? transaccionesApi;

  // Totales calculados a partir de los movimientos del backend (o props explícitas).
  const totalEarned = movimientos
    .filter((tx) => ['earned', 'received-donation'].includes(tx.type))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalSpent = movimientos
    .filter((tx) => ['spent', 'donated', 'community'].includes(tx.type))
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      {/* ============================================================
          01. ENCABEZADO: botón de regreso y saldo disponible
          ============================================================ */}
      <header
        data-section="encabezado-historial"
        className="relative overflow-hidden bg-[#3C9DA0] px-4 pt-12 pb-20 lg:pt-8"
      >
        {/* 01.1 Fondo decorativo del banner */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 80% 20%, #FFFF00 0%, transparent 50%)',
          }}
        />

        <div className="relative mx-auto max-w-2xl">
          {/* 01.2 Regresar y título de la pantalla */}
          <div data-section="titulo-historial" className="mb-6 flex items-center gap-3">
            <h1
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Mis Movimientos
            </h1>
          </div>

          {/* 01.3 Saldo disponible del miembro */}
          <div data-section="saldo-disponible" className="text-center">
            <p className="mb-1 text-sm font-medium text-white/70">Saldo disponible</p>
            <div
              className="mb-1 text-5xl font-bold text-white"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {balance}
            </div>
            <p className="text-lg font-medium text-white/80">horas</p>
          </div>

          {/* ============================================================
              02. ESTADÍSTICAS: horas ganadas y gastadas
              ============================================================ */}
          <section
            data-section="resumen-horas"
            aria-label="Resumen de horas"
            className="mt-6 grid grid-cols-2 gap-3"
          >
            {/* 02.1 Horas ganadas */}
            <div className="rounded-xl bg-white/20 p-3 text-center">
              <p className="text-xs text-white/70">Ganadas</p>
              <p
                className="text-xl font-bold text-white"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                +{totalEarned}
              </p>
            </div>

            {/* 02.2 Horas gastadas */}
            <div className="rounded-xl bg-white/20 p-3 text-center">
              <p className="text-xs text-white/70">Gastadas</p>
              <p
                className="text-xl font-bold text-white"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                -{totalSpent}
              </p>
            </div>
          </section>
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-10 max-w-2xl px-4">
        {/* ============================================================
            03. TARJETA DE ACCIONES: botones visuales sin navegación
            ============================================================ */}
        <section
          data-section="acciones-horas"
          aria-label="Acciones sobre horas"
          className="mb-4 rounded-2xl border border-[#E8E8E8] bg-white p-4 shadow-sm"
        >
          <div className="flex gap-2">
            {/* 03.1 Donar horas */}
            <button
              type="button"
              className="btn-press flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFFF00] py-3 text-sm font-bold text-[#0D0D0D]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
              onClick={onDonarHoras}
            >
              <Heart size={16} strokeWidth={2.5} aria-hidden="true" />
              Donar horas
            </button>

            {/* 03.2 Pedir horas
            <button<button
              type="button"
              className="btn-press flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3C9DA0] py-3 text-sm font-bold text-white"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
              Pedir horas
            </button>
             */}

            </div>
        </section>
            

        {/* ============================================================
            04. HISTORIAL: lista de movimientos de horas
            ============================================================ */}
        <section
          data-section="historial-movimientos"
          aria-labelledby="titulo-movimientos"
          className="mb-6 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white"
        >
          {/* 04.1 Encabezado de la lista */}
          <header className="border-b border-[#F0F0F0] px-4 py-3">
            <h2
              id="titulo-movimientos"
              className="text-sm font-bold text-[#0D0D0D]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Historial de movimientos
            </h2>
          </header>

          {/* 04.2 Registros del historial */}
          <ul data-section="lista-movimientos" className="list-none p-0 m-0">
            {cargando && <li className="p-4 text-sm text-[#737373]" role="status">Cargando movimientos…</li>}
            {error && <li className="p-4 text-sm text-red-600" role="alert">{error} <button type="button" onClick={() => setRevision(v => v + 1)} className="underline">Reintentar</button></li>}
            {!cargando && !error && movimientos.length === 0 && <li className="p-4 text-sm text-[#737373]">Aún no tienes movimientos de horas.</li>}
            {movimientos.map((tx, index) => {
              const isPositive = tx.amount > 0;
              const { Icono, fondo, color } = ESTILOS_MOVIMIENTO[tx.type];

              return (
                <li
                  key={tx.id}
                  data-section="movimiento"
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    index < movimientos.length - 1
                      ? 'border-b border-[#F0F0F0]'
                      : ''
                  }`}
                >
                  {/* 04.2.1 Ícono según el tipo de movimiento */}
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${fondo}`}
                  >
                    <Icono size={16} className={color} aria-hidden="true" />
                  </div>

                  {/* 04.2.2 Descripción y fecha */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-[#0D0D0D]">
                      {tx.description}
                    </p>
                    <p className="mt-0.5 text-xs text-[#9E9E9E]">{tx.createdAt}</p>
                  </div>

                  {/* 04.2.3 Cantidad de horas (+/-) */}
                  <div className="flex-shrink-0 text-right">
                    <div
                      className={`flex items-center gap-1 text-sm font-bold ${
                        isPositive ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      <span className="text-base" aria-hidden="true">
                        {isPositive ? '↑' : '↓'}
                      </span>
                      <span style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {isPositive ? '+' : ''}{tx.amount} h
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
