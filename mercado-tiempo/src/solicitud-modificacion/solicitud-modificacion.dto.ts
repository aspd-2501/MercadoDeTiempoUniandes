/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-modificacion/solicitud-modificacion.dto.ts */
import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class SolicitudModificacionDto {
    @IsNumber()
    @IsNotEmpty()
    readonly horas: number;

    @IsDateString()
    @IsNotEmpty()
    readonly fechaCreacion: string;

    @IsDateString()
    @IsNotEmpty()
    readonly fechaRealizacion: string;

    @IsInt()
    @Min(0)
    @Max(3)
    @IsOptional()
    readonly estado?: number;
}
