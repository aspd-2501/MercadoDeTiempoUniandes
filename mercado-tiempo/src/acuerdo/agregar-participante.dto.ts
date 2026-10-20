/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/agregar-participante.dto.ts */
import { IsEnum, IsNotEmpty } from 'class-validator';
import { RolParticipante } from './participante-acuerdo.entity';

export class AgregarParticipanteDto {
    @IsEnum(RolParticipante)
    @IsNotEmpty()
    readonly rol: RolParticipante;
}