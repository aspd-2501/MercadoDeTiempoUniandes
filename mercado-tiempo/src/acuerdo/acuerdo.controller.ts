/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/acuerdo.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { AcuerdoService } from './acuerdo.service';
import { AcuerdoEntity } from './acuerdo.entity';
import { AcuerdoDto } from './acuerdo.dto';
import { AgregarParticipanteDto } from './agregar-participante.dto';
import { AsociarParticipantesDto } from './asociar-participantes.dto';

@Controller('acuerdos')
@UseInterceptors(BusinessErrorsInterceptor)
export class AcuerdoController {
    constructor(private readonly acuerdoService: AcuerdoService) {}

    @Get()
    async findAll() {
        return await this.acuerdoService.findAll();
    }

    @Get(':acuerdoId')
    async findOne(@Param('acuerdoId') acuerdoId: string) {
        return await this.acuerdoService.findOne(acuerdoId);
    }

    @Post()
    async create(@Body() acuerdoDto: AcuerdoDto) {
        const acuerdo: AcuerdoEntity = this.dtoToEntity(acuerdoDto);
        return await this.acuerdoService.create(acuerdo);
    }

    @Put(':acuerdoId')
    async update(@Param('acuerdoId') acuerdoId: string, @Body() acuerdoDto: AcuerdoDto) {
        const acuerdo: AcuerdoEntity = this.dtoToEntity(acuerdoDto);
        return await this.acuerdoService.update(acuerdoId, acuerdo);
    }

    @Delete(':acuerdoId')
    @HttpCode(204)
    async delete(@Param('acuerdoId') acuerdoId: string) {
        return await this.acuerdoService.delete(acuerdoId);
    }

    // --- Confirmación de prestación: cuando todos confirman, se transfieren las horas ---

    @Post(':acuerdoId/confirmaciones/:perfilId')
    async confirmarPrestacion(@Param('acuerdoId') acuerdoId: string, @Param('perfilId') perfilId: string) {
        return await this.acuerdoService.confirmarPrestacion(acuerdoId, perfilId);
    }

    // --- Horario acordado ---

    @Put(':acuerdoId/horario-acordado/:horarioId')
    async setHorarioAcordado(@Param('acuerdoId') acuerdoId: string, @Param('horarioId') horarioId: string) {
        return await this.acuerdoService.setHorarioAcordado(acuerdoId, horarioId);
    }

    @Delete(':acuerdoId/horario-acordado')
    async deleteHorarioAcordado(@Param('acuerdoId') acuerdoId: string) {
        return await this.acuerdoService.deleteHorarioAcordado(acuerdoId);
    }

    // --- Chat del acuerdo ---

    @Put(':acuerdoId/chat/:chatId')
    async setChatAcuerdo(@Param('acuerdoId') acuerdoId: string, @Param('chatId') chatId: string) {
        return await this.acuerdoService.setChatAcuerdo(acuerdoId, chatId);
    }

    // --- Relación con PerfilMiembro (vía ParticipanteAcuerdo, con rol) ---

    @Post(':acuerdoId/participantes/:perfilId')
    async addParticipanteAcuerdo(
        @Param('acuerdoId') acuerdoId: string,
        @Param('perfilId') perfilId: string,
        @Body() dto: AgregarParticipanteDto
    ) {
        return await this.acuerdoService.addParticipanteAcuerdo(acuerdoId, perfilId, dto.rol);
    }

    @Get(':acuerdoId/participantes/:perfilId')
    async findParticipanteByAcuerdoIdPerfilId(@Param('acuerdoId') acuerdoId: string, @Param('perfilId') perfilId: string) {
        return await this.acuerdoService.findParticipanteByAcuerdoIdPerfilId(acuerdoId, perfilId);
    }

    @Get(':acuerdoId/participantes')
    async findParticipantesByAcuerdoId(@Param('acuerdoId') acuerdoId: string) {
        return await this.acuerdoService.findParticipantesByAcuerdoId(acuerdoId);
    }

    @Put(':acuerdoId/participantes')
    async associateParticipantesAcuerdo(@Param('acuerdoId') acuerdoId: string, @Body() dto: AsociarParticipantesDto) {
        return await this.acuerdoService.associateParticipantesAcuerdo(acuerdoId, dto.participantes);
    }

    @Delete(':acuerdoId/participantes/:perfilId')
    @HttpCode(204)
    async deleteParticipanteAcuerdo(@Param('acuerdoId') acuerdoId: string, @Param('perfilId') perfilId: string) {
        return await this.acuerdoService.deleteParticipanteAcuerdo(acuerdoId, perfilId);
    }

    // --- Mapeo manual DTO → Entity ---
    private dtoToEntity(dto: AcuerdoDto): AcuerdoEntity {
        const acuerdo = new AcuerdoEntity();
        acuerdo.horas = dto.horas;
        acuerdo.fechaCreacion = new Date(dto.fechaCreacion);
        acuerdo.fechaRealizacion = new Date(dto.fechaRealizacion);
        if (dto.estado !== undefined) acuerdo.estado = dto.estado;
        if (dto.postAyudaId) acuerdo.postAyuda = { id: dto.postAyudaId } as any;
        if (dto.solicitudId) acuerdo.solicitud = { id: dto.solicitudId } as any;
        return acuerdo;
    }
}