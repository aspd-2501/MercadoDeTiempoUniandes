/* eslint-disable prettier/prettier */
/* archivo: src/perfil-miembro/ajustar-saldo.dto.ts */
import { IsInt, IsNotEmpty, Min } from 'class-validator';

// Cuerpo de PUT /perfiles-miembro/:perfilId/saldo (solo moderadores)
export class AjustarSaldoDto {
    // Nuevo saldo del miembro, en horas
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    readonly saldo: number;
}
