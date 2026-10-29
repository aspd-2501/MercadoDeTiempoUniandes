/* eslint-disable prettier/prettier */
/* archivo: src/transaccion/transaccion.controller.ts */
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { TransaccionService } from './transaccion.service';

@Controller('perfiles-miembro/:perfilId/transacciones')
@UseInterceptors(BusinessErrorsInterceptor)
export class TransaccionController {
    constructor(private readonly transaccionService: TransaccionService) {}

    @Get()
    async findByPerfilId(@Param('perfilId') perfilId: string) {
        return await this.transaccionService.findByPerfilId(perfilId);
    }
}
