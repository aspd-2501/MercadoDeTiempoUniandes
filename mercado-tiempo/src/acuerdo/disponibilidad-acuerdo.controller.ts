/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/disponibilidad-acuerdo.controller.ts */
import { Body, Controller, Get, Param, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { DisponibilidadAcuerdoService } from './disponibilidad-acuerdo.service';
import { RegistrarDisponibilidadDto } from './registrar-disponibilidad.dto';

@Controller('acuerdos/:acuerdoId/disponibilidad')
@UseInterceptors(BusinessErrorsInterceptor)
export class DisponibilidadAcuerdoController {
    constructor(private readonly disponibilidadService: DisponibilidadAcuerdoService) {}

    // Franjas de cada participante y resultado: pendiente, compatible, insuficiente o sin-coincidencia
    @Get()
    async findDisponibilidad(@Param('acuerdoId') acuerdoId: string) {
        return await this.disponibilidadService.findDisponibilidad(acuerdoId);
    }

    // Registra o reemplaza las franjas de un participante; si ya hay horario común, lo asigna
    @Put(':perfilId')
    async registrarDisponibilidad(
        @Param('acuerdoId') acuerdoId: string,
        @Param('perfilId') perfilId: string,
        @Body() dto: RegistrarDisponibilidadDto
    ) {
        const franjas = dto.franjas.map(f => ({ inicio: new Date(f.fechaInicio), fin: new Date(f.fechaFin) }));
        return await this.disponibilidadService.registrarDisponibilidad(acuerdoId, perfilId, franjas);
    }
}
