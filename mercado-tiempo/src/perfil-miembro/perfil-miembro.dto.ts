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

    // El saldo no se envía: todo perfil nuevo empieza con SALDO_INICIAL horas
    // y solo un moderador lo cambia (PUT /perfiles-miembro/:id/saldo).
    // Si el cliente lo envía, se ignora.

    @IsUUID()
    @IsNotEmpty()
    readonly usuarioId: string;
}