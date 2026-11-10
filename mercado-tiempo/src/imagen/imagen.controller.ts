/* eslint-disable prettier/prettier */
/* archivo: src/imagen/imagen.controller.ts */
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ImagenService, TAMANIO_MAXIMO_IMAGEN } from './imagen.service';
import type { ArchivoSubido } from './imagen.service';

@Controller('imagenes')
@UseInterceptors(BusinessErrorsInterceptor)
export class ImagenController {
    constructor(private readonly imagenService: ImagenService) {}

    // POST /imagenes  (multipart/form-data, campo "archivo")
    // Devuelve { ruta, nombre, tamanio }. La `ruta` (/uploads/imagenes/...) es lo que se envía después
    // en el campo `imagen` al crear o editar un perfil, post, servicio, causa, etc.
    @Post()
    // El límite de multer es un poco mayor que el permitido para que el servicio responda con un 400 claro
    @UseInterceptors(FileInterceptor('archivo', { limits: { fileSize: TAMANIO_MAXIMO_IMAGEN + 1, files: 1 } }))
    async subir(@UploadedFile() archivo: ArchivoSubido) {
        return await this.imagenService.guardar(archivo);
    }
}
