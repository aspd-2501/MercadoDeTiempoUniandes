/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-ayuda/aceptar-solicitud.dto.ts */
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AceptarSolicitudDto {
    @IsUUID()
    @IsNotEmpty()
    readonly perfilPrestadorId: string;
}