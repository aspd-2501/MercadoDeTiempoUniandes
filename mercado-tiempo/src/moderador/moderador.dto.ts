/* eslint-disable prettier/prettier */
/* archivo: src/moderador/moderador.dto.ts */
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ModeradorDto {
    @IsUUID()
    @IsNotEmpty()
    readonly usuarioId: string;
}