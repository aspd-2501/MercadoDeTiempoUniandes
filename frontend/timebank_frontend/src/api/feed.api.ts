import { clienteApi } from './clienteApi';
import type { PostAyudaAPI } from './postsAyuda.api';

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
  /** Solo en POST_AYUDA: el post completo (horas, cupo, categorías y franjas). */
  postAyuda?: PostAyudaAPI;
}

export interface PaginaFeedAPI {
  publicaciones: PublicacionFeedAPI[];
  pagina: number;
  tamano: number;
  hayMas: boolean;
  /** Se envía como `despues` para pedir la siguiente tanda; null cuando no hay más. */
  siguienteCursor: string | null;
}

export interface FiltrosFeedAPI {
  perfilId?: string;
  categoria?: string;
  q?: string;
  pagina?: number;
  tamano?: number;
  /** Cursor de la última tanda cargada (siguienteCursor). Si llega, se ignora `pagina`. */
  despues?: string;
}

/** GET /feed?perfilId=...&categoria=...&q=...&tamano=10&despues=<siguienteCursor> */
export function obtenerFeed(filtros: FiltrosFeedAPI = {}): Promise<PaginaFeedAPI> {
  const query = new URLSearchParams();
  if (filtros.perfilId) query.set('perfilId', filtros.perfilId);
  if (filtros.categoria && filtros.categoria !== 'Todo') {
    query.set('categoria', filtros.categoria);
  }
  if (filtros.q?.trim()) query.set('q', filtros.q.trim());
  if (filtros.pagina !== undefined) query.set('pagina', String(filtros.pagina));
  if (filtros.tamano !== undefined) query.set('tamano', String(filtros.tamano));
  if (filtros.despues) query.set('despues', filtros.despues);
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
