/* eslint-disable prettier/prettier */
/* archivo: src/transaccion/transaccion.controller.ts */
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { TransaccionService } from './transaccion.service';

@Controller()
@UseInterceptors(BusinessErrorsInterceptor)
export class TransaccionController {
    constructor(private readonly transaccionService: TransaccionService) {}

    // --- Historial de movimientos de un miembro (RF-056) ---
    @Get('perfiles-miembro/:perfilId/transacciones')
    async findByPerfilId(@Param('perfilId') perfilId: string) {
        return await this.transaccionService.findByPerfilId(perfilId);
    }

    // --- Movimientos del fondo comunitario ---
    @Get('depositos-horas/:depositoId/transacciones')
    async findByDepositoId(@Param('depositoId') depositoId: string) {
        return await this.transaccionService.findByDepositoId(depositoId);
    }
}
