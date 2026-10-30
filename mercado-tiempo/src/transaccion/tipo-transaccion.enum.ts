/* eslint-disable prettier/prettier */
/* archivo: src/transaccion/tipo-transaccion.enum.ts */

// --- Tipos de movimiento de horas en la cuenta de un miembro ---
export enum TipoTransaccion {
    SERVICIO_RECIBIDO = 'SERVICIO_RECIBIDO',   // débito al receptor de un acuerdo (RF-047)
    SERVICIO_PRESTADO = 'SERVICIO_PRESTADO',   // crédito al prestador de un acuerdo (RF-048)
    APORTE_FONDO = 'APORTE_FONDO',             // horas sobrantes de un acuerdo grupal que van al fondo comunitario
    DONACION_ENVIADA = 'DONACION_ENVIADA',     // débito a quien dona (RF-050)
    DONACION_RECIBIDA = 'DONACION_RECIBIDA',   // crédito a quien recibe la donación (RF-050, RF-054)
}
