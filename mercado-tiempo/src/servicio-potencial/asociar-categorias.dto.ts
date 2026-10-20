/* eslint-disable prettier/prettier */
/* archivo: src/servicio-potencial/asociar-categorias.dto.ts */
import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsUUID } from 'class-validator';

export class AsociarCategoriasDto {
    @IsUUID('4', { each: true })
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @ArrayMaxSize(3)
    readonly categoriaIds: string[];
}