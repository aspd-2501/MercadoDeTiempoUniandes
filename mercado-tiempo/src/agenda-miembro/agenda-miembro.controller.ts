/* eslint-disable prettier/prettier */
/* archivo: src/agenda-miembro/agenda-miembro.controller.ts */
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { AgendaMiembroService, FiltroAcuerdos } from './agenda-miembro.service';

@Controller('perfiles-miembro/:perfilId')
@UseInterceptors(BusinessErrorsInterceptor)
export class AgendaMiembroController {
    constructor(private readonly agendaService: AgendaMiembroService) {}

    // GET /perfiles-miembro/:perfilId/acuerdos?filtro=pendientes|completados|cancelados  (RF-057)
    @Get('acuerdos')
    async findAcuerdos(@Param('perfilId') perfilId: string, @Query('filtro') filtro?: FiltroAcuerdos) {
        return await this.agendaService.findAcuerdos(perfilId, filtro);
    }

    // GET /perfiles-miembro/:perfilId/calendario?desde=2026-11-02&hasta=2026-11-09  (RF-035)
    @Get('calendario')
    async findCalendario(@Param('perfilId') perfilId: string, @Query('desde') desde?: string, @Query('hasta') hasta?: string) {
        return await this.agendaService.findCalendario(
            perfilId,
            desde ? new Date(desde) : undefined,
            hasta ? new Date(hasta) : undefined
        );
    }
}
