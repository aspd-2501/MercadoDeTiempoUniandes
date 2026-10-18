import  type { DatosPostAyuda } from '../tipos/postAyuda';

export const PUBLICACIONES_DEMO: DatosPostAyuda[] = [
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