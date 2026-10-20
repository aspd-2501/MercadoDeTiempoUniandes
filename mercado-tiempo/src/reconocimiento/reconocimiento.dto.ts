/* eslint-disable prettier/prettier */
/* archivo: src/reconocimiento/reconocimiento.dto.ts */
import { IsNotEmpty, IsString } from 'class-validator';

export class ReconocimientoDto {
    @IsString()
    @IsNotEmpty()
    readonly nombre: string;

    @IsString()
    @IsNotEmpty()
    readonly descripcion: string;

    @IsString()
    @IsNotEmpty()
    readonly requerimiento: string;

    @IsString()
    @IsNotEmpty()
    readonly icono: string;
}