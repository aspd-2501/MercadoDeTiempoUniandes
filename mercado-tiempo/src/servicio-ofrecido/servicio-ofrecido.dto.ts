/* eslint-disable prettier/prettier */
/* archivo: src/servicio-ofrecido/servicio-ofrecido.dto.ts */
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ServicioOfrecidoDto {
    @IsString()
    @IsNotEmpty()
    readonly titulo: string;

    @IsString()
    @IsNotEmpty()
    readonly descripcion: string;

    @IsBoolean()
    @IsOptional()
    readonly visible?: boolean;

    @IsUUID()
    @IsNotEmpty()
    readonly perfilId: string;
}