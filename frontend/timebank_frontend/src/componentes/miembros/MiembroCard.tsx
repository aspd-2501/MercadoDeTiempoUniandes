import { Award, CheckCircle2 } from 'lucide-react';
import type { MiembroPublico } from '../../tipos/miembro';

/**
 * TARJETA: resumen público de un miembro para la ventana Explorar.
 * Recibe los datos y la acción de navegación mediante propiedades.
 * No accede a React Router ni consulta directamente los mocks.
 */

// 00. PROPIEDADES DEL COMPONENTE
export interface MiembroCardProps {
  miembro: MiembroPublico;
  onVerPerfil?: (miembroId: string) => void;
}

// 01. AVATAR DEL MIEMBRO
function AvatarMiembro({ miembro }: { miembro: MiembroPublico }) {
  const iniciales = miembro.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join('');

  return (
    <div className="relative h-12 w-12 shrink-0">
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: miembro.avatarColor ?? '#3C9DA0' }}
      >
        {miembro.avatar ? (
          <img
            src={miembro.avatar}
            alt={`Avatar de ${miembro.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden="true">{iniciales}</span>
        )}
      </div>
      {typeof miembro.isAvailable === 'boolean' && (
        <span
          aria-hidden="true"
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
            miembro.isAvailable ? 'bg-green-500' : 'bg-[#9E9E9E]'
          }`}
        />
      )}
    </div>
  );
}

// 02. TARJETA PRINCIPAL
export default function MiembroCard({ miembro, onVerPerfil }: MiembroCardProps) {
  const habilidades = miembro.skills ?? [];
  const reconocimientos = miembro.recognitions ?? [];

  return (
    <button
      type="button"
      onClick={() => onVerPerfil?.(miembro.id)}
      className="w-full min-w-0 cursor-pointer rounded-2xl border border-[#E8E8E8] bg-white p-4 text-left transition-[border-color,box-shadow,transform] duration-200 hover:border-[#3C9DA0] hover:shadow-sm active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]"
      aria-label={`Ver perfil de ${miembro.name}`}
      data-section="tarjeta-miembro"
    >
      {/* 02.1 IDENTIDAD, DESCRIPCIÓN Y DISPONIBILIDAD */}
      <div className="flex min-w-0 items-center gap-3">
        <AvatarMiembro miembro={miembro} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-[#0D0D0D]">
              {miembro.name}
            </span>
            <CheckCircle2 size={14} strokeWidth={2.5} className="shrink-0 text-[#3C9DA0]" aria-hidden="true" />
          </div>

          {miembro.faculty && (
            <p className="mt-0.5 truncate text-xs text-[#737373]">{miembro.faculty}</p>
          )}
          {miembro.bio && (
            <p className="mt-0.5 line-clamp-1 text-xs text-[#9E9E9E]">{miembro.bio}</p>
          )}
        </div>

        {typeof miembro.isAvailable === 'boolean' && (
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
              miembro.isAvailable
                ? 'bg-green-50 text-green-700'
                : 'bg-[#F0F0F0] text-[#9E9E9E]'
            }`}
          >
            {miembro.isAvailable ? 'Disponible' : 'Ocupado'}
          </span>
        )}
      </div>

      {/* 02.2 HABILIDADES: HASTA CUATRO ETIQUETAS */}
      {habilidades.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {habilidades.slice(0, 4).map((habilidad) => (
            <span
              key={habilidad}
              className="rounded-full bg-[#E8F5F6] px-2.5 py-1 text-xs font-medium text-[#3C9DA0]"
            >
              {habilidad}
            </span>
          ))}
          {habilidades.length > 4 && (
            <span className="rounded-full bg-[#F0F0F0] px-2.5 py-1 text-xs text-[#737373]">
              +{habilidades.length - 4}
            </span>
          )}
        </div>
      )}

      {/* 02.3 ESTADÍSTICAS Y ENLACE A PERFIL */}
      <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-[#F0F0F0] pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9E9E9E]">
          {miembro.completedExchanges !== undefined && (
            <span>{miembro.completedExchanges} intercambios</span>
          )}
          {reconocimientos.length > 0 && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Award size={13} className="shrink-0 text-[#D6B200]" aria-hidden="true" />
              <span className="truncate">{reconocimientos[0]}</span>
            </span>
          )}
        </div>
        <span className="ml-auto shrink-0 text-xs font-medium text-[#3C9DA0]">
          Ver perfil →
        </span>
      </div>
    </button>
  );
}
