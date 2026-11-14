/* eslint-disable prettier/prettier */
/* archivo: src/imagen/imagen.service.ts */
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

// Lo que llega de multer al subir un archivo (solo los campos que usamos)
export interface ArchivoSubido {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}

export interface ImagenGuardada {
    ruta: string;     // lo que se guarda en el campo `imagen` (perfil, post, servicio, causa...)
    nombre: string;   // nombre con el que quedó guardado el archivo
    tamanio: number;  // en bytes
}

// Carpeta donde quedan las imágenes y prefijo con el que se sirven por HTTP
export const CARPETA_UPLOADS = process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
export const PREFIJO_UPLOADS = '/uploads';
export const TAMANIO_MAXIMO_IMAGEN = 5 * 1024 * 1024; // 5 MB

const EXTENSIONES: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

@Injectable()
export class ImagenService {
    constructor() {}

    carpeta(): string {
        return join(CARPETA_UPLOADS, 'imagenes');
    }

    // Guarda la imagen con un nombre nuevo (no se usa el nombre original) y devuelve su ruta
    async guardar(archivo: ArchivoSubido | undefined): Promise<ImagenGuardada> {
        if (!archivo || !archivo.buffer || archivo.size === 0)
            throw new BusinessLogicException("Debes enviar una imagen en el campo 'archivo'", BusinessError.BAD_REQUEST);

        const extension = EXTENSIONES[archivo.mimetype];
        if (!extension || !this.contenidoEsImagen(archivo.buffer, archivo.mimetype))
            throw new BusinessLogicException("El archivo debe ser una imagen JPG, PNG, WEBP o GIF", BusinessError.BAD_REQUEST);

        if (archivo.size > TAMANIO_MAXIMO_IMAGEN)
            throw new BusinessLogicException("La imagen no puede pesar más de 5 MB", BusinessError.BAD_REQUEST);

        const nombre = `${randomUUID()}.${extension}`;
        await fs.mkdir(this.carpeta(), { recursive: true });
        await fs.writeFile(join(this.carpeta(), nombre), archivo.buffer);

        return { ruta: `${PREFIJO_UPLOADS}/imagenes/${nombre}`, nombre, tamanio: archivo.size };
    }

    // Revisa los primeros bytes para que no se pueda subir otra cosa renombrada como imagen
    private contenidoEsImagen(buffer: Buffer, mimetype: string): boolean {
        const empieza = (...bytes: number[]) => bytes.every((b, i) => buffer[i] === b);
        switch (mimetype) {
            case 'image/jpeg': return empieza(0xff, 0xd8, 0xff);
            case 'image/png': return empieza(0x89, 0x50, 0x4e, 0x47);
            case 'image/gif': return buffer.subarray(0, 3).toString('ascii') === 'GIF';
            case 'image/webp': return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
            default: return false;
        }
    }
}
