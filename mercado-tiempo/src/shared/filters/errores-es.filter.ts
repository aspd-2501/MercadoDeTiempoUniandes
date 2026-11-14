/* eslint-disable prettier/prettier */
/* archivo: src/shared/filters/errores-es.filter.ts */
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';

// --- Traduce al español los mensajes que genera Nest (o sus librerías) por defecto ---
// Los errores de negocio (BusinessLogicException) y de validación ya vienen en español; este filtro
// cubre el resto: rutas inexistentes, sesión inválida, archivos muy grandes, JSON mal formado y errores inesperados.
// La respuesta conserva el formato de Nest: { statusCode, message, error }.

const TRADUCCIONES: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/^Cannot (GET|POST|PUT|PATCH|DELETE) (.+)$/, m => `La ruta ${m[1]} ${m[2]} no existe`],
    [/^Unauthorized$/, () => 'Debes iniciar sesión para hacer esto'],
    [/^Forbidden resource$/, () => 'No tienes permiso para hacer esto'],
    [/^File too large$/, () => 'La imagen no puede pesar más de 5 MB'],
    [/^Unexpected (file )?field/, () => "Debes enviar una imagen en el campo 'archivo'"],
    [/^Too many files$/, () => 'Solo se puede subir un archivo a la vez'],
    [/^Multipart: Boundary not found$/, () => 'La petición debe enviarse como multipart/form-data'],
    [/JSON/, () => 'El cuerpo de la petición no es un JSON válido'],
    [/^request entity too large$/i, () => 'El cuerpo de la petición es demasiado grande'],
    [/^Internal server error$/, () => 'Ocurrió un error inesperado en el servidor'],
];

export function traducir(mensaje: string): string {
    for (const [patron, traduccion] of TRADUCCIONES) {
        const coincidencia = mensaje.match(patron);
        if (coincidencia) return traduccion(coincidencia);
    }
    return mensaje;
}

@Catch()
export class ErroresEsFilter implements ExceptionFilter {
    private readonly logger = new Logger('Errores');

    catch(excepcion: unknown, host: ArgumentsHost) {
        const respuesta = host.switchToHttp().getResponse<Response>();

        if (excepcion instanceof HttpException) {
            const estado = excepcion.getStatus();
            const cuerpo = excepcion.getResponse();
            const base: Record<string, unknown> = typeof cuerpo === 'string' ? { statusCode: estado, message: cuerpo } : { ...(cuerpo as Record<string, unknown>) };
            const mensaje = base.message;
            base.message = Array.isArray(mensaje) ? mensaje.map(m => traducir(String(m)))
                : typeof mensaje === 'string' ? traducir(mensaje)
                : mensaje;
            respuesta.status(estado).json(base);
            return;
        }

        // Error no controlado (por ejemplo, de la base de datos): se registra y se responde un 500 genérico
        this.logger.error(excepcion instanceof Error ? excepcion.stack ?? excepcion.message : String(excepcion));
        respuesta.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Ocurrió un error inesperado en el servidor',
            error: 'Internal Server Error',
        });
    }
}
