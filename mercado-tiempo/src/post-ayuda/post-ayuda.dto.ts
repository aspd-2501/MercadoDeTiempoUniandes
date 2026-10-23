/* eslint-disable prettier/prettier */
/* archivo: src/post-ayuda/post-ayuda.dto.ts */
import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class PostAyudaDto {
    @IsString()
    @IsNotEmpty()
    readonly titulo: string;

    @IsString()
    @IsNotEmpty()
    readonly descripcion: string;

    @IsNumber()
    @IsNotEmpty()
    readonly horas: number;

    @IsString()
    @IsNotEmpty()
    readonly imagen: string;

    @IsBoolean()
    @IsNotEmpty()
    readonly ofrece: boolean;

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
    readonly perfilAutorId: string;
}