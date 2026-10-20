/* eslint-disable prettier/prettier */
/* archivo: src/post-comunitario/crear-post-comunitario.dto.ts */
import { ArrayMinSize, ArrayNotEmpty, IsUUID } from 'class-validator';
import { PostComunitarioDto } from './post-comunitario.dto';

export class CrearPostComunitarioDto extends PostComunitarioDto {
    @IsUUID('4', { each: true })
    @ArrayNotEmpty()
    @ArrayMinSize(2)
    readonly perfilIds: string[];
}