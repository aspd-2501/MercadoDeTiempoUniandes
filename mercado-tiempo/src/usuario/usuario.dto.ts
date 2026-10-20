/* eslint-disable prettier/prettier */
/* archivo: src/usuario/usuario.dto.ts */
import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class UsuarioDto {
    @IsString()
    @IsNotEmpty()
    readonly idUniandes: string;

    @IsString()
    @IsNotEmpty()
    readonly nombre: string;

    @IsString()
    @MinLength(6)
    readonly contrasenia: string;

    @IsNumber()
    @IsNotEmpty()
    readonly edad: number;

    @IsString()
    @IsNotEmpty()
    readonly afiliacionUniandes: string;
}