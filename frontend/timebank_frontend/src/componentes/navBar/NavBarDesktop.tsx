import {
  Activity,
  House,
  MessageCircle,
  Plus,
  Search,
  Shield,
  UserRound,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react';

// 00. TIPOS Y CONFIGURACIÓN DE LA BARRA DE NAVEGACIÓN
// Por ahora, las funciones son opcionales: el navbar se puede mostrar sin navegación.
export type NavBarDesktopTab = 'home' | 'explore' | 'chat' | 'activity' | 'profile' | 'calendar';

interface NavBarDesktopProps {
  activeTab?: NavBarDesktopTab | null;
  onNavigate?: (tab: NavBarDesktopTab) => void;
  onCreate?: () => void;
  onModerator?: () => void;
}

interface NavItem {
  id: NavBarDesktopTab;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Inicio', icon: House },
  { id: 'explore', label: 'Explorar', icon: Search },
  { id: 'chat', label: 'Chats', icon: MessageCircle },
  { id: 'activity', label: 'Actividad', icon: Activity },
  { id: 'profile', label: 'Perfil', icon: UserRound },
  { id: 'calendar', label: 'Calendario', icon: CalendarDays },
];

const BUTTON_FEEDBACK =
  'cursor-pointer transition-[transform,background-color,color] duration-200 ease-out ' +
  'motion-safe:active:scale-[0.97] focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2 ' +
  'motion-reduce:transition-none';

// 01. COMPONENTE PRINCIPAL — NAVEGACIÓN DE ESCRITORIO
export default function NavBarDesktop({
  activeTab = 'home',
  onNavigate,
  onCreate,
  onModerator,
}: NavBarDesktopProps) {
  return (
    <aside
      aria-label="Barra lateral del Banco de Tiempo"
      data-section="navbar-escritorio"
      className="fixed inset-y-0 left-0 z-40 hidden w-60 shrink-0 flex-col border-r border-[#E8E8E8] bg-white lg:flex"
    >
      {/* 01.1 IDENTIDAD: logo y nombre de la aplicación */}
      <header data-section="identidad" className="border-b border-[#E8E8E8] px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3C9DA0]">
            <span
              className="text-sm font-bold text-[#FFFF00]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              BT
            </span>
          </div>
          <div>
            <p
              className="text-xs font-semibold leading-tight text-[#0D0D0D]"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Banco de Tiempo
            </p>
            <p className="text-[10px] leading-tight text-[#737373]">Uniandes</p>
          </div>
        </div>
      </header>

      {/* 01.2 MENÚ PRINCIPAL: Inicio, Explorar, Chats, Actividad y Perfil */}
      <nav aria-label="Navegación principal" data-section="enlaces-principales" className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate?.(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium ${BUTTON_FEEDBACK} ${
                isActive
                  ? 'bg-[#E8F5F6] text-[#3C9DA0]'
                  : 'text-[#737373] hover:bg-[#F6F6F6] hover:text-[#0D0D0D]'
              }`}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* 01.3 ACCIÓN CREAR: el menú emergente se implementará por separado */}
      <div data-section="accion-crear" className="px-4 pb-4">
        <button
          type="button"
          onClick={() => onCreate?.()}
          className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#3C9DA0] py-3 text-sm font-semibold text-white hover:bg-[#2D8B8E] ${BUTTON_FEEDBACK}`}
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          <Plus size={18} aria-hidden="true" />
          Crear
        </button>
      </div>

      {/* 01.4 ACCESO AL PANEL DE MODERACIÓN */}
      <div data-section="moderacion" className="px-3 pb-3">
        <button
          type="button"
          onClick={() => onModerator?.()}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-[#737373] hover:bg-[#F6F6F6] hover:text-[#0D0D0D] ${BUTTON_FEEDBACK}`}
        >
          <Shield size={16} aria-hidden="true" />
          Panel de moderación
        </button>
      </div>
    </aside>
  );
}
