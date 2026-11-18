/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/iniciar-acuerdo.dto.ts */
import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

// Cuerpo de POST /acuerdos/iniciar: crea el acuerdo, sus dos primeros participantes y su chat de una sola vez.
// Origen: postAyudaId (con perfilId = quien se une al post) o solicitudId (la organización prestadora y el autor).
export class IniciarAcuerdoDto {
    @IsUUID()
    @IsOptional()
    readonly postAyudaId?: string;

    @IsUUID()
    @IsOptional()
    readonly solicitudId?: string;

    // Miembro que se une al post (obligatorio si el origen es un post; se ignora con una solicitud)
    @IsUUID()
    @IsOptional()
    readonly perfilId?: string;

    // Opcional: se fija sola cuando se coordina el horario del acuerdo
    @IsDateString()
    @IsOptional()
    readonly fechaRealizacion?: string;

    // Si no se envía, se usan las horas del post o de la solicitud
    @IsInt()
    @Min(1)
    @IsOptional()
    readonly horas?: number;
}
