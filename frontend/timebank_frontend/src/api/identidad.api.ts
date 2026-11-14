/**
 * Identidad: contratos comprobados en src(1).zip (NestJS, noviembre de 2026).
 * VITE_API_URL debe incluir el prefijo /api/v1.
 */
const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'
).replace(/\/+$/, '');

export interface CredencialesLogin {
  idUniandes: string;
  contrasenia: string;
}

export interface UsuarioAPI {
  id: string;
  idUniandes: string;
}

/** Perfil que devuelve AuthService.sesion(); NO trae intereses ni estadísticas agregadas. */
export interface PerfilSesionAPI {
  id: string;
  nombre: string;
  edad: number;
  afiliacionUniandes: string;
  imagen: string;
  descripcion: string;
  estadoActividad: boolean; // visibilidad pública, NO disponibilidad personal
  saldo: number;
}

export interface SesionUsuarioAPI {
  usuario: UsuarioAPI;
  perfil: PerfilSesionAPI | null;
  esModerador: boolean;
}

export interface RespuestaLoginAPI extends SesionUsuarioAPI {
  access_token: string;
}

export interface CategoriaAPI {
  id: string;
  nombre: string;
}

export type PerfilCreadoAPI = PerfilSesionAPI;

export interface DatosRegistro {
  idUniandes: string;
  contrasenia: string;
  nombre: string;
  edad: number;
  afiliacionUniandes: string;
  imagen: string;
  descripcion: string;
  estadoActividad: boolean;
  categoriaIds: string[];
}

export interface ResultadoRegistro {
  usuario: UsuarioAPI;
  perfil: PerfilCreadoAPI;
  autenticacion: RespuestaLoginAPI;
}

/** Para distinguir un token expirado de un problema de red. */
export class ErrorHTTP extends Error {
  readonly estadoHTTP: number;

  constructor(mensaje: string, estadoHTTP: number) {
    super(mensaje);
    this.name = 'ErrorHTTP';
    this.estadoHTTP = estadoHTTP;
  }
}

export class ErrorRegistroParcial extends Error {
  readonly usuarioId: string;
  readonly perfilId?: string;

  constructor(mensaje: string, usuarioId: string, perfilId?: string) {
    super(mensaje);
    this.name = 'ErrorRegistroParcial';
    this.usuarioId = usuarioId;
    this.perfilId = perfilId;
  }
}

async function solicitar<T>(
  ruta: string,
  metodo: 'GET' | 'POST' | 'PUT',
  datos?: unknown,
  token?: string,
): Promise<T> {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: {
      Accept: 'application/json',
      ...(datos !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(datos !== undefined ? { body: JSON.stringify(datos) } : {}),
  });

  const texto = await respuesta.text();
  let contenido: unknown = null;
  if (texto) {
    try {
      contenido = JSON.parse(texto) as unknown;
    } catch {
      contenido = texto;
    }
  }

  if (!respuesta.ok) {
    const objeto = contenido && typeof contenido === 'object'
      ? contenido as Record<string, unknown>
      : null;
    const mensaje = objeto?.message;
    const detalle = typeof mensaje === 'string'
      ? mensaje
      : Array.isArray(mensaje)
        ? mensaje.map(String).join('; ')
        : typeof contenido === 'string'
          ? contenido
          : `Error HTTP ${respuesta.status}`;
    throw new ErrorHTTP(detalle, respuesta.status);
  }

  return contenido as T;
}

/** POST /api/v1/auth/login -> token y sesión con perfil asociado. */
export function autenticar(credenciales: CredencialesLogin): Promise<RespuestaLoginAPI> {
  return solicitar<RespuestaLoginAPI>('/auth/login', 'POST', credenciales);
}

/** GET /api/v1/auth/me -> sesión sin token (este se conserva aparte). */
export function consultarSesion(token: string): Promise<SesionUsuarioAPI> {
  return solicitar<SesionUsuarioAPI>('/auth/me', 'GET', undefined, token);
}

/** GET /api/v1/perfiles-miembro/usuario/:usuarioId (alternativa, no sustituye /auth/me). */
export function obtenerPerfilPorUsuario(usuarioId: string): Promise<PerfilSesionAPI> {
  return solicitar<PerfilSesionAPI>(`/perfiles-miembro/usuario/${encodeURIComponent(usuarioId)}`, 'GET');
}

/** GET /api/v1/categorias */
export function obtenerCategoriasRegistro(): Promise<CategoriaAPI[]> {
  return solicitar<CategoriaAPI[]>('/categorias', 'GET');
}

/**
 * Esta secuencia NO es atómica. Conservar la lógica de recuperación de registros parciales.
 * El backend todavía exige saldo (enviamos 0 solo para desarrollo).
 * El DTO de intereses todavía rechaza UUID v5; se pueden omitir los intereses.
 */
export async function registrarCuenta(datos: DatosRegistro): Promise<ResultadoRegistro> {
  const usuario = await solicitar<UsuarioAPI>('/usuarios', 'POST', {
    idUniandes: datos.idUniandes,
    contrasenia: datos.contrasenia,
  });

  let perfil: PerfilCreadoAPI;
  try {
    perfil = await solicitar<PerfilCreadoAPI>('/perfiles-miembro', 'POST', {
      nombre: datos.nombre,
      edad: datos.edad,
      afiliacionUniandes: datos.afiliacionUniandes,
      imagen: datos.imagen,
      descripcion: datos.descripcion,
      estadoActividad: datos.estadoActividad,
      saldo: 0, // Provisional: asignación de saldo inicial debe ser responsabilidad del servidor.
      usuarioId: usuario.id,
    });
  } catch (error) {
    throw new ErrorRegistroParcial(
      `El usuario fue creado (ID ${usuario.id}), pero falló el perfil: ${error instanceof Error ? error.message : String(error)}. No repitas el registro completo.`,
      usuario.id,
    );
  }

  try {
    if (datos.categoriaIds.length > 0) {
      await solicitar<CategoriaAPI[]>(
        `/perfiles-miembro/${encodeURIComponent(perfil.id)}/intereses`,
        'PUT',
        { categoriaIds: datos.categoriaIds },
      );
    }
  } catch (error) {
    throw new ErrorRegistroParcial(
      `El usuario y el perfil ${perfil.id} se crearon, pero falló la asociación de intereses: ${error instanceof Error ? error.message : String(error)}. No repitas el registro completo.`,
      usuario.id,
      perfil.id,
    );
  }

  let autenticacion: RespuestaLoginAPI;
  try {
    autenticacion = await autenticar({
      idUniandes: datos.idUniandes,
      contrasenia: datos.contrasenia,
    });
  } catch (error) {
    throw new ErrorRegistroParcial(
      `La cuenta y el perfil ${perfil.id} están creados, pero falló el inicio de sesión: ${error instanceof Error ? error.message : String(error)}. Ingresa desde Login.`,
      usuario.id,
      perfil.id,
    );
  }

  return { usuario, perfil, autenticacion };
}
