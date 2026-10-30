/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/reparto-horas.ts */
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { RolParticipante } from './participante-acuerdo.entity';

// --- Cómo se mueven las horas de un acuerdo realizado ---
//
// Composiciones permitidas (nunca varios prestadores con varios receptores):
//   - 1 prestador y 1 receptor:  el receptor paga las horas y el prestador las recibe.
//   - 1 prestador y N receptores: cada receptor paga las horas, el prestador recibe las horas
//                                 y el resto va al fondo comunitario.
//       Ej.: 1 tutor, 3 estudiantes, 2 h -> cada estudiante paga 2 h, el tutor recibe 2 h, el fondo 4 h.
//   - N prestadores y 1 receptor: el receptor paga las horas de cada prestador.
//       Ej.: 2 tutores, 1 estudiante, 2 h -> el estudiante paga 4 h y cada tutor recibe 2 h.

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

// Un acuerdo puede tener varios prestadores o varios receptores, pero no ambos a la vez
export function validarComposicion(participantes: ParticipanteReparto[]) {
    const prestadores = participantes.filter(p => p.rol === RolParticipante.PRESTADOR).length;
    const receptores = participantes.filter(p => p.rol === RolParticipante.RECEPTOR).length;
    if (prestadores > 1 && receptores > 1)
        throw new BusinessLogicException("An acuerdo can have several PRESTADORES or several RECEPTORES, but not both", BusinessError.PRECONDITION_FAILED);
}

export function calcularReparto(horas: number, participantes: ParticipanteReparto[]): RepartoHoras {
    validarComposicion(participantes);

    const prestadores = participantes.filter(p => p.rol === RolParticipante.PRESTADOR).length;
    const receptores = participantes.filter(p => p.rol === RolParticipante.RECEPTOR).map(p => p.idPerfil);

    // Con un solo receptor, paga las horas de cada prestador; con varios, cada uno paga las horas
    const cuota = receptores.length === 1 ? horas * Math.max(prestadores, 1) : horas;

    const cuotas = new Map<string, number>();
    receptores.forEach(idPerfil => cuotas.set(idPerfil, cuota));

    const aporteFondo = receptores.length > 0 ? cuota * receptores.length - prestadores * horas : 0;
    return { cuotas, pagoPrestador: horas, aporteFondo: Math.max(aporteFondo, 0) };
}

// Composición válida y cada receptor con saldo para su cuota (RF-043)
export function validarSaldosReceptores(horas: number, participantes: ParticipanteReparto[]) {
    const { cuotas } = calcularReparto(horas, participantes);
    for (const p of participantes) {
        const cuota = cuotas.get(p.idPerfil);
        if (cuota !== undefined && p.saldo < cuota)
            throw new BusinessLogicException("A RECEPTOR does not have enough saldo to pay its share of the acuerdo", BusinessError.PRECONDITION_FAILED);
    }
}
