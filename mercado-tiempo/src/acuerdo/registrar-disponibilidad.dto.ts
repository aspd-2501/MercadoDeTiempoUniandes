/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/registrar-disponibilidad.dto.ts */
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { FranjaHorariaDto } from '../post-ayuda/franja-horaria.dto';

// Franjas en las que el participante puede hacer el servicio. Reemplazan las que había enviado antes.
// Una lista vacía significa "no tengo disponibilidad".
export class RegistrarDisponibilidadDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FranjaHorariaDto)
    readonly franjas: FranjaHorariaDto[];
}
