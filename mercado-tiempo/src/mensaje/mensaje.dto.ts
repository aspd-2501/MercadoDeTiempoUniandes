/* eslint-disable prettier/prettier */
/* archivo: src/mensaje/mensaje.dto.ts */
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class MensajeDto {
    @IsString()
    @IsNotEmpty()
    readonly contenido: string;

    @IsUUID()
    @IsNotEmpty()
    readonly emisorId: string;

    @IsUUID()
    @IsNotEmpty()
    readonly chatId: string;
}