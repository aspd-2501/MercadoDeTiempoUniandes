/* eslint-disable prettier/prettier */
/* archivo: src/deposito-horas/deposito-horas.dto.ts */
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class DepositoHorasDto {
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    readonly saldo: number;
}