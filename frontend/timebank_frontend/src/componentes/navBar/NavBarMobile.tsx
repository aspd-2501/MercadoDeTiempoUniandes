import {
  House,
  MessageCircle,
  Plus,
  Search,
  UserRound,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react';

// 00. TIPOS Y CONFIGURACIÓN DE LA BARRA DE NAVEGACIÓN
// Los callbacks son opcionales: podemos mostrar y probar la interfaz sin implementar rutas.
export type NavBarMobileTab = 'home' | 'explore' | 'chat' | 'profile' | 'calendar';

interface NavBarMobileProps {
  activeTab?: NavBarMobileTab | null;
  onNavigate?: (tab: NavBarMobileTab) => void;
  onCreate?: () => void;
}

interface NavItem {
  id: NavBarMobileTab;
  label: string;
  icon: LucideIcon;
}

// Conservamos el orden del navbar original de Figma.
const NAV_ITEMS_LEFT: NavItem[] = [
  { id: 'home', label: 'Inicio', icon: House },
  { id: 'explore', label: 'Explorar', icon: Search },
];

const NAV_ITEMS_RIGHT: NavItem[] = [
  //{ id: 'chat', label: 'Chats', icon: MessageCircle },
  { id: 'calendar', label: 'Calendario', icon: CalendarDays },
  { id: 'profile', label: 'Perfil', icon: UserRound }

];

const BUTTON_FEEDBACK =
  'cursor-pointer transition-[transform,background-color,color] duration-200 ease-out ' +
  'motion-safe:active:scale-[0.94] focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-[#3C9DA0] focus-visible:ring-offset-2 ' +
  'motion-reduce:transition-none';

// 01. COMPONENTE PRINCIPAL — NAVEGACIÓN INFERIOR MÓVIL
export default function NavBarMobile({
  activeTab = 'home',
  onNavigate,
  onCreate,
}: NavBarMobileProps) {
  return (
    <nav
      aria-label="Navegación principal móvil"
      data-section="navbar-movil"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E8E8] bg-white lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {/* 01.1 ACCESOS IZQUIERDOS: Inicio y Explorar */}
        {NAV_ITEMS_LEFT.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate?.(id)}
              aria-current={isActive ? 'page' : undefined}
              data-section={`acceso-${id}`}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 sm:px-4 ${BUTTON_FEEDBACK} hover:bg-[#F6F6F6]`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.8}
                aria-hidden="true"
                className={isActive ? 'text-[#3C9DA0]' : 'text-[#9E9E9E]'}
              />
              <span
                className={`text-[10px] font-medium ${isActive ? 'text-[#3C9DA0]' : 'text-[#9E9E9E]'}`}
              >
                {label}
              </span>
            </button>
          );
        })}

        {/* 01.2 BOTÓN CENTRAL CREAR: abre un menú externo cuando se conecte */}
        <button
          type="button"
          onClick={() => onCreate?.()}
          data-section="accion-crear"
          aria-label="Crear"
          className={`relative z-10 -mt-5 flex min-w-0 flex-1 flex-col items-center ${BUTTON_FEEDBACK}`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#3C9DA0] shadow-lg transition-colors duration-200 hover:bg-[#2D8B8E]">
            <Plus size={26} strokeWidth={2.5} className="text-white" aria-hidden="true" />
          </span>
          <span className="mt-0.5 text-[10px] font-medium text-[#9E9E9E]">Crear</span>
        </button>

        {/* 01.3 ACCESOS DERECHOS: Chats y Perfil */}
        {NAV_ITEMS_RIGHT.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate?.(id)}
              aria-current={isActive ? 'page' : undefined}
              data-section={`acceso-${id}`}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 sm:px-4 ${BUTTON_FEEDBACK} hover:bg-[#F6F6F6]`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.8}
                aria-hidden="true"
                className={isActive ? 'text-[#3C9DA0]' : 'text-[#9E9E9E]'}
              />
              <span
                className={`text-[10px] font-medium ${isActive ? 'text-[#3C9DA0]' : 'text-[#9E9E9E]'}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
