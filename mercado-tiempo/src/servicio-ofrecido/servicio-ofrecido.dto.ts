/* eslint-disable prettier/prettier */
/* archivo: src/servicio-ofrecido/servicio-ofrecido.dto.ts */
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ServicioOfrecidoDto {
    @IsString()
    @IsNotEmpty()
    readonly titulo: string;

    @IsString()
    @IsNotEmpty()
    readonly descripcion: string;

    @IsUUID()
    @IsNotEmpty()
    readonly perfilId: string;
}