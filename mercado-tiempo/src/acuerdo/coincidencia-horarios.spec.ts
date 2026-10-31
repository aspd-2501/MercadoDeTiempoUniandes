/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/coincidencia-horarios.spec.ts */
import { calcularCoincidencia, fusionar, intersectar, Intervalo } from './coincidencia-horarios';

// Franja del día 10 de noviembre de 2026 entre dos horas (UTC)
const f = (desde: number, hasta: number, dia = 10): Intervalo => ({
    inicio: new Date(Date.UTC(2026, 10, dia, desde)),
    fin: new Date(Date.UTC(2026, 10, dia, hasta)),
});
const hora = (d: Date) => new Date(d).getUTCHours();

describe('fusionar', () => {
    it('une franjas que se cruzan o se tocan y las ordena', () => {
        const r = fusionar([f(14, 16), f(8, 10), f(9, 12), f(12, 13)]);
        expect(r.map(i => [hora(i.inicio), hora(i.fin)])).toEqual([[8, 13], [14, 16]]);
    });

    it('descarta franjas vacías o invertidas', () => {
        expect(fusionar([f(10, 10), f(12, 11)])).toEqual([]);
    });
});

describe('intersectar', () => {
    it('devuelve solo los tramos comunes', () => {
        const r = intersectar([f(8, 12), f(14, 18)], [f(10, 15)]);
        expect(r.map(i => [hora(i.inicio), hora(i.fin)])).toEqual([[10, 12], [14, 15]]);
    });
});

describe('calcularCoincidencia', () => {
    it('compatible: asigna justo las horas del acuerdo desde el inicio del primer tramo común suficiente', () => {
        const r = calcularCoincidencia(2, [[f(8, 12), f(14, 18)], [f(11, 12), f(15, 18)]]);
        expect(r.estado).toBe('compatible');
        if (r.estado === 'compatible') {
            expect(hora(r.intervalo.inicio)).toBe(15);
            expect(hora(r.intervalo.fin)).toBe(17);
        }
    });

    it('compatible con tres participantes', () => {
        const r = calcularCoincidencia(1, [[f(8, 18)], [f(9, 12)], [f(11, 14)]]);
        expect(r.estado).toBe('compatible');
        if (r.estado === 'compatible') expect(hora(r.intervalo.inicio)).toBe(11);
    });

    it('insuficiente: hay tramo común pero más corto, y se informa el más largo', () => {
        const r = calcularCoincidencia(3, [[f(8, 10), f(14, 18)], [f(9, 10), f(14, 16)]]);
        expect(r.estado).toBe('insuficiente');
        if (r.estado === 'insuficiente') {
            expect(hora(r.intervalo.inicio)).toBe(14);
            expect(hora(r.intervalo.fin)).toBe(16);
        }
    });

    it('sin-coincidencia: no hay ningún tramo común', () => {
        expect(calcularCoincidencia(1, [[f(8, 10)], [f(10, 12)]]).estado).toBe('sin-coincidencia');
    });

    it('sin-coincidencia cuando alguien envía una disponibilidad vacía', () => {
        expect(calcularCoincidencia(1, [[f(8, 12)], []]).estado).toBe('sin-coincidencia');
    });

    it('funciona con franjas en días distintos', () => {
        const r = calcularCoincidencia(2, [[f(8, 10, 10), f(8, 12, 11)], [f(9, 11, 11)]]);
        expect(r.estado).toBe('compatible');
        if (r.estado === 'compatible') expect(new Date(r.intervalo.inicio).getUTCDate()).toBe(11);
    });
});
