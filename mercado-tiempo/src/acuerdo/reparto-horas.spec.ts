/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/reparto-horas.spec.ts */
import { calcularReparto, ParticipanteReparto, validarSaldosReceptores } from './reparto-horas';
import { RolParticipante } from './participante-acuerdo.entity';

const prestador = (id: string, saldo = 0): ParticipanteReparto => ({ idPerfil: id, rol: RolParticipante.PRESTADOR, saldo });
const receptor = (id: string, saldo = 100): ParticipanteReparto => ({ idPerfil: id, rol: RolParticipante.RECEPTOR, saldo });

describe('calcularReparto', () => {
    it('1 prestador y 1 receptor: el receptor paga las horas y no hay aporte al fondo', () => {
        const r = calcularReparto(2, [prestador('p'), receptor('a')]);
        expect(r.cuotas.get('a')).toBe(2);
        expect(r.pagoPrestador).toBe(2);
        expect(r.aporteFondo).toBe(0);
    });

    it('1 prestador y 3 receptores: cada receptor paga las horas y el resto va al fondo', () => {
        const r = calcularReparto(2, [prestador('p'), receptor('a'), receptor('b'), receptor('c')]);
        expect([...r.cuotas.values()]).toEqual([2, 2, 2]);
        expect(r.pagoPrestador).toBe(2);
        expect(r.aporteFondo).toBe(4);
    });

    it('2 prestadores y 1 receptor: el receptor paga lo de ambos prestadores', () => {
        const r = calcularReparto(2, [prestador('p'), prestador('q'), receptor('a')]);
        expect(r.cuotas.get('a')).toBe(4);
        expect(r.pagoPrestador).toBe(2);
        expect(r.aporteFondo).toBe(0);
    });

    it('3 prestadores y 2 receptores: el total se reparte y los primeros pagan 1 hora más', () => {
        const r = calcularReparto(1, [prestador('p'), prestador('q'), prestador('s'), receptor('a'), receptor('b')]);
        expect(r.cuotas.get('a')).toBe(2);
        expect(r.cuotas.get('b')).toBe(1);
        expect(r.aporteFondo).toBe(0);
    });

    it('las horas que salen siempre son iguales a las que entran', () => {
        const r = calcularReparto(3, [prestador('p'), prestador('q'), receptor('a'), receptor('b'), receptor('c'), receptor('d')]);
        const pagado = [...r.cuotas.values()].reduce((x, y) => x + y, 0);
        expect(pagado).toBe(2 * r.pagoPrestador + r.aporteFondo);
    });
});

describe('validarSaldosReceptores', () => {
    it('no lanza error si todos los receptores pueden pagar su cuota', () => {
        expect(() => validarSaldosReceptores(2, [prestador('p'), receptor('a', 2)])).not.toThrow();
    });

    it('lanza error si un receptor no puede pagar su cuota', () => {
        expect(() => validarSaldosReceptores(2, [prestador('p'), prestador('q'), receptor('a', 3)]))
            .toThrow("A RECEPTOR does not have enough saldo to pay its share of the acuerdo");
    });
});
