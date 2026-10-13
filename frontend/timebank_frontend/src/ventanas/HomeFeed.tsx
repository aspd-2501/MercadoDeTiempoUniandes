import { useState } from 'react';
import { Activity, Bell, Clock3, Heart, Plus, Search } from 'lucide-react';
import PostAyuda, {
  type AutorPostAyuda,
  type DatosPostAyuda,
} from '../componentes/posts/PostAyuda';

/**
 * VENTANA: Home / feed de publicaciones del Banco de Tiempo.
 *
 * Ubicación: src/ventanas/HomeFeed.tsx
 *
 * Reutiliza PostAyuda para mostrar solicitudes y ofrecimientos de ayuda.
 * Conserva la estructura visual del Home de Figma, pero sin navegación,
 * solicitudes al backend ni componentes globales de navegación.
 *
 * El buscador y las categorías filtran los datos simulados localmente.
 */

// ─────────────────── 00. MODELOS Y PROPIEDADES ───────────────────
export interface MiembroHome {
  id: string;
  firstName: string;
  faculty: string;
  balance: number;
  initials: string;
  avatar?: string;
}

export interface HomeFeedProps {
  miembro?: MiembroHome;
  publicaciones?: DatosPostAyuda[];
  autores?: Record<string, AutorPostAyuda>;
  notificacionesPendientes?: number;
  /** Acciones opcionales: se conectarán a la navegación en otra etapa. */
  onNotificaciones?: () => void;
  onVerPerfil?: () => void;
  onVerMovimientos?: () => void;
  onDonarHoras?: () => void;
  //onPedirHoras?: () => void;
  onVerDetallePost?: (postId: string) => void;
  onVerAutorPost?: (miembroId: string) => void;
  onGuardarPost?: (postId: string) => void;
  onCompartirPost?: (postId: string) => void;
}

// ─────────────────── 00.1 CATEGORÍAS DEL HOME ───────────────────
const CATEGORIAS = [
  'Todo',
  'Académico',
  'Idiomas',
  'Tecnología',
  'Diseño',
  'Deportes',
  'Música',
  'Bienestar',
];

// ─────────────────── 00.2 DATOS SIMULADOS ───────────────────
const MIEMBRO_DEMO: MiembroHome = {
  id: 'miembro-demo-1',
  firstName: 'María',
  faculty: 'Facultad de Ingeniería',
  balance: 8,
  initials: 'ML',
};

const AUTORES_DEMO: Record<string, AutorPostAyuda> = {
  'miembro-demo-1': {
    id: 'miembro-demo-1',
    name: 'María López',
    firstName: 'María',
    avatarColor: '#3C9DA0',
  },
  'miembro-demo-2': {
    id: 'miembro-demo-2',
    name: 'Carlos Martínez',
    firstName: 'Carlos',
    avatarColor: '#7A5FB2',
  },
  'miembro-demo-3': {
    id: 'miembro-demo-3',
    name: 'Camila Torres',
    firstName: 'Camila',
    avatarColor: '#BE6B79',
  },
  'miembro-demo-4': {
    id: 'miembro-demo-4',
    name: 'Santiago Gómez',
    firstName: 'Santiago',
    avatarColor: '#477CA8',
  },
};

const PUBLICACIONES_DEMO: DatosPostAyuda[] = [
  {
    id: 'post-ayuda-1',
    userId: 'miembro-demo-3',
    type: 'help-request',
    title: 'Necesito ayuda con cálculo diferencial',
    description:
      'Busco a alguien que pueda explicarme derivadas y ayudarme a practicar ejercicios para el parcial.',
    category: 'Académico / Matemáticas',
    createdAt: 'Hace 2 horas',
    preferredDate: '15 de octubre',
    preferredTime: '2:00 p. m.',
    estimatedHours: 2,
    maxParticipants: 3,
    confirmedParticipants: ['miembro-demo-2'],
  },
  {
    id: 'post-ayuda-2',
    userId: 'miembro-demo-2',
    type: 'help-offer',
    title: 'Ofrezco práctica de conversación en inglés',
    description:
      'Podemos practicar conversación y pronunciación en sesiones presenciales o virtuales.',
    category: 'Idiomas / Inglés',
    createdAt: 'Hace 5 horas',
    preferredDate: '17 de octubre',
    preferredTime: '4:00 p. m.',
    estimatedHours: 1,
    maxParticipants: 2,
    confirmedParticipants: [],
  },
  {
    id: 'post-ayuda-3',
    userId: 'miembro-demo-4',
    type: 'help-request',
    title: 'Necesito orientación con un proyecto de Python',
    description:
      'Estoy construyendo una pequeña aplicación y quisiera resolver algunas dudas sobre programación.',
    category: 'Tecnología / Programación',
    createdAt: 'Ayer',
    estimatedHours: 1.5,
    maxParticipants: 1,
    confirmedParticipants: [],
  },
];

