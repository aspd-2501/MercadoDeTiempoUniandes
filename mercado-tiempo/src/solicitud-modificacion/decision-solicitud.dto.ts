/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-modificacion/decision-solicitud.dto.ts */
import { IsNotEmpty, IsUUID } from 'class-validator';

// --- Participante que aprueba, rechaza o retira la propuesta ---
export class DecisionSolicitudDto {
    @IsUUID()
    @IsNotEmpty()
    readonly perfilId: string;
}
