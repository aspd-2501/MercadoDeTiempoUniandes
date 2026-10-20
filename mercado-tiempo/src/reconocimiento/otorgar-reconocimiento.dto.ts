/* eslint-disable prettier/prettier */
/* archivo: src/reconocimiento/otorgar-reconocimiento.dto.ts */
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class OtorgarReconocimientoDto {
    @IsUUID()
    @IsNotEmpty()
    readonly perfilReceptorId: string;

    @IsUUID()
    @IsOptional()
    readonly perfilOtorganteId?: string;

    @IsUUID()
    @IsOptional()
    readonly postComunitarioId?: string;
}