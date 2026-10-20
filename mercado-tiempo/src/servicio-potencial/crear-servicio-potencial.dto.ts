/* eslint-disable prettier/prettier */
/* archivo: src/servicio-potencial/crear-servicio-potencial.dto.ts */
import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsNotEmpty, IsUUID } from 'class-validator';

export class CrearServicioPotencialDto {
    @IsUUID()
    @IsNotEmpty()
    readonly perfilId: string;

    @IsUUID('4', { each: true })
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @ArrayMaxSize(3)
    readonly categoriaIds: string[];
}