/* eslint-disable prettier/prettier */
/* archivo: src/post-comunitario/post-comunitario.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostComunitarioService } from './post-comunitario.service';
import { PostComunitarioEntity } from './post-comunitario.entity';
import { UsuarioPostEntity } from './usuario-post.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PostComunitarioEntity, UsuarioPostEntity, PerfilMiembroEntity])],
    providers: [PostComunitarioService],
})
export class PostComunitarioModule {}