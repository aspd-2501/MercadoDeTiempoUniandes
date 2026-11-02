/* eslint-disable prettier/prettier */
/* archivo: src/perfil-miembro/estado-actividad.dto.ts */
import { IsBoolean, IsNotEmpty } from 'class-validator';

// true = activo en el Banco de Tiempo, false = inactivo (RF-006)
export class EstadoActividadDto {
    @IsBoolean()
    @IsNotEmpty()
    readonly activo: boolean;
}
