import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import type { Miembro } from '../tipos/miembro';
import { MIEMBRO_SESION_MOCK } from '../mocks/miembro.mock';

// 01. DATOS Y ACCIONES QUE COMPARTIRÁ EL CONTEXTO
interface MiembroSesionContextValue {
  miembro: Miembro;
  actualizarDisponibilidad: (disponible: boolean) => void;
}

// 02. DEFINICIÓN DEL CONTEXTO
const MiembroSesionContext = createContext<MiembroSesionContextValue | undefined>(undefined);

// 03. PROVEEDOR DEL MIEMBRO CON SESIÓN INICIADA
export function MiembroSesionProvider({ children }: { children: ReactNode }) {
  // Por ahora iniciamos con un miembro simulado.
  const [miembro, setMiembro] = useState<Miembro>(MIEMBRO_SESION_MOCK);

  // Modifica solo el estado local; aún no se comunica con el backend.
  function actualizarDisponibilidad(disponible: boolean) {
    setMiembro((actual) => ({ ...actual, isAvailable: disponible }));
  }

  return (
    <MiembroSesionContext.Provider value={{ miembro, actualizarDisponibilidad }}>
      {children}
    </MiembroSesionContext.Provider>
  );
}

// 04. HOOK PARA ACCEDER AL CONTEXTO DESDE LAS VENTANAS
export function useMiembroSesion() {
  const contexto = useContext(MiembroSesionContext);

  if (contexto === undefined) {
    throw new Error('useMiembroSesion debe utilizarse dentro de MiembroSesionProvider');
  }

  return contexto;
}
