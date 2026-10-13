import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Heart,
  Search,
  UsersRound,
} from 'lucide-react';

// ============================================================================
// 00. TIPOS Y DATOS DE DEMOSTRACIÓN
// Los datos son temporales: todavía no hay consultas ni transferencias reales.
// ============================================================================

type DestinoDonacion = 'comunidad' | 'miembro';

export interface MiembroParaDonacion {
  id: string;
  nombre: string;
  facultad: string;
  colorAvatar?: string;
}

interface DonacionSimulada {
  destino: DestinoDonacion;
  horas: number;
  nombreMiembro?: string;
}

interface DonarHorasProps {
  saldoDisponible?: number;
  miembros?: MiembroParaDonacion[];
}

const MIEMBROS_DEMO: MiembroParaDonacion[] = [
  { id: 'm-101', nombre: 'Daniela Rodríguez', facultad: 'Facultad de Ingeniería', colorAvatar: '#3C9DA0' },
  { id: 'm-102', nombre: 'Andrés Martínez', facultad: 'Facultad de Ciencias Sociales', colorAvatar: '#7655A0' },
  { id: 'm-103', nombre: 'Camila Torres', facultad: 'Facultad de Artes y Humanidades', colorAvatar: '#E3A723' },
  { id: 'm-104', nombre: 'Felipe Gómez', facultad: 'Facultad de Administración', colorAvatar: '#4977B5' },
  { id: 'm-105', nombre: 'Laura Sánchez', facultad: 'Facultad de Medicina', colorAvatar: '#B86583' },
];

const BOTON_ANIMADO =
  'cursor-pointer transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out ' +
  'motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.96] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2 ' +
  'motion-reduce:transition-none disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100';

// Avatar auxiliar utilizado únicamente en la lista y en la confirmación.
function AvatarMiembro({ miembro }: { miembro: MiembroParaDonacion }) {
  const iniciales = miembro.nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: miembro.colorAvatar ?? '#3C9DA0', fontFamily: 'Outfit, sans-serif' }}
    >
      {iniciales}
    </span>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL: DONAR HORAS
// ============================================================================

