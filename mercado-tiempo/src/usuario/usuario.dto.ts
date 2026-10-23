/* eslint-disable prettier/prettier */
/* archivo: src/usuario/usuario.dto.ts */
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UsuarioDto {
    @IsString()
    @IsNotEmpty()
    readonly idUniandes: string;

    @IsString()
    @MinLength(6)
    readonly contrasenia: string;
}