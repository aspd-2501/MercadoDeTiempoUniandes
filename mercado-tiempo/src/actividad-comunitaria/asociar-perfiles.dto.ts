/* eslint-disable prettier/prettier */
/* archivo: src/actividad-comunitaria/asociar-perfiles.dto.ts */
import { ArrayNotEmpty, IsUUID } from 'class-validator';

export class AsociarPerfilesDto {
    @IsUUID('4', { each: true })
    @ArrayNotEmpty()
    readonly perfilIds: string[];
}