/* eslint-disable prettier/prettier */
/* archivo: src/causa/causa.dto.ts */
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CausaDto {
    @IsString()
    @IsNotEmpty()
    readonly nombre: string;

    @IsString()
    @IsNotEmpty()
    readonly descripcion: string;

    @IsString()
    @IsNotEmpty()
    readonly imagen: string;

    @IsUUID()
    @IsNotEmpty()
    readonly perfilCreadorId: string;

    @IsUUID()
    @IsNotEmpty()
    readonly perfilReceptorId: string;
}