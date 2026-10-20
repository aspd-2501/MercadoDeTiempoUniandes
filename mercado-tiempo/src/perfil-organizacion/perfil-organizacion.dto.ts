/* eslint-disable prettier/prettier */
/* archivo: src/perfil-organizacion/perfil-organizacion.dto.ts */
import { IsNotEmpty, IsUUID } from 'class-validator';

export class PerfilOrganizacionDto {
    @IsUUID()
    @IsNotEmpty()
    readonly perfilId: string;
}