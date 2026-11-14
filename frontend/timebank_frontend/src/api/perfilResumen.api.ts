import { clienteApi } from './clienteApi';
import type { CategoriaAPI, PerfilSesionAPI } from './identidad.api';
import type { ServicioOfrecidoAPI } from './serviciosOfrecidos.api';
import type { AcuerdoAPI } from './acuerdos.api';
export interface ReconocimientoOtorgadoAPI { id: string; reconocimiento: { id: string; nombre: string } }
export function obtenerInteresesMiembro(id: string) {
  return clienteApi<CategoriaAPI[]>(`/perfiles-miembro/${encodeURIComponent(id)}/intereses`);
}
export function obtenerServiciosMiembro(id: string, incluirOcultos = false) {
  const query = incluirOcultos ? '?ocultos=true' : '';
  return clienteApi<ServicioOfrecidoAPI[]>(`/perfiles-miembro/${encodeURIComponent(id)}/servicios-ofrecidos${query}`);
}
export function obtenerReconocimientosMiembro(id: string) {
  return clienteApi<ReconocimientoOtorgadoAPI[]>(`/reconocimientos/perfiles/${encodeURIComponent(id)}/otorgamientos`);
}
export function obtenerIntercambiosRealizados(id: string) {
  return clienteApi<AcuerdoAPI[]>(`/perfiles-miembro/${encodeURIComponent(id)}/acuerdos?filtro=completados`);
}
export function cambiarVisibilidadPerfil(id: string, activo: boolean) {
  return clienteApi<PerfilSesionAPI>(`/perfiles-miembro/${encodeURIComponent(id)}/estado-actividad`, {
    metodo: 'PUT', datos: { activo },
  });
}
export interface MovimientoAPI {
  id: string; tipo: 'SERVICIO_RECIBIDO' | 'SERVICIO_PRESTADO' | 'APORTE_FONDO' | 'DONACION_ENVIADA' | 'DONACION_RECIBIDA';
  horas: number; saldoResultante: number; fecha: string;
  acuerdo?: { id: string } | null; donacion?: { id: string } | null;
}
export function obtenerMovimientos(id: string) {
  return clienteApi<MovimientoAPI[]>(`/perfiles-miembro/${encodeURIComponent(id)}/transacciones`);
}
