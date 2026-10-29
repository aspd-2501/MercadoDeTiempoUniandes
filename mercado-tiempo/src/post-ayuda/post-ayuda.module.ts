/* eslint-disable prettier/prettier */
/* archivo: src/post-ayuda/post-ayuda.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostAyudaService } from './post-ayuda.service';
import { PostAyudaEntity } from './post-ayuda.entity';
import { PostAyudaCategoriaEntity } from './post-ayuda-categoria.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';
import { PostAyudaController } from './post-ayuda.controller';
import { HorarioDisponibleEntity } from '../horario-disponible/horario-disponible.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
        PostAyudaEntity,
        PostAyudaCategoriaEntity,
        PerfilMiembroEntity,
        CategoriaEntity,
        HorarioDisponibleEntity,
    ])],
    providers: [PostAyudaService],
    controllers: [PostAyudaController],
})
export class PostAyudaModule {}