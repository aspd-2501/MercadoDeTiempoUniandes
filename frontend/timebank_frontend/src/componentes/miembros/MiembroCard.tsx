import type { PerfilMiembroAPI } from '../../api/perfilesMiembro.api';

/**
 * TARJETA DE PERFIL REAL.
 * Recibe exactamente los campos definidos por la API de perfiles de NestJS.
 */
export interface MiembroCardProps {
  miembro: PerfilMiembroAPI;
  onVerPerfil?: (perfilId: string) => void;
  habilitarDetalle?: boolean;
}

export default function MiembroCard({
  miembro,
  onVerPerfil,
  habilitarDetalle = false,
}: MiembroCardProps) {
  const iniciales = miembro.nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join('');
  const permiteDetalle = habilitarDetalle && Boolean(onVerPerfil);

  return (
    <button
      type="button"
      disabled={!permiteDetalle}
      onClick={() => onVerPerfil?.(miembro.id)}
      aria-label={`Ver perfil de ${miembro.nombre}`}
      data-section="tarjeta-miembro"
      className={`w-full min-w-0 rounded-2xl border border-[#E8E8E8] bg-white p-4 text-left transition-[border-color,box-shadow,transform] duration-200 ${
        permiteDetalle
          ? 'cursor-pointer hover:border-[#3C9DA0] hover:shadow-sm active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]'
          : 'cursor-default'
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        {/* 01. Imagen desde el campo imagen; iniciales como alternativa */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#3C9DA0] text-sm font-bold text-white">
          {miembro.imagen ? (
            <img
              src={miembro.imagen}
              alt={`Foto de ${miembro.nombre}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span aria-hidden="true">{iniciales}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {miembro.afiliacionUniandes && (
            <p className="mt-0.5 text-xs text-[#737373]">
              {miembro.afiliacionUniandes}
            </p>
          )}
          {miembro.descripcion && (
            <p className="mt-1 line-clamp-2 text-xs text-[#737373]">
              {miembro.descripcion}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0F0F0] pt-3 text-xs text-[#9E9E9E]">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {typeof miembro.edad === 'number' && <span>{miembro.edad} años</span>}
          {typeof miembro.saldo === 'number' && (
            <span>{miembro.saldo} {miembro.saldo === 1 ? 'crédito' : 'créditos'} de tiempo</span>
          )}
        </div>
        {permiteDetalle && (
          <span className="ml-auto font-medium text-[#3C9DA0]">Ver perfil →</span>
        )}
      </div>
    </button>
  );
}
