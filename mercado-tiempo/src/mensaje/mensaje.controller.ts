/* eslint-disable prettier/prettier */
/* archivo: src/mensaje/mensaje.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { MensajeService } from './mensaje.service';
import { MensajeEntity } from './mensaje.entity';
import { MensajeDto } from './mensaje.dto';

@Controller('mensajes')
@UseInterceptors(BusinessErrorsInterceptor)
export class MensajeController {
    constructor(private readonly mensajeService: MensajeService) {}

    @Get()
    async findAll() {
        return await this.mensajeService.findAll();
    }

    @Get(':mensajeId')
    async findOne(@Param('mensajeId') mensajeId: string) {
        return await this.mensajeService.findOne(mensajeId);
    }

    @Post()
    async create(@Body() mensajeDto: MensajeDto) {
        const mensaje: MensajeEntity = this.dtoToEntity(mensajeDto);
        return await this.mensajeService.create(mensaje);
    }

    @Delete(':mensajeId')
    @HttpCode(204)
    async delete(@Param('mensajeId') mensajeId: string) {
        return await this.mensajeService.delete(mensajeId);
    }

    // --- Mapeo manual DTO → Entity (chat y emisor obligatorios) ---
    private dtoToEntity(dto: MensajeDto): MensajeEntity {
        const mensaje = new MensajeEntity();
        mensaje.contenido = dto.contenido;
        mensaje.fecha = new Date();
        mensaje.chat = { id: dto.chatId } as any;
        mensaje.emisor = { id: dto.emisorId } as any;
        return mensaje;
    }
}