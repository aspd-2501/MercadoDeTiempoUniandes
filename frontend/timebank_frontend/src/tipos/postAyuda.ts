import type { IntervaloDisponibilidad } from "./disponibilidad";

export type TipoPublicacionAyuda = 'help-request' | 'help-offer';

export interface DatosPostAyuda {
  id: string;
  userId: string;
  type: TipoPublicacionAyuda;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  image?: string;
  preferredDate?: string;
  preferredTime?: string;
  estimatedHours?: number;
  maxParticipants?: number;
  confirmedParticipants?: string[];
  availability?: IntervaloDisponibilidad[];
  preferredAvailabilityId?: string;
}