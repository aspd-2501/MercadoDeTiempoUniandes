/* eslint-disable prettier/prettier */
/* archivo: src/mensaje/mensaje.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MensajeService } from './mensaje.service';
import { MensajeEntity } from './mensaje.entity';
import { ChatEntity } from '../chat/chat.entity';
import { ChatParticipanteEntity } from '../chat/chat-participante.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
        MensajeEntity,
        ChatEntity,
        ChatParticipanteEntity,
        PerfilMiembroEntity,
    ])],
    providers: [MensajeService],
})
export class MensajeModule {}