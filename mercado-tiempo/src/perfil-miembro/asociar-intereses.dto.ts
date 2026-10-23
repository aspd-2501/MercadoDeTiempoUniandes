/* eslint-disable prettier/prettier */
/* archivo: src/perfil-miembro/asociar-intereses.dto.ts */
import { IsArray, IsUUID } from 'class-validator';

export class AsociarInteresesDto {
    @IsArray()
    @IsUUID('4', { each: true })
    readonly categoriaIds: string[];
}
