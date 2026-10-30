/* eslint-disable prettier/prettier */
/* archivo: src/donacion/donacion.dto.ts */
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class DonacionDto {
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    readonly horasDonadas: number;

    @IsDateString()
    @IsNotEmpty()
    readonly fechaDonacion: string;

    @IsString()
    @IsNotEmpty()
    readonly mensaje: string;

    @IsUUID()
    @IsOptional()
    readonly perfilDonanteId?: string;

    @IsUUID()
    @IsOptional()
    readonly depositoDonanteId?: string;

    @IsUUID()
    @IsOptional()
    readonly perfilReceptorId?: string;

    @IsUUID()
    @IsOptional()
    readonly depositoReceptorId?: string;

    @IsUUID()
    @IsOptional()
    readonly causaId?: string;
}