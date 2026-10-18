/**
 * 00. MODELO DE DATOS: miembro autenticado.
 *
 * Por ahora refleja los campos usados por las ventanas actuales.
 * Más adelante podemos mapear la respuesta del backend NestJS a este tipo.
 */
export interface Miembro {
  id: string;
  name: string;
  firstName: string;
  faculty: string;
  bio: string;
  initials: string;
  avatar?: string;
  balance: number;
  completedExchanges: number;
  interests: string[];
  skills: string[];
  organizations: string[];
  recognitions: string[];
  isAvailable: boolean;
}

export interface MiembroPublico {
  id: string;
  name: string;
  firstName: string;
  avatar?: string;
  avatarColor?: string;

  // Información del perfil
  faculty?: string;
  bio?: string;
  isAvailable?: boolean;
  completedExchanges?: number;

  // Información adicional
  interests?: string[];
  skills?: string[];
  organizations?: string[];
  recognitions?: string[];
}