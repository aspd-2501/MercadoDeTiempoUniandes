import { clienteApi } from './clienteApi';
import type { PerfilMiembroAPI } from './perfilesMiembro.api';

// Contratos de respuesta basados en las entidades y controladores reales de NestJS.
// Son DTOs de lectura en el frontend: no añaden atributos que no existan en backend.

export interface CategoriaAPI {
  id: string;
  nombre: string;
}

export interface CategoriaServicioAPI {
  idServicio: string;
  idCategoria: string;
  categoria?: CategoriaAPI;
}

export interface ServicioOfrecidoAPI {
  id: string;
  titulo: string;
  descripcion: string;
  imagen: string | null;
  visible: boolean;
  categorias?: CategoriaServicioAPI[];
}

export interface ReconocimientoAPI {
  id: string;
  nombre: string;
  descripcion: string;
  requerimiento: string;
  icono: string;
}

export interface ReconocimientoOtorgadoAPI {
  id: string;
  fecha: string;
  reconocimiento: ReconocimientoAPI;
}

// GET /perfiles-miembro/:perfilId
export function obtenerPerfilPorId(perfilId: string): Promise<PerfilMiembroAPI> {
  return clienteApi<PerfilMiembroAPI>(
    `/perfiles-miembro/${encodeURIComponent(perfilId)}`,
  );
}

// GET /perfiles-miembro/:perfilId/intereses
export function obtenerInteresesPerfil(perfilId: string): Promise<CategoriaAPI[]> {
  return clienteApi<CategoriaAPI[]>(
    `/perfiles-miembro/${encodeURIComponent(perfilId)}/intereses`,
  );
}

// GET /perfiles-miembro/:perfilId/servicios-ofrecidos
// Por defecto, el backend no devuelve los servicios ocultos.
export function obtenerServiciosVisiblesPerfil(
  perfilId: string,
): Promise<ServicioOfrecidoAPI[]> {
  return clienteApi<ServicioOfrecidoAPI[]>(
    `/perfiles-miembro/${encodeURIComponent(perfilId)}/servicios-ofrecidos`,
  );
}

// GET /reconocimientos/perfiles/:perfilId/otorgamientos
export function obtenerReconocimientosPerfil(
  perfilId: string,
): Promise<ReconocimientoOtorgadoAPI[]> {
  return clienteApi<ReconocimientoOtorgadoAPI[]>(
    `/reconocimientos/perfiles/${encodeURIComponent(perfilId)}/otorgamientos`,
  );
}
