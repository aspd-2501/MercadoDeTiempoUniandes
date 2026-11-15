/* eslint-disable prettier/prettier */
/* archivo: src/auth/optional-jwt-auth.guard.ts */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Como JwtAuthGuard, pero la sesión es opcional: si llega un token válido, request.user queda con el usuario;
// si no llega token (o no es válido), la petición sigue igual, sin usuario.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
        return (err || !user ? undefined : user) as TUser;
    }
}
