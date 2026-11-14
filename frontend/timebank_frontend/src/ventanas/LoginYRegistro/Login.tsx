import { useState, type FormEvent } from 'react';
import { Award, Clock3, UsersRound } from 'lucide-react';
import type { CredencialesLogin } from '../../api/identidad.api';

interface LoginProps {
  onContinuar: (credenciales: CredencialesLogin) => Promise<string | void>;
  onCrearCuenta: () => void;
}

/** Inicio de sesión contra POST /auth/login, no SSO institucional. */
export default function Login({ onContinuar, onCrearCuenta }: LoginProps) {
  const [idUniandes, setIdUniandes] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (cargando) return;
    setCargando(true);
    setError(null);
    setMensaje(null);
    try {
      const resultado = await onContinuar({ idUniandes: idUniandes.trim(), contrasenia });
      if (typeof resultado === 'string') setMensaje(resultado);
    } catch (excepcion) {
      setError(excepcion instanceof Error ? excepcion.message : 'No fue posible iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div aria-hidden="true" className="h-1.5 shrink-0 bg-[#FFFF00]" />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-5 sm:px-6">
        <header className="mb-4 text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3C9DA0] shadow-lg">
            <Clock3 size={28} className="text-[#FFFF00]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'Outfit, sans-serif' }}>Banco de Tiempo</h1>
          <p className="font-semibold text-[#3C9DA0]">Uniandes</p>
        </header>
        <p className="mb-4 text-center text-base font-medium leading-snug text-[#0D0D0D]">
          Intercambia habilidades. Comparte tu tiempo.
          <span className="block text-[#3C9DA0]">Fortalece tu comunidad.</span>
        </p>
        <section aria-label="Cómo funciona" className="mb-4 space-y-2 rounded-2xl bg-[#F6F6F6] p-3">
          {[
            { icono: Clock3, texto: '1 hora de servicio = 1 crédito de tiempo' },
            { icono: UsersRound, texto: 'Intercambia habilidades con la comunidad Uniandes' },
            { icono: Award, texto: 'Gana reconocimientos y crece junto a otros' },
          ].map(({ icono: Icono, texto }) => (
            <div key={texto} className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#3C9DA0]"><Icono size={15} className="text-white" /></div>
              <p className="text-xs text-[#0D0D0D]">{texto}</p>
            </div>
          ))}
        </section>
        <form onSubmit={(evento) => void enviar(evento)} className="space-y-2.5">
          <div>
            <label htmlFor="login-uniandes" className="mb-1 block text-xs font-semibold text-[#737373]">IDENTIFICADOR UNIANDES</label>
            <input id="login-uniandes" autoComplete="username" required value={idUniandes} onChange={(evento) => setIdUniandes(evento.target.value)}
              placeholder="Por ejemplo: demo01" className="w-full rounded-xl border border-[#E8E8E8] px-4 py-2.5 text-sm focus:border-[#3C9DA0] focus:outline-none" />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1 block text-xs font-semibold text-[#737373]">CONTRASEÑA</label>
            <input id="login-password" type="password" autoComplete="current-password" required value={contrasenia} onChange={(evento) => setContrasenia(evento.target.value)}
              className="w-full rounded-xl border border-[#E8E8E8] px-4 py-2.5 text-sm focus:border-[#3C9DA0] focus:outline-none" />
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {mensaje && <p role="status" className="rounded-lg bg-[#E8F5F6] p-3 text-xs text-[#2D7B7E]">{mensaje}</p>}
          <button type="submit" disabled={cargando}
            className="w-full rounded-2xl bg-[#3C9DA0] py-3 text-sm font-bold text-white hover:bg-[#2D8B8E] disabled:opacity-60">
            {cargando ? 'Verificando credenciales…' : 'Iniciar sesión'}
          </button>
        </form>
        <button type="button" onClick={onCrearCuenta}
          className="mx-auto mt-3 text-sm font-semibold text-[#3C9DA0] underline underline-offset-4">
          Crear una cuenta
        </button>
        <p className="mt-3 text-center text-[11px] leading-snug text-[#737373]">
          Acceso de desarrollo mediante usuario y contraseña del backend local. No es SSO institucional.
        </p>
      </div>
      <footer className="border-t border-[#E8E8E8] px-4 py-3 text-center text-[11px] text-[#737373]">
        Al ingresar, aceptas los términos del Banco de Tiempo Uniandes
      </footer>
    </div>
  );
}
