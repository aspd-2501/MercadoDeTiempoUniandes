import { clienteApi } from './clienteApi';
import type { PerfilMiembroAPI } from './perfilesMiembro.api';

/**
 * Entidad ServicioOfrecidoEntity. Se conserva este tipo para los lugares
 * que consulten servicios ofrecidos directamente, fuera de Explorar.
 * NO representa la respuesta de GET /buscar/servicios.
 */
export interface CategoriaServicioOfrecidoAPI {
  idServicio: string;
  idCategoria: string;
  categoria: {
    id: string;
    nombre: string;
  };
}

export type ProveedorServicioOfrecidoAPI = Pick<
  PerfilMiembroAPI,
  'id' | 'nombre' | 'imagen' | 'estadoActividad'
>;

export interface ServicioOfrecidoAPI {
  id: string;
  titulo: string;
  descripcion: string;
  imagen: string | null;
  visible: boolean;
  perfil: ProveedorServicioOfrecidoAPI;
  categorias: CategoriaServicioOfrecidoAPI[];
}

/**
 * Contrato real de BusquedaService.buscarServicios() en el backend actualizado.
 * El endpoint reúne:
 *   - POST_OFRECIMIENTO: publicaciones de ayuda que ofrecen un servicio.
 *   - SERVICIO_ORGANIZACION: servicios visibles de organizaciones.
 * Las categorías llegan como nombres (string[]), no como relaciones.
 */
export interface AutorResultadoServicioAPI {
  id: string; // UUID del perfil miembro autor
  nombre: string;
  imagen: string;
  esOrganizacion: boolean;
  perfilOrganizacionId: string | null;
}

export interface ResultadoServicioAPI {
  tipo: 'POST_OFRECIMIENTO' | 'SERVICIO_ORGANIZACION';
  id: string; // UUID de post o de servicio, dependiendo de tipo
  titulo: string;
  descripcion: string;
  imagen: string | null;
  horas: number | null;
  categorias: string[];
  autor: AutorResultadoServicioAPI | null;
}

/**
 * GET /api/v1/buscar/servicios?q=...
 * No aplica filtros en el frontend: el backend decide qué se publica.
 */
export function buscarServicios(consulta?: string): Promise<ResultadoServicioAPI[]> {
  const parametros = new URLSearchParams();
  const texto = consulta?.trim();

  if (texto) {
    parametros.set('q', texto);
  }

  const query = parametros.toString();
  const ruta = `/buscar/servicios${query ? `?${query}` : ''}`;

  return clienteApi<ResultadoServicioAPI[]>(ruta);
}

/** Gestión de servicios del perfil propio (no confundir con /buscar/servicios). */
export function actualizarServicioOfrecido(id: string, datos: {
  titulo: string; descripcion: string; visible: boolean; perfilId: string; imagen?: string;
}) {
  return clienteApi<ServicioOfrecidoAPI>(`/servicios-ofrecidos/${encodeURIComponent(id)}`, {
    metodo: 'PUT', datos,
  });
}
export function eliminarServicioOfrecido(id: string) {
  return clienteApi<void>(`/servicios-ofrecidos/${encodeURIComponent(id)}`, { metodo: 'DELETE' });
}
export function crearServicioOfrecido(datos: {
  titulo: string; descripcion: string; visible: boolean; perfilId: string; categoriaIds: string[];
  imagen?: string;
}) {
  return clienteApi<ServicioOfrecidoAPI>('/servicios-ofrecidos', { metodo: 'POST', datos });
}
