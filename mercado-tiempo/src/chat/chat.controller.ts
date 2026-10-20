/* eslint-disable prettier/prettier */
/* archivo: src/chat/chat.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ChatService } from './chat.service';
import { CrearChatDto } from './crear-chat.dto';

@Controller('chats')
@UseInterceptors(BusinessErrorsInterceptor)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get()
    async findAll() {
        return await this.chatService.findAll();
    }

    @Get(':chatId')
    async findOne(@Param('chatId') chatId: string) {
        return await this.chatService.findOne(chatId);
    }

    @Post()
    async create(@Body() dto: CrearChatDto) {
        const perfiles = dto.perfilIds.map(id => ({ id })) as any;
        return await this.chatService.create(perfiles);
    }

    @Delete(':chatId')
    @HttpCode(204)
    async delete(@Param('chatId') chatId: string) {
        return await this.chatService.delete(chatId);
    }

    // --- Relación con PerfilMiembro (vía ChatParticipante) ---

    @Post(':chatId/perfiles/:perfilId')
    async addPerfilChat(@Param('chatId') chatId: string, @Param('perfilId') perfilId: string) {
        return await this.chatService.addPerfilChat(chatId, perfilId);
    }

    @Get(':chatId/perfiles')
    async findPerfilesByChatId(@Param('chatId') chatId: string) {
        return await this.chatService.findPerfilesByChatId(chatId);
    }

    @Delete(':chatId/perfiles/:perfilId')
    @HttpCode(204)
    async deletePerfilChat(@Param('chatId') chatId: string, @Param('perfilId') perfilId: string) {
        return await this.chatService.deletePerfilChat(chatId, perfilId);
    }
}