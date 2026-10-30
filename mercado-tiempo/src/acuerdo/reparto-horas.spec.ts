/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/reparto-horas.spec.ts */
import { calcularReparto, ParticipanteReparto, validarComposicion, validarSaldosReceptores } from './reparto-horas';
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

    it('3 prestadores y 1 receptor: el receptor paga las horas de cada prestador', () => {
        const r = calcularReparto(2, [prestador('p'), prestador('q'), prestador('s'), receptor('a')]);
        expect(r.cuotas.get('a')).toBe(6);
        expect(r.pagoPrestador).toBe(2);
        expect(r.aporteFondo).toBe(0);
    });

    it('lanza error con varios prestadores y varios receptores', () => {
        expect(() => calcularReparto(1, [prestador('p'), prestador('q'), receptor('a'), receptor('b')]))
            .toThrow("An acuerdo can have several PRESTADORES or several RECEPTORES, but not both");
    });

    it('en toda composición permitida las horas que salen son iguales a las que entran', () => {
        for (let horas = 1; horas <= 5; horas++)
            for (let n = 1; n <= 6; n++)
                for (const [p, rec] of [[1, n], [n, 1]]) {
                    const participantes = [
                        ...Array.from({ length: p }, (_, i) => prestador(`p${i}`)),
                        ...Array.from({ length: rec }, (_, i) => receptor(`r${i}`)),
                    ];
                    const r = calcularReparto(horas, participantes);
                    const pagado = [...r.cuotas.values()].reduce((x, y) => x + y, 0);
                    expect(pagado).toBe(p * r.pagoPrestador + r.aporteFondo);
                }
    });
});

describe('validarComposicion', () => {
    it('permite 1 a 1, 1 a varios y varios a 1', () => {
        expect(() => validarComposicion([prestador('p'), receptor('a')])).not.toThrow();
        expect(() => validarComposicion([prestador('p'), receptor('a'), receptor('b')])).not.toThrow();
        expect(() => validarComposicion([prestador('p'), prestador('q'), receptor('a')])).not.toThrow();
    });

    it('no permite varios a varios', () => {
        expect(() => validarComposicion([prestador('p'), prestador('q'), receptor('a'), receptor('b')]))
            .toThrow("An acuerdo can have several PRESTADORES or several RECEPTORES, but not both");
    });
});

describe('validarSaldosReceptores', () => {
    it('no lanza error si todos los receptores pueden pagar su cuota', () => {
        expect(() => validarSaldosReceptores(2, [prestador('p'), receptor('a', 2)])).not.toThrow();
    });

    it('lanza error si el receptor no puede pagar las horas de todos los prestadores', () => {
        expect(() => validarSaldosReceptores(2, [prestador('p'), prestador('q'), receptor('a', 3)]))
            .toThrow("A RECEPTOR does not have enough saldo to pay its share of the acuerdo");
    });
});
