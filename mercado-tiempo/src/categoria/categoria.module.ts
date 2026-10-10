/* eslint-disable prettier/prettier */
/* archivo: src/categoria/categoria.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaService } from './categoria.service';
import { CategoriaEntity } from './categoria.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CategoriaEntity])],
    providers: [CategoriaService],
})
export class CategoriaModule {}