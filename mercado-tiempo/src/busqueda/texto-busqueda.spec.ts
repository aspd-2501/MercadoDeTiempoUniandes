/* eslint-disable prettier/prettier */
/* archivo: src/busqueda/texto-busqueda.spec.ts */
import { coincide, normalizar, palabras } from './texto-busqueda';

describe('texto-busqueda', () => {
    it('normalizar quita tildes, mayúsculas y espacios de los extremos', () => {
        expect(normalizar('  Cálculo ÑANDÚ ')).toBe('calculo nandu');
        expect(normalizar(null)).toBe('');
    });

    it('palabras separa la búsqueda ignorando espacios repetidos', () => {
        expect(palabras('  Clases de   Cálculo')).toEqual(['clases', 'de', 'calculo']);
    });

    it('coincide ignora tildes y mayúsculas', () => {
        expect(coincide('CALCULO', ['Tutoría de cálculo'])).toBe(true);
    });

    it('coincide exige que aparezcan todas las palabras, en cualquiera de los textos', () => {
        expect(coincide('calculo diferencial', ['Tutoría de cálculo', 'Temas de diferencial'])).toBe(true);
        expect(coincide('calculo integral', ['Tutoría de cálculo', 'Temas de diferencial'])).toBe(false);
    });

    it('una búsqueda vacía coincide con todo', () => {
        expect(coincide('', ['lo que sea'])).toBe(true);
        expect(coincide(undefined, [])).toBe(true);
    });
});
