const API_URL = import.meta.env.VITE_API_URL;

export async function clienteApi<T>(ruta: string): Promise<T> {
  const respuesta = await fetch(`${API_URL}${ruta}`);

  if (!respuesta.ok) {
    throw new Error(
      `Error HTTP ${respuesta.status}: ${respuesta.statusText}`
    );
  }

  return respuesta.json() as Promise<T>;
}