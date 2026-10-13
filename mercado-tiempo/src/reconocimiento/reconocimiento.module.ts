/* eslint-disable prettier/prettier */
/* archivo: src/reconocimiento/reconocimiento.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReconocimientoService } from './reconocimiento.service';
import { ReconocimientoEntity } from './reconocimiento.entity';
import { ReconocimientoOtorgadoEntity } from './reconocimiento-otorgado.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { PostComunitarioEntity } from '../post-comunitario/post-comunitario.entity';
import { UsuarioPostEntity } from '../post-comunitario/usuario-post.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
        ReconocimientoEntity,
        ReconocimientoOtorgadoEntity,
        PerfilMiembroEntity,
        PostComunitarioEntity,
        UsuarioPostEntity,
    ])],
    providers: [ReconocimientoService],
})
export class ReconocimientoModule {}