// ─────────────────── 00.3 ESTILOS DE INTERACCIÓN ───────────────────
const ANIMACION_BOTON =
  'cursor-pointer transition-[transform,background-color,color,box-shadow] duration-200 ease-out ' +
  'motion-safe:active:scale-[0.96] focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2 ' +
  'motion-reduce:transition-none';

// ─────────────────── 01. VENTANA HOME ───────────────────
export default function HomeFeed({
  miembro = MIEMBRO_DEMO,
  publicaciones = PUBLICACIONES_DEMO,
  autores = AUTORES_DEMO,
  notificacionesPendientes = 3,
  onNotificaciones,
  onVerPerfil,
  onVerMovimientos,
  onDonarHoras,
  //onPedirHoras,
  onVerDetallePost,
  onVerAutorPost,
  onGuardarPost,
  onCompartirPost,
}: HomeFeedProps) {
  // 01.1 ESTADO LOCAL: búsqueda y categoría seleccionada.
  const [categoriaActiva, setCategoriaActiva] = useState('Todo');
  const [busqueda, setBusqueda] = useState('');

  // 01.2 DATOS DERIVADOS: publicaciones filtradas por búsqueda y categoría.
  const busquedaNormalizada = busqueda.trim().toLocaleLowerCase('es');
  const publicacionesFiltradas = publicaciones.filter((post) => {
    const autor = autores[post.userId];
    const coincideCategoria =
      categoriaActiva === 'Todo' ||
      post.category.toLocaleLowerCase('es').includes(categoriaActiva.toLocaleLowerCase('es'));
    const textoBuscable = [post.title, post.description, post.category, autor?.name ?? '']
      .join(' ')
      .toLocaleLowerCase('es');
    return coincideCategoria && (!busquedaNormalizada || textoBuscable.includes(busquedaNormalizada));
  });

  return (
    <div data-section="ventana-home" className="min-h-screen min-w-0 bg-[#F6F6F6]">
      {/* 02. ENCABEZADO FIJO: identidad, notificaciones, perfil y filtros */}
      <header
        data-section="encabezado-home"
        className="sticky top-0 z-30 bg-white px-4 pb-0 pt-12 shadow-[0_1px_0_#E8E8E8] lg:pt-6"
      >
        <div className="mx-auto max-w-2xl">
          
          
          {/* 02.1 BARRA SUPERIOR RESPONSIVE */}
          <div
            data-section="barra-superior-home"
            className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-2"
          >
            {/* 02.1.1 LOGO, NOTIFICACIONES Y PERFIL */}
            <div
              data-section="accesos-superiores"
              className="order-1 flex w-full items-center justify-between lg:order-2 lg:w-auto lg:justify-start lg:gap-2"
            >
              {/* LOGO */}
              <div
                data-section="logo-home"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3C9DA0] lg:hidden"
              >
                <span
                  className="text-xs font-bold text-[#FFFF00]"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  BT
                </span>
              </div>

              {/* BOTONES A LA DERECHA */}
              <div className="flex items-center gap-2">
                {/* NOTIFICACIONES */}
                <button
                  type="button"
                  onClick={onNotificaciones}
                  aria-label="Notificaciones"
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F6F6F6] hover:bg-[#E8F5F6] ${ANIMACION_BOTON}`}
                >
                  <Bell size={20} className="text-[#0D0D0D]" />

                  {notificacionesPendientes > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3C9DA0] px-0.5 text-[9px] font-bold text-white">
                      {notificacionesPendientes > 9
                        ? '9+'
                        : notificacionesPendientes}
                    </span>
                  )}
                </button>

                {/* PERFIL */}
                <button
                  type="button"
                  onClick={onVerPerfil}
                  aria-label="Abrir mi perfil"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#3C9DA0] hover:opacity-90 ${ANIMACION_BOTON}`}
                >
                  {miembro.avatar ? (
                    <img
                      src={miembro.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {miembro.initials}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 02.1.2 BARRA DE BÚSQUEDA */}
            <div
              data-section="buscador-home"
              className="relative order-2 w-full min-w-0 lg:order-1 lg:flex-1"
            >
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]"
              />

              <input
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar personas, habilidades, servicios…"
                aria-label="Buscar publicaciones"
                className="w-full min-w-0 rounded-xl border border-transparent bg-[#F6F6F6] py-2.5 pl-9 pr-2 text-sm text-[#0D0D0D] placeholder:text-[#9E9E9E] transition-all focus:border-[#3C9DA0] focus:bg-white focus:outline-none"
              />
            </div>
          </div>



          {/* 02.3 CATEGORÍAS: opciones horizontales desplazables */}
          <nav
            aria-label="Filtrar por categoría"
            data-section="categorias-home"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3"
            style={{ scrollbarWidth: 'none' }}
          >
            {CATEGORIAS.map((categoria) => {
              const seleccionada = categoria === categoriaActiva;
              return (
                <button
                  key={categoria}
                  type="button"
                  onClick={() => setCategoriaActiva(categoria)}
                  aria-pressed={seleccionada}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${ANIMACION_BOTON} ${
                    seleccionada
                      ? 'bg-[#0D0D0D] text-white'
                      : 'bg-[#F0F0F0] text-[#737373] hover:bg-[#E8F5F6] hover:text-[#0D0D0D]'
                  }`}
                >
                  {categoria}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 03. CONTENIDO PRINCIPAL DEL FEED */}
      <div data-section="contenido-home" className="mx-auto max-w-2xl space-y-3 px-4 py-4">
        {/* 03.1 TARJETA DE SALDO: componente interno, extraíble en el futuro */}
        <BalanceCard
          miembro={miembro}
          onVerMovimientos={onVerMovimientos}
          onDonarHoras={onDonarHoras}
          //onPedirHoras={onPedirHoras}
        />

        {/* 03.2 PUBLICACIONES DE AYUDA: tarjetas reutilizables PostAyuda */}
        <section data-section="publicaciones-home" aria-label="Publicaciones recientes" className="space-y-3">
          {publicacionesFiltradas.map((post) => (
            <PostAyuda
              key={post.id}
              post={post}
              autor={autores[post.userId]}
              onVerDetalle={onVerDetallePost}
              onVerAutor={onVerAutorPost}
              onGuardar={onGuardarPost}
              onCompartir={onCompartirPost}
            />
          ))}

          {/* 03.2.1 ESTADO SIN RESULTADOS */}
          {publicacionesFiltradas.length === 0 && (
            <div data-section="sin-resultados" className="py-16 text-center">
              <Search size={40} className="mx-auto mb-3 text-[#E8E8E8]" aria-hidden="true" />
              <p className="font-medium text-[#737373]">No encontramos resultados.</p>
              <p className="mt-1 text-sm text-[#9E9E9E]">
                Prueba con otra categoría o habilidad.
              </p>
            </div>
          )}

          {/* 03.2.2 FIN DEL FEED */}
          {publicacionesFiltradas.length > 0 && (
            <p className="py-6 text-center text-xs text-[#9E9E9E]">
              Has visto todas las publicaciones recientes
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

// ─────────────────── 04. TARJETA DE SALDO DEL HOME ───────────────────
// Se conserva dentro de este archivo porque aún no hemos decidido extraerla.
// En el futuro puede moverse a src/componentes sin modificar HomeFeed.
interface BalanceCardProps {
  miembro: MiembroHome;
  onVerMovimientos?: () => void;
  onDonarHoras?: () => void;
  onPedirHoras?: () => void;
}

function BalanceCard({
  miembro,
  onVerMovimientos,
  onDonarHoras,
  onPedirHoras,
}: BalanceCardProps) {
  return (
    <section
      data-section="tarjeta-saldo-home"
      aria-label="Resumen de horas"
      className="relative overflow-hidden rounded-2xl bg-[#3C9DA0] p-5"
    >
      {/* 04.1 ACENTOS DECORATIVOS */}
      <div aria-hidden="true" className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/4 rounded-full bg-white/5" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 h-24 w-24 -translate-x-1/4 translate-y-1/2 rounded-full bg-[#FFFF00]/10" />

      <div className="relative">
        {/* 04.2 SALUDO, FACULTAD Y AVATAR DEL MIEMBRO */}
        <header className="mb-4 flex items-start justify-between">
          <div>
            <h2
              className="text-xl font-bold leading-tight text-white"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Hola, {miembro.firstName} 👋
            </h2>
            <p className="mt-0.5 text-sm text-white/70">{miembro.faculty}</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-2 ring-white/30">
            {miembro.avatar ? (
              <img src={miembro.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-base font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {miembro.initials}
              </span>
            )}
          </div>
        </header>

        {/* 04.3 SALDO ACTUAL */}
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/60">Tu saldo</p>
        <div className="mb-5 flex items-end gap-2">
          <span
            className="text-5xl font-bold leading-none text-white"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {miembro.balance}
          </span>
          <span className="mb-1 text-xl font-semibold text-white/80">horas</span>
          <div className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFFF00]">
            <Clock3 size={20} strokeWidth={2.5} className="text-[#0D0D0D]" aria-hidden="true" />
          </div>
        </div>

        {/* 04.4 ACCIONES: ver movimientos, donar horas y pedir horas */}
        <div data-section="acciones-saldo" className="space-y-2">
          <button
            type="button"
            onClick={onVerMovimientos}
            className={`flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-[#0D0D0D] hover:bg-[#F6F6F6] ${ANIMACION_BOTON}`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <Activity size={14} aria-hidden="true" />
            Ver movimientos
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onDonarHoras}
              className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FFFF00] px-3 py-2.5 text-xs font-semibold text-[#0D0D0D] hover:bg-[#F0F000] ${ANIMACION_BOTON}`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <Heart size={14} aria-hidden="true" />
              Donar horas
            </button>
            {/*<button
              type="button"
              onClick={onPedirHoras}
              className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/20 px-3 py-2.5 text-xs font-semibold text-white hover:bg-white/30 ${ANIMACION_BOTON}`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <Plus size={14} aria-hidden="true" />
              Pedir horas
            </button>*/}
          </div>
        </div>
      </div>
    </section>
  );
}
