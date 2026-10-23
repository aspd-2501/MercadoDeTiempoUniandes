/* eslint-disable prettier/prettier */
/* archivo: src/perfil-miembro/perfil-miembro.dto.ts */
import { IsBoolean, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class PerfilMiembroDto {
    @IsString()
    @IsNotEmpty()
    readonly nombre: string;

    @IsNumber()
    @IsNotEmpty()
    readonly edad: number;

    @IsString()
    @IsNotEmpty()
    readonly afiliacionUniandes: string;

    @IsString()
    @IsNotEmpty()
    readonly imagen: string;

    @IsString()
    @IsNotEmpty()
    readonly descripcion: string;

    @IsBoolean()
    @IsNotEmpty()
    readonly estadoActividad: boolean;

    @IsNumber()
    @IsNotEmpty()
    readonly saldo: number;

    @IsUUID()
    @IsNotEmpty()
    readonly usuarioId: string;
}