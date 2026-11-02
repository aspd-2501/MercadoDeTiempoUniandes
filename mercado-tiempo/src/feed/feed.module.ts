/* eslint-disable prettier/prettier */
/* archivo: src/feed/feed.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { PostComunitarioEntity } from '../post-comunitario/post-comunitario.entity';
import { CausaEntity } from '../causa/causa.entity';

// Feed de la pantalla de inicio
@Module({
    imports: [TypeOrmModule.forFeature([PerfilMiembroEntity, PostAyudaEntity, PostComunitarioEntity, CausaEntity])],
    providers: [FeedService],
    controllers: [FeedController],
})
export class FeedModule {}
