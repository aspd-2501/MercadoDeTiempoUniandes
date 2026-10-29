/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/estado-acuerdo.enum.ts */

// --- Estados del acuerdo (también usados por SolicitudModificacion) ---
export enum EstadoAcuerdo {
    EN_CREACION = 0,
    ACORDADO = 1,
    REALIZADO = 2,
    EN_MODIFICACION = 3,
    CANCELADO = 4,
}
