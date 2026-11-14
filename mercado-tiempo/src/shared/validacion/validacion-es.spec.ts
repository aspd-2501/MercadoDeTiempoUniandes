/* eslint-disable prettier/prettier */
/* archivo: src/shared/validacion/validacion-es.spec.ts */
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CrearPostAyudaDto } from '../../post-ayuda/crear-post-ayuda.dto';
import { AjustarSaldoDto } from '../../perfil-miembro/ajustar-saldo.dto';
import { mensajesValidacion } from './validacion-es';
import { traducir } from '../filters/errores-es.filter';

const mensajes = async (clase: any, datos: object) => mensajesValidacion(await validate(plainToInstance(clase, datos) as object));

describe('Mensajes de validación en español', () => {
    it('should say which fields are required', async () => {
        expect(await mensajes(AjustarSaldoDto, {})).toEqual(['El campo saldo es obligatorio']);
        expect(await mensajes(AjustarSaldoDto, { saldo: 'diez' })).toContain('El campo saldo debe ser un número entero');
    });

    it('should include the limits of min', async () => {
        expect(await mensajes(AjustarSaldoDto, { saldo: -2 })).toEqual(['El campo saldo debe ser mayor o igual a 0']);
    });

    it('should translate each, array sizes and nested fields', async () => {
        const result = await mensajes(CrearPostAyudaDto, {
            titulo: 'T', descripcion: 'D', horas: 2, imagen: 'i', ofrece: true, cupo: 1, cupoLleno: false,
            fechaCreacion: '2026-11-10T10:00:00Z', perfilAutorId: '6f1c2b8e-4d5a-4b7c-9e3f-1a2b3c4d5e6f',
            categoriaIds: ['no-es-uuid', 'a', 'b', 'c'],
            horarios: [{ fechaInicio: 'mañana', fechaFin: '2026-11-10T12:00:00Z', preferido: 'si' }],
        });
        expect(result).toContain('Cada valor de categoriaIds debe ser un id válido (UUID)');
        expect(result).toContain('El campo categoriaIds no puede tener más de 3 elementos');
        expect(result).toContain('El campo horarios[0].fechaInicio debe ser una fecha válida (formato ISO 8601)');
        expect(result).toContain('El campo horarios[0].preferido debe ser verdadero o falso');
    });

    it('should return no messages for valid data', async () => {
        expect(await mensajes(AjustarSaldoDto, { saldo: 3 })).toEqual([]);
    });
});

describe('Traducción de los mensajes por defecto de Nest', () => {
    it('should translate the default messages', () => {
        expect(traducir('Cannot GET /api/v1/nada')).toBe('La ruta GET /api/v1/nada no existe');
        expect(traducir('Unauthorized')).toBe('Debes iniciar sesión para hacer esto');
        expect(traducir('Unexpected file field - foto')).toBe("Debes enviar una imagen en el campo 'archivo'");
        expect(traducir('File too large')).toBe('La imagen no puede pesar más de 5 MB');
        expect(traducir("Unexpected token } in JSON at position 10")).toBe('El cuerpo de la petición no es un JSON válido');
        expect(traducir('Internal server error')).toBe('Ocurrió un error inesperado en el servidor');
    });

    it('should keep messages that are already in español', () => {
        expect(traducir('No se encontró el acuerdo')).toBe('No se encontró el acuerdo');
    });
});
