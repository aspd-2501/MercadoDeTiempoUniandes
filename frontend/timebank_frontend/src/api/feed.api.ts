import { clienteApi } from './clienteApi';

/** Contrato literal de PublicacionFeed, PaginaFeed y FiltrosFeed (NestJS). */
export type TipoPublicacionFeed = 'POST_AYUDA' | 'POST_COMUNITARIO' | 'CAUSA';

export interface AutorFeedAPI {
  id: string;
  nombre: string;
  imagen: string;
  activo: boolean;
}

export interface PublicacionFeedAPI {
  tipo: TipoPublicacionFeed;
  id: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  fecha: string;
  autor: AutorFeedAPI | null;
  categorias: string[];
  relevante: boolean;
  ofrece?: boolean;
}

export interface PaginaFeedAPI {
  publicaciones: PublicacionFeedAPI[];
  pagina: number;
  tamano: number;
  hayMas: boolean;
}

export interface FiltrosFeedAPI {
  perfilId?: string;
  categoria?: string;
  q?: string;
  pagina?: number;
  tamano?: number;
}

/** GET /feed?perfilId=...&categoria=...&q=...&pagina=1&tamano=10 */
export function obtenerFeed(filtros: FiltrosFeedAPI = {}): Promise<PaginaFeedAPI> {
  const query = new URLSearchParams();
  if (filtros.perfilId) query.set('perfilId', filtros.perfilId);
  if (filtros.categoria && filtros.categoria !== 'Todo') {
    query.set('categoria', filtros.categoria);
  }
  if (filtros.q?.trim()) query.set('q', filtros.q.trim());
  if (filtros.pagina !== undefined) query.set('pagina', String(filtros.pagina));
  if (filtros.tamano !== undefined) query.set('tamano', String(filtros.tamano));
  const parametros = query.toString();
  return clienteApi<PaginaFeedAPI>(`/feed${parametros ? `?${parametros}` : ''}`);
}

/** GET /categorias: nombres reales disponibles en la base de datos. */
export interface CategoriaAPI {
  id: string;
  nombre: string;
}

export function obtenerCategoriasFeed(): Promise<CategoriaAPI[]> {
  return clienteApi<CategoriaAPI[]>('/categorias');
}
