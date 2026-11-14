# Backend local y datos de prueba — Mercado de Tiempo Uniandes

## 1. Requisitos

- Node.js y npm compatibles con el proyecto.
- Docker Desktop iniciado (o PostgreSQL local disponible en el puerto 5432).
- Una copia del directorio `mercado-tiempo/`.

**Atención:** la configuración actual del backend trae credenciales PostgreSQL literales (`postgres/postgres`) y `synchronize: true`. Esta guía es exclusivamente para desarrollo local; no usar en producción. No ejecutar el SQL sobre bases con datos importantes.

## 2. Preparar los archivos

Coloca en la carpeta raíz del backend, junto a `package.json`:

- `compose.local.yml`
- `seed_mercado_tiempo.sql`
- `verificar_seed_mercado_tiempo.sql`

## 3. Iniciar PostgreSQL

Abre una terminal dentro de `mercado-tiempo/` y ejecuta:

```powershell
docker compose -f compose.local.yml up -d
docker ps
```

Se crea el contenedor `mercado-tiempo-postgres`, la base `mercado-tiempo` y un volumen de almacenamiento. La base solo expone `127.0.0.1:5432`. Si ya tienes PostgreSQL usando el puerto 5432, deténlo o ajusta la configuración del backend y el mapeo de puertos.

## 4. Iniciar el backend (ANTES de poblar)

En la misma carpeta abre otra terminal:

```powershell
npm ci
npm run start:dev
```

NestJS escucha en `http://localhost:3000`. En el arranque, TypeORM crea las tablas si la conexión se establece correctamente, porque `src/app.module.ts` contiene `synchronize: true`.

**Confirma en el log que Nest haya iniciado sin errores** antes de seguir al paso 5. Si falla, no ejecutes el seed.

## 5. Cargar los datos en PostgreSQL

En una nueva terminal PowerShell, ubicada en la carpeta `mercado-tiempo/`:

```powershell
docker cp .\seed_mercado_tiempo.sql mercado-tiempo-postgres:/tmp/seed.sql
docker exec mercado-tiempo-postgres psql -v ON_ERROR_STOP=1 -U postgres -d mercado-tiempo -f /tmp/seed.sql
```

Deberías ver sentencias `INSERT`, `UPDATE` y terminar con `COMMIT`. Si aparece un error, el bloque transaccional revierte los cambios de ese intento.

**Para bases ya pobladas**, el script evita duplicar registros por identificador fijo (`ON CONFLICT DO NOTHING`) pero no es un migrador ni sincroniza datos existentes. Se recomienda ejecutarlo inicialmente en una base vacía.

## 6. Verificar los datos

```powershell
docker cp .\verificar_seed_mercado_tiempo.sql mercado-tiempo-postgres:/tmp/verificar.sql
docker exec mercado-tiempo-postgres psql -v ON_ERROR_STOP=1 -U postgres -d mercado-tiempo -f /tmp/verificar.sql
```

En una base limpia se esperan **10 usuarios, 10 perfiles, 12 categorías, 12 servicios, 14 publicaciones, 9 acuerdos, 19 participaciones, 34 horarios, 10 transacciones y 18 mensajes**. En total el seed inserta **275 filas distribuidas en las 31 tablas**.

## 7. Probar API y login

Los controladores están versionados con el prefijo `/api/v1`:

- `GET http://localhost:3000/api/v1/perfiles-miembro`
- `GET http://localhost:3000/api/v1/servicios-ofrecidos`
- `GET http://localhost:3000/api/v1/posts-ayuda`
- `GET http://localhost:3000/api/v1/acuerdos`
- `POST http://localhost:3000/api/v1/auth/login`

Todos los usuarios demo tienen la **contraseña `Demo1234!`** (almacenada como hash bcrypt, no texto plano).

Usuarios de ejemplo: `demo01` (Ana), `demo02` (Bruno), ..., `demo10` (Jorge).

Con PowerShell:

```powershell
$body = @{ idUniandes = 'demo01'; contrasenia = 'Demo1234!' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/v1/auth/login' -ContentType 'application/json' -Body $body
```

Para el frontend Vite, configura la URL base de API `http://localhost:3000/api/v1` en el cliente HTTP o en una variable `VITE_API_URL`, **si tu frontend realmente lee esa variable**. El backend ya ejecuta `app.enableCors()`.

## 8. Escenarios representados

- `a01`: acuerdo realizado 1:1, 2 horas; Ana paga 2, Bruno recibe 2.
- `a02`: acuerdo grupal realizado, 2 horas; Diego y Elena pagan 2 cada uno, Carla recibe 2 y el fondo recibe 2.
- `a03`: acuerdo definido para una fecha futura.
- `a04`: acuerdo todavía en creación.
- `a05`: acuerdo previamente definido con propuesta de modificación pendiente (de 2 a 3 horas).
- `a06`: acuerdo definido, aún no realizado.
- `a07`: acuerdo cancelado mediante solicitud aprobada.
- `a08`: acuerdo en creación desde otra publicación.
- `a09`: acuerdo nacido de una solicitud dirigida a una organización.
- Dos donaciones: Elena a Ana (1 hora), Ana al fondo comunitario (2 horas).

Los campos de saldos finales y el historial de transacciones se han hecho consistentes entre sí. Los movimientos mostrados no explican los saldos completos desde cero: se supone que las cuentas ya tenían un saldo inicial anterior al período de ejemplo.

## 9. Alcance y verificación

- Revisados los **nombres de las 31 tablas**, las columnas definidas en los archivos `*.entity.ts`, los enums y las restricciones `CHECK`.
- Comprobadas estáticamente **443 referencias de claves foráneas**, sin referencias faltantes.
- **No se ha ejecutado el SQL contra una instancia real de PostgreSQL en esta sesión**. La primera prueba real de creación de esquema y carga sigue siendo necesaria. Si el backend falla antes del seed, revisa la conexión y los errores de sincronización TypeORM.
- El contenido es ficticio y solo de desarrollo; no implica una garantía de que todos los servicios del backend reproduzcan o validen exactamente las mismas condiciones al cargar registros por SQL directamente.

## 10. Reiniciar desde cero (destructivo)

Solo si deseas **borrar todos los datos locales del contenedor**:

```powershell
docker compose -f compose.local.yml down -v
docker compose -f compose.local.yml up -d
```

Reinicia NestJS para que TypeORM genere las tablas de nuevo, y vuelve a ejecutar el seed. **No ejecutes `down -v` sobre una base cuyos datos quieras conservar.**
