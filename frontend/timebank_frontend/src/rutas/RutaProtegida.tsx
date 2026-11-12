import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useMiembroSesion } from '../contextos/MiembroSesionContext';

/** Solo decide qué puede representar React: la autorización real corresponde al backend. */
export default function RutaProtegida({ children }: { children?: ReactNode }) {
  const { estado, errorSesion, reintentarSesion, cerrarSesion } = useMiembroSesion();

  if (estado === 'cargando') {
    return <div role="status" className="p-8 text-center text-sm">Recuperando sesión…</div>;
  }

  if (estado === 'error') {
    return (
      <div className="mx-auto max-w-md space-y-3 p-8 text-center">
        <p role="alert" className="text-sm text-red-700">
          No pudimos consultar tu sesión: {errorSesion ?? 'error de conexión'}
        </p>
        <button type="button" onClick={() => void reintentarSesion()}
          className="rounded-xl bg-[#3C9DA0] px-4 py-2 font-semibold text-white">
          Reintentar
        </button>
      </div>
    );
  }

  if (estado === 'anonimo') {
    return <Navigate to="/login" replace />;
  }

  if (estado === 'sin-perfil') {
    return (
      <div className="mx-auto max-w-md space-y-3 p-8 text-center">
        <h1 className="text-lg font-semibold">Tu cuenta aún no tiene perfil</h1>
        <p className="text-sm text-gray-600">
          El usuario está autenticado, pero necesita crear su perfil.
          No utilices el registro de cuenta nueva: volvería a intentar crear el usuario.
        </p>
        <button type="button" onClick={cerrarSesion}
          className="rounded-xl bg-[#3C9DA0] px-4 py-2 font-semibold text-white">
          Cerrar sesión
        </button>
      </div>
    );
  }

  return <>{children ?? <Outlet />}</>;
}
