/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/asociar-participantes.dto.ts */
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { RolParticipante } from './participante-acuerdo.entity';

class ParticipanteItemDto {
    @IsUUID()
    readonly perfilId: string;

    @IsEnum(RolParticipante)
    readonly rol: RolParticipante;
}

export class AsociarParticipantesDto {
    @ValidateNested({ each: true })
    @Type(() => ParticipanteItemDto)
    @ArrayNotEmpty()
    readonly participantes: ParticipanteItemDto[];
}