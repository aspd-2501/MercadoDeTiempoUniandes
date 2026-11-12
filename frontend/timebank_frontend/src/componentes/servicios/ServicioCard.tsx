import type { ResultadoServicioAPI } from '../../api/serviciosOfrecidos.api';

/**
 * Tarjeta existente de Explorar > Servicios.
 * Presenta exactamente la respuesta de GET /buscar/servicios.
 * La navegación distingue entre un post de ofrecimiento y un servicio
 * de organización, cuyos identificadores corresponden a entidades distintas.
 */
export interface ServicioCardProps {
  servicio: ResultadoServicioAPI;
  onVerPerfil?: (perfilId: string) => void;
  onVerDetallePost?: (postId: string) => void;
}

export default function ServicioCard({
  servicio,
  onVerPerfil,
  onVerDetallePost,
}: ServicioCardProps) {
  const autor = servicio.autor;
  const nombreAutor = autor?.nombre?.trim() || 'Autor no disponible';
  const iniciales = nombreAutor
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');

  const esOfrecimiento = servicio.tipo === 'POST_OFRECIMIENTO';

  return (
    <article
      data-section="tarjeta-servicio"
      className="min-w-0 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white transition-[border-color,box-shadow] duration-200 hover:border-[#C9E6E7] hover:shadow-sm"
    >
      {/* 01. IMAGEN DEL SERVICIO, SI EXISTE */}
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
        {/* 02. AUTOR Y TIPO DE RESULTADO */}
        <div className="mb-2 flex min-w-0 items-center gap-2">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#3C9DA0] text-[10px] font-semibold text-white"
            aria-label={`Avatar de ${nombreAutor}`}
          >
            {autor?.imagen ? (
              <img src={autor.imagen} alt="" className="h-full w-full object-cover" />
            ) : (
              iniciales
            )}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-[#737373]">
            {nombreAutor}
          </span>
          <span className="shrink-0 rounded-full bg-[#F6F6F6] px-2 py-1 text-[10px] font-medium text-[#737373]">
            {esOfrecimiento ? 'Ofrecimiento' : 'Organización'}
          </span>
        </div>

        {/* 03. TÍTULO, DESCRIPCIÓN Y DURACIÓN (SOLO POSTS) */}
        <h3
          className="text-sm font-bold text-[#0D0D0D]"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {servicio.titulo}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-[#737373]">
          {servicio.descripcion}
        </p>
        {esOfrecimiento && servicio.horas !== null && (
          <p className="mt-2 text-xs font-medium text-[#737373]">
            Duración: {servicio.horas} {servicio.horas === 1 ? 'hora' : 'horas'}
          </p>
        )}

        {/* 04. CATEGORÍAS Y ACCIONES */}
        <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {servicio.categorias.map((categoria, indice) => (
              <span
                key={`${categoria}-${indice}`}
                className="max-w-full rounded-full bg-[#E8F5F6] px-2.5 py-1 text-xs font-medium text-[#3C9DA0]"
              >
                {categoria}
              </span>
            ))}
          </div>

          <div className="ml-auto flex shrink-0 flex-wrap items-center gap-3">
            {esOfrecimiento && onVerDetallePost && (
              <button
                type="button"
                onClick={() => onVerDetallePost(servicio.id)}
                className="rounded text-xs font-semibold text-[#3C9DA0] transition-colors hover:text-[#2D8B8E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]"
              >
                Ver publicación →
              </button>
            )}
            {autor && onVerPerfil && (
              <button
                type="button"
                onClick={() => onVerPerfil(autor.id)}
                aria-label={`Ver perfil de ${nombreAutor}`}
                className="rounded text-xs font-semibold text-[#3C9DA0] transition-colors hover:text-[#2D8B8E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0]"
              >
                Ver perfil →
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
