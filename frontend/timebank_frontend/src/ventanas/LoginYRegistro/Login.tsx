import { Award, Clock3, UsersRound, type LucideIcon } from 'lucide-react';

// 01. PROPIEDADES DE LA VENTANA
interface LoginProps {
  /** Acción de ingreso existente; no se ocupa del registro ni del onboarding. */
  onContinuar: () => void;
  /** Abre el flujo de registro/onboarding; no crea una cuenta en el frontend. */
  onCrearCuenta: () => void;
  /** Identifica el flujo como demostración hasta integrar la autenticación real de Uniandes. */
  modoDemostracion?: boolean;
}

type PasoIntroduccion = {
  icono: LucideIcon;
  texto: string;
};

const PASOS_INTRODUCCION: PasoIntroduccion[] = [
  { icono: Clock3, texto: '1 hora de servicio = 1 crédito de tiempo' },
  { icono: UsersRound, texto: 'Intercambia habilidades con la comunidad Uniandes' },
  { icono: Award, texto: 'Gana reconocimientos y crece junto a otros' },
];

// 02. PANTALLA PÚBLICA DE LOGIN
export default function Login({
  onContinuar,
  onCrearCuenta,
  modoDemostracion = true,
}: LoginProps) {
  return (
    <div
      data-section="login"
      className="flex min-h-[100dvh] flex-col bg-white"
    >
      {/* 02.1 FRANJA DECORATIVA SUPERIOR */}
      <div aria-hidden="true" className="h-1.5 shrink-0 bg-[#FFFF00]" />

      {/* 02.2 CONTENIDO: ESPACIADO ADAPTADO A LA ALTURA DEL VIEWPORT */}
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-5 py-[clamp(8px,2dvh,24px)] sm:px-6">
        {/* Logo e identidad */}
        <header className="mb-[clamp(10px,2.5dvh,28px)] text-center">
          <div className="mx-auto mb-[clamp(6px,1.4dvh,14px)] flex size-[clamp(52px,9dvh,76px)] items-center justify-center rounded-2xl bg-[#3C9DA0] shadow-lg">
            <Clock3
              size={30}
              strokeWidth={2}
              className="text-[#FFFF00]"
              aria-hidden="true"
            />
          </div>
          <h1
            className="text-[clamp(20px,3.6dvh,24px)] font-bold leading-tight text-[#0D0D0D]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Banco de Tiempo
          </h1>
          <p
            className="text-base font-semibold leading-tight text-[#3C9DA0]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Uniandes
          </p>
        </header>

        {/* 02.3 MENSAJE PRINCIPAL */}
        <div className="mb-[clamp(10px,2.5dvh,28px)] text-center">
          <p
            className="text-[clamp(15px,2.5dvh,18px)] font-medium leading-snug text-[#0D0D0D]"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Intercambia habilidades.
            <br />
            Comparte tu tiempo.
            <br />
            <span className="text-[#3C9DA0]">Fortalece tu comunidad.</span>
          </p>
        </div>

        {/* 02.4 EXPLICACIÓN BREVE */}
        <section
          aria-label="Cómo funciona el Banco de Tiempo"
          className="mb-[clamp(10px,2.5dvh,24px)] w-full space-y-2 rounded-2xl bg-[#F6F6F6] p-[clamp(10px,1.8dvh,16px)]"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#737373]">
            Cómo funciona
          </h2>
          {PASOS_INTRODUCCION.map(({ icono: Icono, texto }) => (
            <div key={texto} className="flex items-center gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#3C9DA0]">
                <Icono size={15} className="text-white" aria-hidden="true" />
              </div>
              <p className="text-[13px] leading-snug text-[#0D0D0D]">{texto}</p>
            </div>
          ))}
        </section>

        {/* 02.5 ACCESO INSTITUCIONAL (SOLO PRESENTACIÓN / CALLBACK) */}
        <button
          type="button"
          onClick={onContinuar}
          className="flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#3C9DA0] px-3 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-[#2D8B8E] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {/* Icono decorativo heredado del diseño de Figma. No autentica con Google. */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect width="20" height="20" rx="4" fill="#4285F4" />
            <path
              d="M10 4.5c1.52 0 2.86.57 3.88 1.5l-1.56 1.56A3.5 3.5 0 1013.5 10H10V8h5.9c.07.32.1.65.1 1 0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6z"
              fill="white"
            />
          </svg>
          Continuar con Uniandes
        </button>

        {/* 02.6 ENLACE AL REGISTRO */}
        <button
          type="button"
          onClick={onCrearCuenta}
          className="mt-[clamp(4px,1dvh,9px)] shrink-0 rounded-md px-2 py-1 text-sm font-semibold text-[#3C9DA0] underline underline-offset-4 transition-colors hover:text-[#2D8B8E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Crear una cuenta
        </button>

        <p className="mt-[clamp(4px,1dvh,9px)] text-center text-[11px] leading-snug text-[#737373]">
          {modoDemostracion ? (
            <>
              Prototipo de navegación. La verificación con las credenciales de la
              Universidad de los Andes se conectará posteriormente.
            </>
          ) : (
            <>
              Tu cuenta será verificada usando las credenciales de{' '}
              <span className="font-medium text-[#0D0D0D]">Universidad de los Andes</span>.
            </>
          )}
        </p>
      </div>

      {/* 02.7 PIE DE PÁGINA */}
      <footer className="shrink-0 border-t border-[#E8E8E8] px-4 py-[clamp(8px,1.5dvh,14px)] text-center">
        <p className="text-[11px] leading-snug text-[#737373]">
          Al ingresar, aceptas los términos del Banco de Tiempo Uniandes
        </p>
      </footer>
    </div>
  );
}
