/* eslint-disable prettier/prettier */
/* archivo: src/actividad-comunitaria/actividad-comunitaria.dto.ts */
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class ActividadComunitariaDto {
    @IsString()
    @IsNotEmpty()
    readonly titulo: string;

    @IsString()
    @IsNotEmpty()
    readonly descripcion: string;

    @IsString()
    @IsNotEmpty()
    readonly imagen: string;

    @IsNumber()
    @IsNotEmpty()
    readonly cupo: number;

    @IsBoolean()
    @IsNotEmpty()
    readonly cupoLleno: boolean;

    @IsDateString()
    @IsNotEmpty()
    readonly fechaCreacion: string;

    @IsUUID()
    @IsNotEmpty()
    readonly organizacionId: string;
}