/* eslint-disable prettier/prettier */
/* archivo: src/organizacion-institucional/organizacion-institucional.dto.ts */
import { IsNotEmpty, IsString } from 'class-validator';

export class OrganizacionInstitucionalDto {
    @IsString()
    @IsNotEmpty()
    readonly nombre: string;

    @IsString()
    @IsNotEmpty()
    readonly descripcion: string;

    @IsString()
    @IsNotEmpty()
    readonly imagen: string;
}