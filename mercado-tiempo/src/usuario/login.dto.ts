/* eslint-disable prettier/prettier */
/* archivo: src/usuario/login.dto.ts */
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    readonly idUniandes: string;

    @IsString()
    @IsNotEmpty()
    readonly contrasenia: string;
}