export default function DonarHoras({
  saldoDisponible = 8,
  miembros = MIEMBROS_DEMO,
}: DonarHorasProps) {
  // 00.1 Estados locales para demostrar la interfaz (sin backend).
  const [horasComunidad, setHorasComunidad] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [idMiembroSeleccionado, setIdMiembroSeleccionado] = useState('');
  const [horasMiembro, setHorasMiembro] = useState(1);
  const [mensaje, setMensaje] = useState('');
  const [confirmacionAbierta, setConfirmacionAbierta] = useState<DestinoDonacion | null>(null);
  const [donacionSimulada, setDonacionSimulada] = useState<DonacionSimulada | null>(null);

  // 00.2 Datos derivados para la visualización.
  const miembrosFiltrados = miembros
    .filter((miembro) => miembro.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
    .slice(0, 5);
  const miembroSeleccionado = miembros.find((miembro) => miembro.id === idMiembroSeleccionado);
  const puedeDonarComunidad = horasComunidad >= 0.5 && horasComunidad <= saldoDisponible;
  const puedeDonarMiembro = Boolean(miembroSeleccionado) && horasMiembro >= 0.5 && horasMiembro <= saldoDisponible;

  // Los botones +/- modifican únicamente los valores mostrados en pantalla.
  function modificarHoras(actuales: number, cambio: number) {
    return Math.max(0.5, Math.min(saldoDisponible, actuales + cambio));
  }

  function confirmarDonacionVisual() {
    if (confirmacionAbierta === 'comunidad' && puedeDonarComunidad) {
      setDonacionSimulada({ destino: 'comunidad', horas: horasComunidad });
    }

    if (confirmacionAbierta === 'miembro' && puedeDonarMiembro && miembroSeleccionado) {
      setDonacionSimulada({
        destino: 'miembro',
        horas: horasMiembro,
        nombreMiembro: miembroSeleccionado.nombre,
      });
    }

    setConfirmacionAbierta(null);
  }

  // ========================================================================
  // 01. PANTALLA DE ÉXITO (DEMOSTRACIÓN VISUAL, SIN TRANSFERENCIA REAL)
  // ========================================================================
  if (donacionSimulada) {
    return (
      <main
        data-section="resultado-donacion"
        className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center"
      >
        {/* 01.1 Ícono de confirmación */}
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F5F6] motion-safe:animate-pulse">
          <Heart size={32} fill="currentColor" className="text-[#3C9DA0]" aria-hidden="true" />
        </div>

        {/* 01.2 Mensaje de resultado */}
        <h1 className="mb-2 text-2xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
          ¡Donación realizada!
        </h1>
        <p className="max-w-xs text-[#737373]">
          {donacionSimulada.destino === 'comunidad'
            ? `Donaste ${donacionSimulada.horas} hora${donacionSimulada.horas !== 1 ? 's' : ''} al fondo comunitario.`
            : `${donacionSimulada.horas} hora${donacionSimulada.horas !== 1 ? 's fueron enviadas' : ' fue enviada'} a ${donacionSimulada.nombreMiembro}.`}
        </p>

        {/* 01.3 Volver al formulario de demostración */}
        <button
          type="button"
          onClick={() => setDonacionSimulada(null)}
          className={`mt-8 rounded-xl bg-[#3C9DA0] px-8 py-3 text-sm font-semibold text-white hover:bg-[#2D8B8E] ${BOTON_ANIMADO}`}
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Volver
        </button>
      </main>
    );
  }

  // ========================================================================
  // 02. PÁGINA PRINCIPAL DE DONACIONES
  // ========================================================================
  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      {/* 02.1 ENCABEZADO: botón visual de regreso y título */}
      <header
        data-section="encabezado-donaciones"
        className="sticky top-0 z-30 border-b border-[#E8E8E8] bg-white px-4 pt-12 pb-4 lg:pt-6"
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            aria-label="Volver (navegación pendiente)"
            title="Navegación pendiente"
            className={`rounded-full p-1 text-[#0D0D0D] hover:bg-[#F6F6F6] ${BOTON_ANIMADO}`}
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
          <h1 className="text-lg font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Donar horas
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg space-y-4 px-4 py-5">
        {/* 03. SALDO DISPONIBLE DEL MIEMBRO */}
        <section
          data-section="saldo-disponible"
          aria-label="Saldo actual"
          className="flex items-center justify-between rounded-2xl bg-[#FFFF00] p-4"
        >
          <div>
            <p className="text-xs font-semibold text-[#5A5A00]">Tu saldo actual</p>
            <p className="text-2xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {saldoDisponible} horas
            </p>
          </div>
          <Clock3 size={28} className="text-[#0D0D0D] opacity-30" aria-hidden="true" />
        </section>

        {/* 04. DONACIÓN AL FONDO COMUNITARIO
        <section
          data-section="donacion-comunidad"
          aria-labelledby="titulo-fondo-comunitario"
          className="overflow-hidden rounded-2xl border-2 border-[#3C9DA0]/30 bg-white"
        >
          {/* 04.1 Encabezado de la tarjeta destacada
          <header className="flex items-center gap-2 bg-[#E8F5F6] px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3C9DA0]">
              <UsersRound size={15} className="text-white" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="titulo-fondo-comunitario" className="text-sm font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Fondo comunitario de horas
              </h2>
              <p className="text-xs font-medium text-[#3C9DA0]">Opción destacada</p>
            </div>
          </header>

          <div className="space-y-4 px-4 py-4">
            {/* 04.2 Descripción del fondo comunitario 
            <p className="text-sm leading-relaxed text-[#737373]">
              Dona horas para apoyar solicitudes de miembros de la comunidad que necesitan créditos de tiempo.
            </p>

            {/* 04.3 Selector de horas para el fondo comunitario 
            <div data-section="selector-horas-comunidad">
              <p className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#737373]">
                Horas a donar
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Restar media hora a la donación comunitaria"
                  onClick={() => setHorasComunidad((horas) => modificarHoras(horas, -0.5))}
                  disabled={horasComunidad <= 0.5}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E8E8E8] bg-white text-xl font-bold text-[#0D0D0D] hover:bg-[#F6F6F6] disabled:opacity-40 ${BOTON_ANIMADO}`}
                >
                  −
                </button>
                <div className="flex-1 text-center" aria-live="polite">
                  <span className="text-3xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {horasComunidad}
                  </span>
                  <span className="ml-1 text-base text-[#737373]">h</span>
                </div>
                <button
                  type="button"
                  aria-label="Sumar media hora a la donación comunitaria"
                  onClick={() => setHorasComunidad((horas) => modificarHoras(horas, 0.5))}
                  disabled={horasComunidad >= saldoDisponible}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E8E8E8] bg-white text-xl font-bold text-[#0D0D0D] hover:bg-[#F6F6F6] disabled:opacity-40 ${BOTON_ANIMADO}`}
                >
                  +
                </button>
              </div>
              {!puedeDonarComunidad && (
                <p className="mt-1 text-center text-xs text-red-500">No tienes suficientes horas</p>
              )}
            </div>

            {/* 04.4 Botón de donación comunitaria
            <button
              type="button"
              onClick={() => setConfirmacionAbierta('comunidad')}
              disabled={!puedeDonarComunidad}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ${
                puedeDonarComunidad
                  ? 'bg-[#3C9DA0] text-white hover:bg-[#2D8B8E]'
                  : 'bg-[#F0F0F0] text-[#9E9E9E]'
              } ${BOTON_ANIMADO}`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <Heart size={16} aria-hidden="true" />
              Donar al fondo comunitario
            </button>
          </div>
        </section> 

        {/* 05. SEPARADOR ENTRE LOS DOS TIPOS DE DONACIÓN 
        <div data-section="separador-donaciones" className="flex items-center gap-3" aria-hidden="true">
          <div className="h-px flex-1 bg-[#E8E8E8]" />
          <span className="text-xs font-medium text-[#9E9E9E]">O dona a un miembro</span>
          <div className="h-px flex-1 bg-[#E8E8E8]" />
        </div>*/}

        {/* 06. DONACIÓN DIRECTA A UN MIEMBRO */}
        <section
          data-section="donacion-miembro"
          aria-label="Donación a un miembro"
          className="space-y-4 rounded-2xl border border-[#E8E8E8] bg-white p-4"
        >
          {/* 06.1 Buscador y lista de miembros */}
          <div data-section="buscador-miembros">
            <label htmlFor="buscar-miembro-donacion" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#737373]">
              Buscar miembro
            </label>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#9E9E9E]" aria-hidden="true" />
              <input
                id="buscar-miembro-donacion"
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Nombre del miembro…"
                className="w-full rounded-xl border border-transparent bg-[#F6F6F6] py-3 pr-4 pl-10 text-sm text-[#0D0D0D] outline-none transition-colors placeholder:text-[#9E9E9E] focus:border-[#3C9DA0]"
              />
            </div>

            {/* 06.2 Resultados del buscador */}
            <div className="mt-2 max-h-44 space-y-1.5 overflow-y-auto">
              {miembrosFiltrados.length === 0 ? (
                <p className="py-3 text-center text-sm text-[#9E9E9E]">No se encontraron miembros</p>
              ) : (
                miembrosFiltrados.map((miembro) => (
                  <button
                    key={miembro.id}
                    type="button"
                    onClick={() => setIdMiembroSeleccionado(miembro.id)}
                    aria-pressed={idMiembroSeleccionado === miembro.id}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                      idMiembroSeleccionado === miembro.id
                        ? 'border-[#3C9DA0] bg-[#E8F5F6]'
                        : 'border-[#E8E8E8] bg-white hover:bg-[#F6F6F6]'
                    } ${BOTON_ANIMADO}`}
                  >
                    <AvatarMiembro miembro={miembro} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#0D0D0D]">{miembro.nombre}</span>
                      <span className="block truncate text-xs text-[#9E9E9E]">{miembro.facultad}</span>
                    </span>
                    {idMiembroSeleccionado === miembro.id && (
                      <CheckCircle2 size={18} strokeWidth={2.5} className="shrink-0 text-[#3C9DA0]" aria-hidden="true" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 06.3 Campos visibles después de seleccionar a un miembro */}
          {miembroSeleccionado && (
            <>
              {/* 06.3.1 Selector de horas para el miembro */}
              <div data-section="selector-horas-miembro">
                <p className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#737373]">
                  Cantidad de horas
                </p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-label="Restar media hora a la donación al miembro"
                    onClick={() => setHorasMiembro((horas) => modificarHoras(horas, -0.5))}
                    disabled={horasMiembro <= 0.5}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E8E8E8] text-xl font-bold text-[#0D0D0D] hover:bg-[#F6F6F6] disabled:opacity-40 ${BOTON_ANIMADO}`}
                  >
                    −
                  </button>
                  <div className="flex-1 text-center" aria-live="polite">
                    <span className="text-3xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {horasMiembro}
                    </span>
                    <span className="ml-1 text-base text-[#737373]">h</span>
                  </div>
                  <button
                    type="button"
                    aria-label="Sumar media hora a la donación al miembro"
                    onClick={() => setHorasMiembro((horas) => modificarHoras(horas, 0.5))}
                    disabled={horasMiembro >= saldoDisponible}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E8E8E8] text-xl font-bold text-[#0D0D0D] hover:bg-[#F6F6F6] disabled:opacity-40 ${BOTON_ANIMADO}`}
                  >
                    +
                  </button>
                </div>
                {!puedeDonarMiembro && (
                  <p className="mt-1 text-center text-xs text-red-500">No tienes suficientes horas</p>
                )}
              </div>

              {/* 06.3.2 Mensaje opcional */}
              <div data-section="mensaje-donacion">
                <label htmlFor="mensaje-donacion" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#737373]">
                  Mensaje (opcional)
                </label>
                <textarea
                  id="mensaje-donacion"
                  value={mensaje}
                  onChange={(event) => setMensaje(event.target.value)}
                  placeholder="Escribe un mensaje para acompañar tu donación…"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#E8E8E8] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#9E9E9E] focus:border-[#3C9DA0]"
                />
              </div>

              {/* 06.3.3 Botón de donación a un miembro */}
              <button
                type="button"
                onClick={() => setConfirmacionAbierta('miembro')}
                disabled={!puedeDonarMiembro}
                className={`w-full rounded-xl py-3 text-sm font-bold ${
                  puedeDonarMiembro
                    ? 'bg-[#3C9DA0] text-white hover:bg-[#2D8B8E]'
                    : 'bg-[#F0F0F0] text-[#9E9E9E]'
                } ${BOTON_ANIMADO}`}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Donar horas
              </button>
            </>
          )}
        </section>
      </main>

      {/* ====================================================================
          07. DIÁLOGO DE CONFIRMACIÓN (SIMULADO, SIN REGISTRAR DONACIÓN)
          ==================================================================== */}
      {confirmacionAbierta && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
          {/* 07.1 Fondo oscuro: permite cerrar el diálogo */}
          <button
            type="button"
            aria-label="Cerrar confirmación"
            onClick={() => setConfirmacionAbierta(null)}
            className="absolute inset-0 cursor-pointer bg-black/40 backdrop-blur-[2px]"
          />

          {/* 07.2 Contenido del diálogo */}
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmacion-donacion"
            data-section="confirmacion-donacion"
            className="relative w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl lg:rounded-2xl"
          >
            {/* Indicador de panel móvil */}
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[#D0D0D0] lg:hidden" aria-hidden="true" />
            <h2
              id="titulo-confirmacion-donacion"
              className="mt-4 mb-2 text-xl font-bold text-[#0D0D0D]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Confirmar donación
            </h2>

            {/* 07.3 Mensaje de confirmación */}
            <p className="mb-5 text-sm text-[#737373]">
              {confirmacionAbierta === 'comunidad' ? (
                <>
                  Vas a donar <strong>{horasComunidad} hora{horasComunidad !== 1 ? 's' : ''}</strong> al fondo comunitario de horas.
                </>
              ) : (
                <>
                  Vas a donar <strong>{horasMiembro} hora{horasMiembro !== 1 ? 's' : ''}</strong> a{' '}
                  <strong>{miembroSeleccionado?.nombre}</strong>.
                </>
              )}
            </p>

            {/* 07.4 Resumen de destino y horas */}
            <div className={`mb-5 flex items-center gap-3 rounded-2xl p-4 ${
              confirmacionAbierta === 'comunidad' ? 'bg-[#E8F5F6]' : 'bg-[#F6F6F6]'
            }`}>
              {confirmacionAbierta === 'comunidad' ? (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3C9DA0]">
                  <UsersRound size={18} className="text-white" aria-hidden="true" />
                </span>
              ) : miembroSeleccionado ? (
                <AvatarMiembro miembro={miembroSeleccionado} />
              ) : null}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0D0D0D]">
                  {confirmacionAbierta === 'comunidad' ? 'Fondo comunitario de horas' : miembroSeleccionado?.nombre}
                </p>
                <p className={`truncate text-xs ${
                  confirmacionAbierta === 'comunidad' ? 'text-[#3C9DA0]' : 'text-[#9E9E9E]'
                }`}>
                  {confirmacionAbierta === 'comunidad' ? 'Banco de Tiempo Uniandes' : miembroSeleccionado?.facultad}
                </p>
              </div>
              <span className="shrink-0 rounded-xl bg-[#FFFF00] px-3 py-1.5 text-sm font-bold text-[#0D0D0D]">
                {confirmacionAbierta === 'comunidad' ? horasComunidad : horasMiembro}h
              </span>
            </div>

            {/* 07.5 Botones de cancelar y confirmar */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmacionAbierta(null)}
                className={`flex-1 rounded-xl border border-[#E8E8E8] py-3 text-sm font-medium text-[#0D0D0D] hover:bg-[#F6F6F6] ${BOTON_ANIMADO}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarDonacionVisual}
                className={`flex-1 rounded-xl bg-[#3C9DA0] py-3 text-sm font-bold text-white hover:bg-[#2D8B8E] ${BOTON_ANIMADO}`}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Confirmar donación
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
