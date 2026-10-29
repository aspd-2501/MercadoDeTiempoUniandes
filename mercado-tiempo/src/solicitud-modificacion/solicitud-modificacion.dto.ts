/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-modificacion/solicitud-modificacion.dto.ts */
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';
import { TipoSolicitudModificacion } from './estado-solicitud-modificacion.enum';

export class SolicitudModificacionDto {
    @IsEnum(TipoSolicitudModificacion)
    @IsNotEmpty()
    readonly tipo: TipoSolicitudModificacion;

    // Participante que hace la propuesta
    @IsUUID()
    @IsNotEmpty()
    readonly solicitanteId: string;

    // Solo para MODIFICACION
    @IsInt()
    @Min(1)
    @IsOptional()
    readonly horas?: number;

    // Solo para MODIFICACION
    @IsDateString()
    @IsOptional()
    readonly fechaRealizacion?: string;
}
