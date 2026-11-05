import { clienteApi } from './clienteApi';

export interface PerfilMiembroAPI {
  id: string;
  nombre: string;
  edad: number;
  afiliacionUniandes: string;
  imagen: string;
  descripcion: string;
  estadoActividad: boolean;
  saldo: number;
  idUniandes: string;
}

export function obtenerPerfiles() {
  return clienteApi<PerfilMiembroAPI[]>('/perfiles-miembro');
}

export function buscarMiembros(
  consulta?: string
): Promise<PerfilMiembroAPI[]> {
  const parametros = new URLSearchParams();

  if (consulta) {
    parametros.set('q', consulta);
  }

  const query = parametros.toString();

  return clienteApi<PerfilMiembroAPI[]>(
    `/buscar/miembros${query ? `?${query}` : ''}`
  );
}