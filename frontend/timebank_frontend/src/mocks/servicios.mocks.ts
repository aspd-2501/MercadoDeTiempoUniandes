import type { ServicioCatalogo } from '../tipos/servicio';

/**
 * 00. DATOS SIMULADOS DE SERVICIOS DEL CATÁLOGO.
 *
 * Cada servicio pertenece a un miembro identificado por userId.
 * Los identificadores coinciden con las claves de MIEMBROS_DEMO.
 *
 * Por ahora son datos locales: no se consultan ni guardan en el backend.
 */
export const SERVICIOS_DEMO: ServicioCatalogo[] = [
  // 01. SERVICIOS DE MARÍA LÓPEZ
  {
    id: 'servicio-demo-1',
    userId: 'miembro-demo-1',
    title: 'Tutorías de cálculo diferencial',
    category: 'Académico / Matemáticas',
    description:
      'Te ayudo a resolver dudas, estudiar para parciales y practicar ejercicios de cálculo.',
    estimatedHours: 2,
    isVisible: true,
  },
  {
    id: 'servicio-demo-2',
    userId: 'miembro-demo-1',
    title: 'Conversación en inglés',
    category: 'Idiomas',
    description:
      'Práctica conversacional de inglés para mejorar tu fluidez y confianza.',
    estimatedHours: 1,
    isVisible: true,
  },
  {
    id: 'servicio-demo-3',
    userId: 'miembro-demo-1',
    title: 'Introducción a Photoshop',
    category: 'Diseño',
    description:
      'Aprende las herramientas básicas de edición de imágenes y retoque fotográfico.',
    estimatedHours: 1.5,
    isVisible: false,
  },

  // 02. SERVICIOS DE CARLOS MARTÍNEZ
  {
    id: 'servicio-demo-4',
    userId: 'miembro-demo-2',
    title: 'Práctica de conversación en inglés',
    category: 'Idiomas / Inglés',
    description:
      'Sesiones para practicar conversación, pronunciación y vocabulario en inglés.',
    estimatedHours: 1,
    isVisible: true,
  },
  {
    id: 'servicio-demo-5',
    userId: 'miembro-demo-2',
    title: 'Asesoría básica de Excel',
    category: 'Tecnología / Ofimática',
    description:
      'Te ayudo a organizar hojas de cálculo y utilizar fórmulas y tablas básicas.',
    estimatedHours: 1.5,
    isVisible: true,
  },

  // 03. SERVICIOS DE CAMILA TORRES
  {
    id: 'servicio-demo-6',
    userId: 'miembro-demo-3',
    title: 'Diseño de presentaciones',
    category: 'Diseño / Presentaciones',
    description:
      'Te ayudo a organizar el contenido y mejorar el diseño visual de tus diapositivas.',
    estimatedHours: 2,
    isVisible: true,
  },
  {
    id: 'servicio-demo-7',
    userId: 'miembro-demo-3',
    title: 'Revisión de textos académicos',
    category: 'Académico / Escritura',
    description:
      'Revisamos la claridad, estructura y ortografía de tus escritos universitarios.',
    estimatedHours: 1.5,
    isVisible: true,
  },

  // 04. SERVICIOS DE SANTIAGO GÓMEZ
  {
    id: 'servicio-demo-8',
    userId: 'miembro-demo-4',
    title: 'Introducción a Python',
    category: 'Tecnología / Programación',
    description:
      'Te acompaño a resolver ejercicios iniciales de Python y entender sus conceptos fundamentales.',
    estimatedHours: 2,
    isVisible: true,
  },
  {
    id: 'servicio-demo-9',
    userId: 'miembro-demo-4',
    title: 'Fundamentos de Git y GitHub',
    category: 'Tecnología / Programación',
    description:
      'Aprende a organizar versiones de tus proyectos y colaborar usando Git y GitHub.',
    estimatedHours: 1,
    isVisible: false,
  },
];
