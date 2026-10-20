/* eslint-disable prettier/prettier */
/* archivo: src/categoria/categoria.dto.ts */
import { IsNotEmpty, IsString } from 'class-validator';

export class CategoriaDto {
    @IsString()
    @IsNotEmpty()
    readonly nombre: string;
}