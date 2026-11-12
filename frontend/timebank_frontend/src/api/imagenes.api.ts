const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export interface ImagenSubidaAPI {
  ruta: string;    // se guarda tal cual en el campo `imagen` (ej. /uploads/imagenes/abc.png)
  nombre: string;
  tamanio: number;
}

// Sube un archivo (el File de un <input type="file">) y devuelve su ruta en el servidor.
export async function subirImagen(archivo: File): Promise<ImagenSubidaAPI> {
  const datos = new FormData();
  datos.append('archivo', archivo);

  // Sin header Content-Type: el navegador lo pone con el boundary del multipart
  const respuesta = await fetch(`${API_URL}/imagenes`, { method: 'POST', body: datos });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);
    throw new Error(error?.message ?? `Error HTTP ${respuesta.status}: ${respuesta.statusText}`);
  }

  return respuesta.json() as Promise<ImagenSubidaAPI>;
}

// Convierte el valor de `imagen` en algo que sirve para <img src>.
// Las rutas /uploads/... están en el servidor del backend; las URL completas se dejan igual.
export function urlImagen(imagen?: string | null): string | undefined {
  if (!imagen) return undefined;
  if (!imagen.startsWith('/uploads/')) return imagen;
  const origen = new URL(API_URL).origin; // http://localhost:3000
  return `${origen}${imagen}`;
}
