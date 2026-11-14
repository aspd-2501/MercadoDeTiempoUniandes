/* eslint-disable prettier/prettier */
/* archivo: src/shared/validacion/validacion-es.ts */
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

// --- Mensajes de validación (class-validator) en español ---
// La respuesta mantiene el formato de Nest: { statusCode: 400, message: string[], error: "Bad Request" }

const numero = (mensaje: string) => mensaje.match(/-?\d+(\.\d+)?/)?.[0] ?? '';
const elementos = (mensaje: string) => { const n = numero(mensaje); return `${n} ${n === '1' ? 'elemento' : 'elementos'}`; };

const PLANTILLAS: Record<string, (campo: string, original: string) => string> = {
    isNotEmpty: c => `${c} es obligatorio`,
    isDefined: c => `${c} es obligatorio`,
    isString: c => `${c} debe ser un texto`,
    isUuid: c => `${c} debe ser un id válido (UUID)`,
    isNumber: c => `${c} debe ser un número`,
    isInt: c => `${c} debe ser un número entero`,
    isBoolean: c => `${c} debe ser verdadero o falso`,
    isDateString: c => `${c} debe ser una fecha válida (formato ISO 8601)`,
    isIso8601: c => `${c} debe ser una fecha válida (formato ISO 8601)`,
    isEnum: (c, m) => `${c} debe ser uno de estos valores: ${m.split(':').slice(1).join(':').trim()}`,
    isArray: c => `${c} debe ser una lista`,
    arrayNotEmpty: c => `${c} no puede estar vacío`,
    arrayMinSize: (c, m) => `${c} debe tener al menos ${elementos(m)}`,
    arrayMaxSize: (c, m) => `${c} no puede tener más de ${elementos(m)}`,
    min: (c, m) => `${c} debe ser mayor o igual a ${numero(m)}`,
    max: (c, m) => `${c} debe ser menor o igual a ${numero(m)}`,
    minLength: (c, m) => `${c} debe tener al menos ${numero(m)} caracteres`,
    maxLength: (c, m) => `${c} no puede tener más de ${numero(m)} caracteres`,
    isEmail: c => `${c} debe ser un correo válido`,
    isUrl: c => `${c} debe ser una URL válida`,
    nestedValidation: c => `${c} tiene un formato inválido`,
    whitelistValidation: c => `${c} no está permitido`,
};

// Convierte los errores de class-validator (incluidos los anidados, ej. horarios[0].fechaInicio) en frases
export function mensajesValidacion(errores: ValidationError[], ruta = ''): string[] {
    const mensajes: string[] = [];
    for (const error of errores) {
        const propiedad = /^\d+$/.test(error.property) ? `${ruta}[${error.property}]` : (ruta ? `${ruta}.${error.property}` : error.property);

        // Si el campo no llegó, basta con decir que es obligatorio (sin repetir que debe ser texto, número, etc.)
        const reglas = Object.keys(error.constraints ?? {});
        const vacio = error.value === undefined || error.value === null || error.value === '';
        if (vacio && reglas.some(r => r === 'isNotEmpty' || r === 'isDefined' || r === 'arrayNotEmpty')) {
            mensajes.push(`El campo ${propiedad} es obligatorio`);
            continue;
        }

        for (const [regla, original] of Object.entries(error.constraints ?? {})) {
            // Con { each: true } class-validator dice "each value in X ..."
            const campo = original.startsWith('each value in') ? `Cada valor de ${propiedad}` : `El campo ${propiedad}`;
            const plantilla = PLANTILLAS[regla];
            mensajes.push(plantilla ? plantilla(campo, original) : original);
        }

        if (error.children?.length)
            mensajes.push(...mensajesValidacion(error.children, propiedad));
    }
    return mensajes;
}

// ValidationPipe global con los mensajes en español (se usa en main.ts)
export function crearValidationPipe(): ValidationPipe {
    return new ValidationPipe({
        exceptionFactory: errores => new BadRequestException(mensajesValidacion(errores)),
    });
}
