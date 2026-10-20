/* eslint-disable prettier/prettier */
/* archivo: src/post-comunitario/post-comunitario.dto.ts */
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PostComunitarioDto {
    @IsString()
    @IsNotEmpty()
    readonly titulo: string;

    @IsString()
    @IsNotEmpty()
    readonly descripcion: string;

    @IsString()
    @IsNotEmpty()
    readonly imagen: string;

    @IsDateString()
    @IsNotEmpty()
    readonly fechaCreacion: string;

    @IsNumber()
    @IsOptional()
    readonly likes?: number;
}