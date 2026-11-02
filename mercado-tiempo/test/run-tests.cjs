/* eslint-disable */
/* archivo: test/run-tests.cjs
 *
 * Ejecuta las pruebas *.spec.ts sin Jest.
 *
 * Por qué existe: Jest 29 no puede cargar los paquetes de NestJS 12, que se publican como
 * módulos ES. Node sí puede, así que este script compila el proyecto con TypeScript y corre
 * las pruebas con el mismo `expect` de Jest. Soporta describe (anidado), it/test,
 * beforeAll, beforeEach, afterEach y afterAll.
 *
 * Uso:
 *   npm run test:node                 -> todas las pruebas
 *   npm run test:node -- acuerdo      -> solo los archivos cuya ruta contiene "acuerdo"
 */
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const raiz = path.resolve(__dirname, '..');
const salida = path.join(raiz, 'dist-test');
const filtro = process.argv[2];

// 1. Compilar a dist-test
fs.rmSync(salida, { recursive: true, force: true });
console.log('Compilando...');
try {
    execFileSync(process.execPath, [
        require.resolve('typescript/bin/tsc', { paths: [raiz] }),
        '-p', path.join(raiz, 'tsconfig.json'),
        '--outDir', salida,
        '--incremental', 'false',
        '--declaration', 'false',
        '--sourceMap', 'false',
    ], { stdio: 'inherit', cwd: raiz });
} catch {
    console.error('\nLa compilación falló: corrige los errores de TypeScript de arriba.');
    process.exit(1);
}

// 2. Buscar los archivos de prueba compilados
const buscar = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const ruta = path.join(dir, e.name);
    return e.isDirectory() ? buscar(ruta) : e.name.endsWith('.spec.js') ? [ruta] : [];
});
const archivos = buscar(path.join(salida, 'src'))
    .filter(f => !filtro || path.relative(salida, f).includes(filtro))
    .sort();
if (archivos.length === 0) {
    console.error(`No se encontraron pruebas${filtro ? ` para "${filtro}"` : ''}.`);
    process.exit(1);
}

// 3. API mínima compatible con Jest
require('reflect-metadata');
global.expect = require(require.resolve('expect', { paths: [raiz] })).expect;

const nuevoGrupo = (nombre, padre) => ({ nombre, padre, hijos: [], pruebas: [], beforeAll: [], beforeEach: [], afterEach: [], afterAll: [] });
let raizGrupos, actual;

global.describe = (nombre, fn) => { const g = nuevoGrupo(nombre, actual); actual.hijos.push(g); actual = g; fn(); actual = g.padre; };
global.it = global.test = (nombre, fn) => actual.pruebas.push({ nombre, fn });
global.beforeAll = fn => actual.beforeAll.push(fn);
global.beforeEach = fn => actual.beforeEach.push(fn);
global.afterEach = fn => actual.afterEach.push(fn);
global.afterAll = fn => actual.afterAll.push(fn);
global.jest = { fn: () => () => {} };

const cadena = g => (g ? [...cadena(g.padre), g] : []);
let pasaron = 0, fallaron = 0;

async function correr(grupo) {
    for (const fn of grupo.beforeAll) await fn();
    for (const prueba of grupo.pruebas) {
        const grupos = cadena(grupo);
        const nombre = [...grupos.map(g => g.nombre).filter(Boolean), prueba.nombre].join(' › ');
        try {
            for (const g of grupos) for (const fn of g.beforeEach) await fn();
            await prueba.fn();
            for (const g of [...grupos].reverse()) for (const fn of g.afterEach) await fn();
            pasaron++;
        } catch (e) {
            fallaron++;
            console.log(`  ✗ ${nombre}\n      ${String(e && e.message).split('\n').slice(0, 6).join('\n      ')}`);
        }
    }
    for (const hijo of grupo.hijos) await correr(hijo);
    for (const fn of grupo.afterAll) await fn();
}

(async () => {
    for (const archivo of archivos) {
        raizGrupos = actual = nuevoGrupo('', undefined);
        const antes = fallaron;
        try {
            require(archivo);
            await correr(raizGrupos);
        } catch (e) {
            fallaron++;
            console.log(`  ✗ No se pudo cargar: ${e && e.message}`);
        }
        console.log(`${fallaron === antes ? '✓' : '✗'} ${path.relative(path.join(salida, 'src'), archivo).replace(/\.js$/, '.ts')}`);
    }
    console.log(`\nPruebas: ${pasaron} pasaron, ${fallaron} fallaron`);
    process.exit(fallaron ? 1 : 0);
})();
