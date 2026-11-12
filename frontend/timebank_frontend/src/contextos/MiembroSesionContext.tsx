import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import type { Miembro } from '../tipos/miembro';
import {
  autenticar,
  consultarSesion,
  ErrorHTTP,
  type CredencialesLogin,
  type PerfilSesionAPI,
  type RespuestaLoginAPI,
  type SesionUsuarioAPI,
  type UsuarioAPI,
} from '../api/identidad.api';

/** Almacenar el JWT solo hasta cerrar la pestaña/navegador. No guardar contraseñas. */
const CLAVE_TOKEN = 'banco-tiempo:access-token';

type EstadoSesion = 'cargando' | 'autenticado' | 'sin-perfil' | 'anonimo' | 'error';

interface MiembroSesionContextValue {
  miembro: Miembro | null; // compatibilidad temporal con ventanas existentes
  perfil: PerfilSesionAPI | null; // identidad y saldo REALES del backend
  usuario: UsuarioAPI | null;
  esModerador: boolean;
  estado: EstadoSesion;
  errorSesion: string | null;
  iniciarSesion: (credenciales: CredencialesLogin) => Promise<RespuestaLoginAPI>;
  establecerAutenticacion: (respuesta: RespuestaLoginAPI) => void;
  reintentarSesion: () => Promise<void>;
  cerrarSesion: () => void;
  actualizarDisponibilidad: (disponible: boolean) => void; // función antigua, solo visual/local
}

const MiembroSesionContext = createContext<MiembroSesionContextValue | undefined>(undefined);

function leerToken(): string | null {
  try {
    return window.sessionStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

function guardarToken(token: string): void {
  try {
    window.sessionStorage.setItem(CLAVE_TOKEN, token);
  } catch {
    // Si el almacenamiento está deshabilitado, la sesión sigue en memoria hasta recargar.
  }
}

function borrarToken(): void {
  try {
    window.sessionStorage.removeItem(CLAVE_TOKEN);
  } catch {
    // El estado de React se borra igualmente.
  }
}

/**
 * Adaptación temporal para las ventanas que aún esperan el antiguo tipo Miembro.
 * NO se inventan intereses, habilidades, organizaciones o reconocimientos.
 * Los indicadores faltantes (intercambios, disponibilidad) NO vienen en /auth/me:
 * las ventanas que los muestran deben conectarse a sus APIs antes de usarlos como cifras reales.
 */
function adaptarPerfil(perfil: PerfilSesionAPI, disponibilidadLocal: boolean): Miembro {
  const nombre = perfil.nombre.trim();
  const nombres = nombre.split(/\s+/).filter(Boolean);
  const iniciales = nombres.slice(0, 2).map((parte) => parte[0].toUpperCase()).join('') || '?';

  return {
    id: perfil.id, // UUID del PERFIL, no del usuario
    name: nombre,
    firstName: nombres[0] ?? '',
    faculty: '', // afiliacionUniandes NO es una facultad; se expone en 'perfil'.
    bio: perfil.descripcion,
    initials: iniciales,
    avatar: perfil.imagen || undefined,
    balance: perfil.saldo,
    completedExchanges: 0, // compatibilidad: NO es una estadística consultada
    interests: [],         // deben cargarse desde /perfiles-miembro/:id/intereses
    skills: [],            // deben cargarse desde sus endpoints
    organizations: [],
    recognitions: [],
    isAvailable: disponibilidadLocal, // estado local antiguo, NO equivale a estadoActividad
  };
}

export function MiembroSesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<SesionUsuarioAPI | null>(null);
  const [estado, setEstado] = useState<EstadoSesion>(() => leerToken() ? 'cargando' : 'anonimo');
  const [errorSesion, setErrorSesion] = useState<string | null>(null);
  const [disponibilidadLocal, setDisponibilidadLocal] = useState(false);
  const revision = useRef(0);

  function establecerAutenticacion(respuesta: RespuestaLoginAPI) {
    // Invalida recuperaciones de /auth/me que todavía estén en curso.
    revision.current += 1;
    guardarToken(respuesta.access_token);
    setSesion({
      usuario: respuesta.usuario,
      perfil: respuesta.perfil,
      esModerador: respuesta.esModerador,
    });
    setDisponibilidadLocal(false);
    setErrorSesion(null);
    setEstado(respuesta.perfil ? 'autenticado' : 'sin-perfil');
  }

  async function iniciarSesion(credenciales: CredencialesLogin): Promise<RespuestaLoginAPI> {
    const respuesta = await autenticar(credenciales);
    establecerAutenticacion(respuesta);
    return respuesta;
  }

  function cerrarSesion() {
    revision.current += 1;
    borrarToken();
    setSesion(null);
    setDisponibilidadLocal(false);
    setErrorSesion(null);
    setEstado('anonimo');
  }

  async function reintentarSesion(): Promise<void> {
    const token = leerToken();
    if (!token) {
      cerrarSesion();
      return;
    }

    const numero = ++revision.current;
    setErrorSesion(null);
    setEstado('cargando');

    try {
      const datos = await consultarSesion(token);
      if (numero !== revision.current) return;
      setSesion(datos);
      setEstado(datos.perfil ? 'autenticado' : 'sin-perfil');
    } catch (error) {
      if (numero !== revision.current) return;
      if (error instanceof ErrorHTTP && error.estadoHTTP === 401) {
        cerrarSesion(); // token vencido o inválido
        return;
      }
      // Un error de red no prueba que el token haya caducado.
      setErrorSesion(error instanceof Error ? error.message : 'No se pudo recuperar la sesión.');
      setEstado('error');
    }
  }

  useEffect(() => {
    if (!leerToken()) return;
    void reintentarSesion();
    // Solo al iniciar el proveedor: el login nuevo invalida solicitudes anteriores.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const perfil = sesion?.perfil ?? null;
  const miembro = useMemo(
    () => perfil ? adaptarPerfil(perfil, disponibilidadLocal) : null,
    [perfil, disponibilidadLocal],
  );

  const valor: MiembroSesionContextValue = {
    miembro,
    perfil,
    usuario: sesion?.usuario ?? null,
    esModerador: sesion?.esModerador ?? false,
    estado,
    errorSesion,
    iniciarSesion,
    establecerAutenticacion,
    reintentarSesion,
    cerrarSesion,
    actualizarDisponibilidad: setDisponibilidadLocal,
  };

  return (
    <MiembroSesionContext.Provider value={valor}>
      {children}
    </MiembroSesionContext.Provider>
  );
}

export function useMiembroSesion(): MiembroSesionContextValue {
  const contexto = useContext(MiembroSesionContext);
  if (!contexto) {
    throw new Error('useMiembroSesion debe utilizarse dentro de MiembroSesionProvider');
  }
  return contexto;
}
