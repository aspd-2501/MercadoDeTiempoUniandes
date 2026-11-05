import { clienteApi } from './clienteApi';
import type { PerfilMiembroAPI } from './perfilesMiembro.api';

/** Contrato de las entidades PostAyuda, PostAyudaCategoria y HorarioDisponible del backend. */
export interface CategoriaPostAPI {
  id: string;
  nombre: string;
}

export interface RelacionCategoriaPostAPI {
  idPostAyuda: string;
  idCategoria: string;
  // La búsqueda expande la relación; GET /posts-ayuda/:id NO la expande.
  categoria?: CategoriaPostAPI;
}

export interface HorarioPostAPI {
  id: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface PostAyudaAPI {
  id: string;
  titulo: string;
  descripcion: string;
  horas: number;
  imagen: string | null;
  ofrece: boolean;
  cupo: number;
  cupoLleno: boolean;
  fechaCreacion: string;
  perfilAutor: PerfilMiembroAPI;
  categorias: RelacionCategoriaPostAPI[];
  horariosDisponibles: HorarioPostAPI[];
}

export type TipoBusquedaPost = 'solicitud' | 'ofrecimiento';

/** GET /buscar/posts-ayuda?q=...&tipo=solicitud|ofrecimiento */
export function buscarPostsAyuda(
  consulta?: string,
  tipo?: TipoBusquedaPost,
): Promise<PostAyudaAPI[]> {
  const parametros = new URLSearchParams();
  if (consulta?.trim()) parametros.set('q', consulta.trim());
  if (tipo) parametros.set('tipo', tipo);
  const query = parametros.toString();
  return clienteApi<PostAyudaAPI[]>(`/buscar/posts-ayuda${query ? `?${query}` : ''}`);
}

/** GET /posts-ayuda/:postId */
export function obtenerPostAyuda(postId: string): Promise<PostAyudaAPI> {
  return clienteApi<PostAyudaAPI>(`/posts-ayuda/${encodeURIComponent(postId)}`);
}

/** GET /posts-ayuda/:postId/categorias: devuelve nombres de las categorías. */
export function obtenerCategoriasPost(postId: string): Promise<CategoriaPostAPI[]> {
  return clienteApi<CategoriaPostAPI[]>(
    `/posts-ayuda/${encodeURIComponent(postId)}/categorias`,
  );
}
