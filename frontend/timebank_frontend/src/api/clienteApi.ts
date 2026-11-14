/** Cliente compartido: acepta llamadas de lectura y escritura sin romper el uso anterior. */
const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/+$/, '');

export interface OpcionesApi {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  datos?: unknown;
  signal?: AbortSignal;
}

export async function clienteApi<T>(ruta: string, opciones: OpcionesApi = {}): Promise<T> {
  const token = typeof window !== 'undefined'
    ? window.sessionStorage.getItem('banco-tiempo:access-token')
    : null;
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: opciones.metodo ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(opciones.datos !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(opciones.datos !== undefined ? { body: JSON.stringify(opciones.datos) } : {}),
    signal: opciones.signal,
  });
  const texto = await respuesta.text();
  let contenido: unknown = null;
  if (texto) {
    try { contenido = JSON.parse(texto) as unknown; }
    catch { contenido = texto; }
  }
  if (!respuesta.ok) {
    const objeto = contenido && typeof contenido === 'object' ? contenido as Record<string, unknown> : null;
    const mensaje = objeto?.message;
    const detalle = Array.isArray(mensaje) ? mensaje.map(String).join('; ')
      : typeof mensaje === 'string' ? mensaje
      : typeof contenido === 'string' ? contenido
      : `Error HTTP ${respuesta.status}: ${respuesta.statusText}`;
    throw new Error(detalle);
  }
  return contenido as T;
}
