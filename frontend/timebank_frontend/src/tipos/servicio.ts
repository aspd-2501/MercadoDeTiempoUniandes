/**
 * 00. MODELO DE DATOS: SERVICIO
 *
 * Representa un servicio ofrecido por un miembro
 * del Banco de Tiempo.
 */

export interface ServicioCatalogo {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  estimatedHours: number;
  imageUrl?: string;
  isVisible: boolean;
}