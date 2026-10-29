/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-modificacion/estado-solicitud-modificacion.enum.ts */

// --- Tipo de propuesta sobre un acuerdo ---
export enum TipoSolicitudModificacion {
    MODIFICACION = 'MODIFICACION',   // cambiar fecha y/o horas (RF-040)
    CANCELACION = 'CANCELACION',     // retirarse / cancelar el acuerdo (RF-033)
}

// --- Estado de la propuesta (int 0..3, como en el diagrama) ---
export enum EstadoSolicitudModificacion {
    PENDIENTE = 0,   // esperando la aprobación de todos los participantes
    APROBADA = 1,    // todos aprobaron: el cambio se aplicó al acuerdo
    RECHAZADA = 2,   // un participante rechazó una modificación: se descartó
    RETIRADA = 3,    // el solicitante la retiró antes de que se resolviera
}
