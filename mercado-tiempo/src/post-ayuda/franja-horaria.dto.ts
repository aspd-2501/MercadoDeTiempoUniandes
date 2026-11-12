/* eslint-disable prettier/prettier */
/* archivo: src/post-ayuda/franja-horaria.dto.ts */
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

// --- Una franja de disponibilidad propuesta por el autor del post ---
export class FranjaHorariaDto {
    @IsDateString()
    @IsNotEmpty()
    readonly fechaInicio: string;

    @IsDateString()
    @IsNotEmpty()
    readonly fechaFin: string;

    // Marca esta franja como el horario preferido del autor (solo una por post).
    // Si ninguna viene marcada al crear el post, la preferida es la que empieza primero.
    @IsOptional()
    @IsBoolean()
    readonly preferido?: boolean;
}