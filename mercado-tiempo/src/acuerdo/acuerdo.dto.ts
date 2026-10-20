/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/acuerdo.dto.ts */
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class AcuerdoDto {
    @IsNumber()
    @IsNotEmpty()
    readonly horas: number;

    @IsDateString()
    @IsNotEmpty()
    readonly fechaCreacion: string;

    @IsDateString()
    @IsNotEmpty()
    readonly fechaRealizacion: string;

    @IsBoolean()
    @IsOptional()
    readonly finalizado?: boolean;

    @IsUUID()
    @IsOptional()
    readonly postAyudaId?: string;

    @IsUUID()
    @IsOptional()
    readonly solicitudId?: string;
}