/* eslint-disable prettier/prettier */
/* archivo: src/horario-disponible/horario-disponible.dto.ts */
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class HorarioDisponibleDto {
    @IsDateString()
    @IsNotEmpty()
    readonly fechaInicio: string;

    @IsDateString()
    @IsNotEmpty()
    readonly fechaFin: string;

    @IsUUID()
    @IsNotEmpty()
    readonly perfilId: string;

    @IsUUID()
    @IsOptional()
    readonly acuerdoId?: string;

    @IsUUID()
    @IsOptional()
    readonly solicitudId?: string;

    @IsUUID()
    @IsOptional()
    readonly postAyudaId?: string;
}