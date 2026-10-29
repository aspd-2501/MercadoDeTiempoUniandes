/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/reparto-horas.ts */
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { RolParticipante } from './participante-acuerdo.entity';

// --- Cómo se mueven las horas de un acuerdo realizado ---
//
// - Cada PRESTADOR recibe las horas del acuerdo.
// - Cada RECEPTOR paga al menos las horas del acuerdo.
// - Si hay más receptores que prestadores, lo que sobra va al fondo comunitario.
//     Ej.: 1 tutor, 3 estudiantes, 2 h -> cada estudiante paga 2 h, el tutor recibe 2 h, el fondo 4 h.
// - Si hay más prestadores que receptores, los receptores cubren entre todos lo de los prestadores.
//     Ej.: 2 tutores, 1 estudiante, 2 h -> el estudiante paga 4 h y cada tutor recibe 2 h.
//   Si no se puede dividir exacto, los primeros receptores pagan 1 h más.

export interface ParticipanteReparto {
    idPerfil: string;
    rol: RolParticipante;
    saldo: number;
}

export interface RepartoHoras {
    cuotas: Map<string, number>;   // horas que paga cada receptor (por idPerfil)
    pagoPrestador: number;         // horas que recibe cada prestador
    aporteFondo: number;           // horas que van al fondo comunitario
}

export function calcularReparto(horas: number, participantes: ParticipanteReparto[]): RepartoHoras {
    const prestadores = participantes.filter(p => p.rol === RolParticipante.PRESTADOR).length;
    const receptores = participantes
        .filter(p => p.rol === RolParticipante.RECEPTOR)
        .map(p => p.idPerfil)
        .sort();

    const cuotas = new Map<string, number>();
    if (receptores.length === 0)
        return { cuotas, pagoPrestador: horas, aporteFondo: 0 };

    const totalPagado = Math.max(receptores.length, prestadores) * horas;
    const base = Math.floor(totalPagado / receptores.length);
    const resto = totalPagado % receptores.length;
    receptores.forEach((idPerfil, i) => cuotas.set(idPerfil, base + (i < resto ? 1 : 0)));

    return { cuotas, pagoPrestador: horas, aporteFondo: totalPagado - prestadores * horas };
}

// Cada receptor debe tener saldo para su cuota (RF-043)
export function validarSaldosReceptores(horas: number, participantes: ParticipanteReparto[]) {
    const { cuotas } = calcularReparto(horas, participantes);
    for (const p of participantes) {
        const cuota = cuotas.get(p.idPerfil);
        if (cuota !== undefined && p.saldo < cuota)
            throw new BusinessLogicException("A RECEPTOR does not have enough saldo to pay its share of the acuerdo", BusinessError.PRECONDITION_FAILED);
    }
}
