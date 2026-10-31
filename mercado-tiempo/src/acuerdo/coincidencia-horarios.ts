/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/coincidencia-horarios.ts */

// --- Comparación de disponibilidades de los participantes de un acuerdo (RF-038) ---
//
// Cada participante entrega varias franjas. Se busca un intervalo en el que TODOS estén
// disponibles y que dure al menos las horas del acuerdo.

export interface Intervalo {
    inicio: Date;
    fin: Date;
}

export type ResultadoCoincidencia =
    | { estado: 'pendiente' }                                  // falta que alguien envíe su disponibilidad
    | { estado: 'compatible'; intervalo: Intervalo }           // hay un horario común suficiente (se asigna, RF-039)
    | { estado: 'insuficiente'; intervalo: Intervalo }         // hay horario común, pero más corto que el acuerdo
    | { estado: 'sin-coincidencia' };                          // no hay ningún horario común

const ms = (d: Date) => new Date(d).getTime();

// Ordena las franjas y une las que se cruzan o se tocan
export function fusionar(intervalos: Intervalo[]): Intervalo[] {
    const ordenados = intervalos
        .filter(i => ms(i.fin) > ms(i.inicio))
        .map(i => ({ inicio: new Date(i.inicio), fin: new Date(i.fin) }))
        .sort((a, b) => ms(a.inicio) - ms(b.inicio));

    const resultado: Intervalo[] = [];
    for (const actual of ordenados) {
        const ultimo = resultado[resultado.length - 1];
        if (ultimo && ms(actual.inicio) <= ms(ultimo.fin)) {
            if (ms(actual.fin) > ms(ultimo.fin)) ultimo.fin = actual.fin;
        } else {
            resultado.push(actual);
        }
    }
    return resultado;
}

// Intervalos en los que ambas listas están disponibles
export function intersectar(a: Intervalo[], b: Intervalo[]): Intervalo[] {
    const resultado: Intervalo[] = [];
    let i = 0, j = 0;
    while (i < a.length && j < b.length) {
        const inicio = Math.max(ms(a[i].inicio), ms(b[j].inicio));
        const fin = Math.min(ms(a[i].fin), ms(b[j].fin));
        if (fin > inicio) resultado.push({ inicio: new Date(inicio), fin: new Date(fin) });
        if (ms(a[i].fin) < ms(b[j].fin)) i++; else j++;
    }
    return resultado;
}

// disponibilidades: una lista de franjas por participante (todos ya enviaron)
export function calcularCoincidencia(horas: number, disponibilidades: Intervalo[][]): ResultadoCoincidencia {
    if (disponibilidades.length === 0)
        return { estado: 'pendiente' };

    const comunes = disponibilidades
        .map(fusionar)
        .reduce((acumulado, siguiente) => intersectar(acumulado, siguiente));

    if (comunes.length === 0)
        return { estado: 'sin-coincidencia' };

    const duracion = horas * 60 * 60 * 1000;

    // El primer horario común que alcance: se toma justo la duración del acuerdo desde su inicio
    const suficiente = comunes.find(c => ms(c.fin) - ms(c.inicio) >= duracion);
    if (suficiente)
        return { estado: 'compatible', intervalo: { inicio: suficiente.inicio, fin: new Date(ms(suficiente.inicio) + duracion) } };

    // Si ninguno alcanza, se informa el más largo
    const masLargo = comunes.reduce((x, y) => (ms(y.fin) - ms(y.inicio) > ms(x.fin) - ms(x.inicio) ? y : x));
    return { estado: 'insuficiente', intervalo: masLargo };
}
