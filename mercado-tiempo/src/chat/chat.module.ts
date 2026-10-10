import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from './chat.entity';
import { ChatParticipanteEntity } from './chat-participante.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatEntity, ChatParticipanteEntity, PerfilMiembroEntity])],
  providers: [ChatService]
})
export class ChatModule {}
