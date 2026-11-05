import type { ServicioOfrecidoAPI } from '../../api/serviciosOfrecidos.api';

/**
 * COMPONENTE EXISTENTE: tarjeta de servicio del catálogo.
 * Modelo: ServicioOfrecidoEntity del backend NestJS.
 * No consulta ni filtra: solo presenta la respuesta de la API.
 *
 * Ubicación: src/componentes/servicios/ServicioCard.tsx
 */
export interface ServicioCardProps {
  servicio: ServicioOfrecidoAPI;
  onVerPerfil?: (perfilId: string) => void;
}

export default function ServicioCard({
  servicio,
  onVerPerfil,
}: ServicioCardProps) {
  // 01. PROVEEDOR: llega como relación "perfil" dentro de "servicio".
  const proveedor = servicio.perfil;
  const iniciales = proveedor.nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');

  return (
    <article
      data-section="tarjeta-servicio"
      className="min-w-0 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white transition-[border-color,box-shadow] duration-200 hover:border-[#C9E6E7] hover:shadow-sm"
    >
      {/* 02. IMAGEN DEL SERVICIO, SI EXISTE */}
      {servicio.imagen && (
        <div className="h-36 overflow-hidden bg-[#E8E8E8]">
          <img
            src={servicio.imagen}
            alt={servicio.titulo}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* 03. PROVEEDOR DEL SERVICIO */}
        <div className="mb-2 flex min-w-0 items-center gap-2">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#3C9DA0] text-[10px] font-semibold text-white"
            aria-label={`Avatar de ${proveedor.nombre}`}
          >
            {proveedor.imagen ? (
              <img
                src={proveedor.imagen}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              iniciales
            )}
          </span>
          <span className="truncate text-xs text-[#737373]">
            {proveedor.nombre}
          </span>
        </div>

        {/* 04. TÍTULO Y DESCRIPCIÓN */}
        <h3
          className="text-sm font-bold text-[#0D0D0D]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {servicio.titulo}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-[#737373]">
          {servicio.descripcion}
        </p>

        {/* 05. CATEGORÍAS Y ENLACE AL PERFIL */}
        <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {servicio.categorias.map(({ idCategoria, categoria }) => (
              <span
                key={idCategoria}
                className="max-w-full rounded-full bg-[#E8F5F6] px-2.5 py-1 text-xs font-medium text-[#3C9DA0]"
              >
                {categoria.nombre}
              </span>
            ))}
          </div>

          <button
            type="button"
            disabled={!onVerPerfil}
            onClick={() => onVerPerfil?.(proveedor.id)}
            aria-label={`Ver perfil de ${proveedor.nombre}`}
            className="shrink-0 rounded text-xs font-semibold text-[#3C9DA0] transition-colors hover:text-[#2D8B8E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] disabled:cursor-default disabled:opacity-50"
          >
            Ver perfil →
          </button>
        </div>
      </div>
    </article>
  );
}
