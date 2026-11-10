/* eslint-disable prettier/prettier */
/* archivo: src/imagen/imagen.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ImagenService, ArchivoSubido, TAMANIO_MAXIMO_IMAGEN } from './imagen.service';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);

const archivo = (buffer: Buffer, mimetype: string, originalname = 'foto'): ArchivoSubido =>
    ({ buffer, mimetype, originalname, size: buffer.length });

describe('ImagenService', () => {
    let service: ImagenService;
    const guardadas: string[] = [];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({ providers: [ImagenService] }).compile();
        service = module.get<ImagenService>(ImagenService);
    });

    afterEach(async () => {
        for (const nombre of guardadas.splice(0)) await fs.rm(join(service.carpeta(), nombre), { force: true });
    });

    it('guardar should save a PNG and return its ruta', async () => {
        const result = await service.guardar(archivo(PNG, 'image/png', 'mi foto.png'));
        guardadas.push(result.nombre);
        expect(result.ruta).toMatch(/^\/uploads\/imagenes\/[0-9a-f-]{36}\.png$/);
        expect(result.tamanio).toBe(PNG.length);
        expect(await fs.readFile(join(service.carpeta(), result.nombre))).toEqual(PNG);
    });

    it('guardar should use a new name each time (not the original one)', async () => {
        const a = await service.guardar(archivo(JPG, 'image/jpeg', 'foto.jpg'));
        const b = await service.guardar(archivo(JPG, 'image/jpeg', 'foto.jpg'));
        guardadas.push(a.nombre, b.nombre);
        expect(a.nombre).not.toBe(b.nombre);
        expect(a.nombre.endsWith('.jpg')).toBe(true);
        expect(a.nombre).not.toContain('foto');
    });

    it('guardar should reject a request without file', async () => {
        await expect(() => service.guardar(undefined))
            .rejects.toHaveProperty("message", "An image file must be sent in the field 'archivo'");
    });

    it('guardar should reject files that are not images', async () => {
        await expect(() => service.guardar(archivo(Buffer.from('%PDF-1.4'), 'application/pdf')))
            .rejects.toHaveProperty("message", "The file must be a JPG, PNG, WEBP or GIF image");
    });

    it('guardar should reject a file renamed as an image', async () => {
        await expect(() => service.guardar(archivo(Buffer.from('no soy una imagen'), 'image/png')))
            .rejects.toHaveProperty("message", "The file must be a JPG, PNG, WEBP or GIF image");
    });

    it('guardar should reject images larger than 5 MB', async () => {
        const grande = Buffer.concat([PNG, Buffer.alloc(TAMANIO_MAXIMO_IMAGEN)]);
        await expect(() => service.guardar(archivo(grande, 'image/png')))
            .rejects.toHaveProperty("message", "The image must not be larger than 5 MB");
    });
});
