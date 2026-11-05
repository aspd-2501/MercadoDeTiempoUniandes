import { clienteApi } from './clienteApi';
import type { PerfilMiembroAPI } from './perfilesMiembro.api';

/**
 * Contrato de lectura del backend NestJS.
 * Fuente: ServicioOfrecidoEntity, ServicioOfrecidoCategoriaEntity
 * y BusquedaService.buscarServicios() de src.zip.
 *
 * Se preservan los nombres de los campos del backend; NO se inventa
 * una duración estimada, porque ServicioOfrecidoEntity no la tiene.
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
 * GET /api/v1/buscar/servicios?q=...
 *
 * El backend hace la búsqueda, elimina servicios invisibles y
 * ordena alfabéticamente. No hay paginación en el endpoint actual.
 */
export function buscarServicios(
  consulta?: string,
): Promise<ServicioOfrecidoAPI[]> {
  const parametros = new URLSearchParams();
  const texto = consulta?.trim();

  if (texto) {
    parametros.set('q', texto); // Nombre exacto del @Query('q') del controller
  }

  const query = parametros.toString();
  const ruta = `/buscar/servicios${query ? `?${query}` : ''}`;

  return clienteApi<ServicioOfrecidoAPI[]>(ruta);
}
