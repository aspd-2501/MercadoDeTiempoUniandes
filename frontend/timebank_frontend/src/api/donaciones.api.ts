import { clienteApi } from './clienteApi';
export interface FondoHorasAPI { id: string; saldo: number }
export interface DonacionAPI { id: string; horasDonadas: number; fechaDonacion: string; mensaje: string }
export function consultarFondoComunitario() { return clienteApi<FondoHorasAPI>('/depositos-horas/fondo'); }
export function realizarDonacion(datos: {
  horasDonadas: number; mensaje: string; perfilDonanteId: string;
  perfilReceptorId?: string; depositoReceptorId?: string;
}) {
  return clienteApi<DonacionAPI>('/donaciones', {
    metodo: 'POST', datos: { ...datos, fechaDonacion: new Date().toISOString() },
  });
}
