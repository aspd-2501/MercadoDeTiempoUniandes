/* eslint-disable prettier/prettier */
/* archivo: src/post-ayuda/franja-horaria.dto.ts */
import { IsDateString, IsNotEmpty } from 'class-validator';

// --- Una franja de disponibilidad propuesta por el autor del post ---
export class FranjaHorariaDto {
    @IsDateString()
    @IsNotEmpty()
    readonly fechaInicio: string;

    @IsDateString()
    @IsNotEmpty()
    readonly fechaFin: string;
}