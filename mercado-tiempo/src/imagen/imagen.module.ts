/* eslint-disable prettier/prettier */
/* archivo: src/imagen/imagen.module.ts */
import { Module } from '@nestjs/common';
import { ImagenService } from './imagen.service';
import { ImagenController } from './imagen.controller';

@Module({
    providers: [ImagenService],
    controllers: [ImagenController],
})
export class ImagenModule {}
