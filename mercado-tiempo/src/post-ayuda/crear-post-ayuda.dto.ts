/* eslint-disable prettier/prettier */
/* archivo: src/post-ayuda/crear-post-ayuda.dto.ts */
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { PostAyudaDto } from './post-ayuda.dto';

export class CrearPostAyudaDto extends PostAyudaDto {
    @IsUUID('4', { each: true })
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @ArrayMaxSize(3)
    readonly categoriaIds: string[];
}