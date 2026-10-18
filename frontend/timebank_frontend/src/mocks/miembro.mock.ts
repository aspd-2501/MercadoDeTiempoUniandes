import type { Miembro } from '../tipos/miembro';

/**
 * 00. DATOS SIMULADOS DEL MIEMBRO CON SESIÓN ABIERTA.
 * Son la única fuente mock para el perfil de la sesión.
 * No representan una respuesta real del backend.
 */
export const MIEMBRO_SESION_MOCK: Miembro = {
  id: 'miembro-demo-1',
  name: 'María López',
  firstName: 'María',
  faculty: 'Facultad de Ingeniería',
  bio: 'Estudiante apasionada por el aprendizaje colaborativo. Me gusta compartir lo que sé y aprender de otras personas de la comunidad Uniandes.',
  initials: 'ML',
  balance: 10,
  completedExchanges: 12,
  interests: ['Tecnología', 'Música', 'Idiomas', 'Voluntariado'],
  skills: ['Matemáticas', 'Programación', 'Inglés'],
  organizations: ['Grupo de voluntariado Uniandes'],
  recognitions: ['Primera ayuda', 'Colaboradora destacada'],
  isAvailable: true,
};
