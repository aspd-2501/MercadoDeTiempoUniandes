import type { MiembroPublico } from '../../tipos/miembro';
import type { ServicioCatalogo } from '../../tipos/servicio';

/**
 * COMPONENTE: Tarjeta de un servicio ofrecido en el catálogo de Explorar.
 *
 * - Recibe el servicio y el miembro que lo ofrece.
 * - No busca datos globales ni tiene mocks propios.
 * - Expone onVerPerfil para conectar la navegación desde la vista padre.
 *
 * Ubicación: src/componentes/servicios/TarjetaServicio.tsx
 */


export interface TarjetaServicioProps {
  servicio: ServicioCatalogo;
  proveedor: MiembroPublico;
  onVerPerfil?: (miembroId: string) => void;
}

export default function TarjetaServicio({
  servicio,
  proveedor,
  onVerPerfil,
}: TarjetaServicioProps) {
  // 01. DATOS DERIVADOS DEL PROVEEDOR
  const iniciales = proveedor.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((nombre) => nombre.charAt(0).toUpperCase())
    .join('');

  return (
    <article
      data-section="tarjeta-servicio"
      className="min-w-0 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white transition-[border-color,box-shadow] duration-200 hover:border-[#C9E6E7] hover:shadow-sm"
    >
      {/* 02. IMAGEN DEL SERVICIO, SI EXISTE */}
      {servicio.imageUrl && (
        <div className="h-36 overflow-hidden bg-[#E8E8E8]">
          <img
            src={servicio.imageUrl}
            alt={servicio.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* 03. MIEMBRO QUE OFRECE EL SERVICIO */}
        <div className="mb-2 flex min-w-0 items-center gap-2">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-semibold text-white"
            style={{ backgroundColor: proveedor.avatarColor ?? '#3C9DA0' }}
            aria-label={`Avatar de ${proveedor.name}`}
          >
            {proveedor.avatar ? (
              <img src={proveedor.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              iniciales
            )}
          </span>
          <span className="truncate text-xs text-[#737373]">{proveedor.name}</span>
        </div>

        {/* 04. TÍTULO Y DESCRIPCIÓN DEL SERVICIO */}
        <h3
          className="text-sm font-bold text-[#0D0D0D]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {servicio.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-[#737373]">
          {servicio.description}
        </p>

        {/* 05. CATEGORÍA, DURACIÓN Y ENLACE AL PERFIL */}
        <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="max-w-full rounded-full bg-[#E8F5F6] px-2.5 py-1 text-xs font-medium text-[#3C9DA0]">
              {servicio.category}
            </span>
            <span className="whitespace-nowrap text-xs text-[#9E9E9E]">
              {servicio.estimatedHours} h
            </span>
          </div>

          <button
            type="button"
            disabled={!onVerPerfil}
            onClick={() => onVerPerfil?.(proveedor.id)}
            aria-label={`Ver perfil de ${proveedor.name}`}
            className="shrink-0 rounded text-xs font-semibold text-[#3C9DA0] transition-colors hover:text-[#2D8B8E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] disabled:cursor-default"
          >
            Ver perfil →
          </button>
        </div>
      </div>
    </article>
  );
}
