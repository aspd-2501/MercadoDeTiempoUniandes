/* eslint-disable prettier/prettier */
/* archivo: src/auth/jwt-auth.guard.ts */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    // Mensajes en español: sin token, o con un token vencido o inválido
    handleRequest<TUser = unknown>(err: unknown, user: TUser, info: unknown): TUser {
        if (err || !user) {
            const sinToken = info instanceof Error && /No auth token/i.test(info.message);
            throw new UnauthorizedException(sinToken
                ? 'Debes iniciar sesión para hacer esto'
                : 'Tu sesión expiró o no es válida. Inicia sesión de nuevo');
        }
        return user;
    }
}
