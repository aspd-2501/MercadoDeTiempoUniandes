/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/acuerdo.dto.ts */
import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

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

    // 0: en creación, 1: acordado, 2: realizado, 3: en modificación
    @IsInt()
    @Min(0)
    @Max(3)
    @IsOptional()
    readonly estado?: number;

    @IsUUID()
    @IsOptional()
    readonly postAyudaId?: string;

    @IsUUID()
    @IsOptional()
    readonly solicitudId?: string;
}