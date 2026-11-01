/* eslint-disable prettier/prettier */
/* archivo: src/busqueda/texto-busqueda.ts */

// Quita tildes, pasa a minúsculas y recorta: "Cálculo " -> "calculo"
export function normalizar(texto: string | null | undefined): string {
    return (texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

// Palabras de la búsqueda, ya normalizadas: "  Clases de  Cálculo" -> ["clases", "de", "calculo"]
export function palabras(consulta: string | null | undefined): string[] {
    return normalizar(consulta).split(/\s+/).filter(p => p.length > 0);
}

// Coincide si CADA palabra de la búsqueda aparece en al menos uno de los textos.
// Una búsqueda vacía coincide con todo.
export function coincide(consulta: string | null | undefined, textos: (string | null | undefined)[]): boolean {
    const buscadas = palabras(consulta);
    if (buscadas.length === 0) return true;
    const contenido = textos.map(normalizar).join(' \n ');
    return buscadas.every(p => contenido.includes(p));
}
