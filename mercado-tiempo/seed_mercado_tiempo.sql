-- Mercado de Tiempo Uniandes | Seed local demostrativo | PostgreSQL + TypeORM
-- Ejecutar DESPUÉS de iniciar NestJS al menos una vez (synchronize: true).
-- CONTRASEÑA DE PRUEBA PARA TODOS: Demo1234! (hash bcrypt; nunca usar en producción)
-- Horas: valores enteros. Los saldos iniciales son ficticios; el libro refleja los cambios históricos mostrados.
-- Script TRANSACTIONAL y REEJECUTABLE para los IDs de ejemplo (ON CONFLICT DO NOTHING).
-- NO ejecutar sobre producción ni sobre datos que necesites conservar.
BEGIN;
SET LOCAL client_min_messages TO WARNING;

-- usuario_entity: 10 filas
INSERT INTO public."usuario_entity" ("contrasenia", "id", "idUniandes") VALUES
  ('$2b$10$.Lnul788UDC/RbuF7fsOcuIIfDS52leKnx/3a51T4PSx3lwW7md8i', '4da2fb3e-b0f0-566d-876f-4fb684cdfc46', 'demo01'),
  ('$2b$10$.Lnul788UDC/RbuF7fsOcuIIfDS52leKnx/3a51T4PSx3lwW7md8i', 'ebfc8f19-cf01-5472-be35-62f33a09c372', 'demo02'),
  ('$2b$10$.Lnul788UDC/RbuF7fsOcuIIfDS52leKnx/3a51T4PSx3lwW7md8i', '3b1a7106-f336-5ed3-8264-2734bdca4c0c', 'demo03'),
  ('$2b$10$.Lnul788UDC/RbuF7fsOcuIIfDS52leKnx/3a51T4PSx3lwW7md8i', 'b73f68e3-670a-5e1b-9b23-1d674f626ed0', 'demo04'),
  ('$2b$10$.Lnul788UDC/RbuF7fsOcuIIfDS52leKnx/3a51T4PSx3lwW7md8i', '64a71911-cd5f-5471-8352-13f64701c029', 'demo05'),
  ('$2b$10$.Lnul788UDC/RbuF7fsOcuIIfDS52leKnx/3a51T4PSx3lwW7md8i', '1c6d664a-005a-5a17-9a80-25be04b114d0', 'demo06'),
  ('$2b$10$.Lnul788UDC/RbuF7fsOcuIIfDS52leKnx/3a51T4PSx3lwW7md8i', '39098aa2-657f-5e8b-8e6a-ee43c97c3df0', 'demo07'),
  ('$2b$10$.Lnul788UDC/RbuF7fsOcuIIfDS52leKnx/3a51T4PSx3lwW7md8i', '93287c55-1e48-50d6-a0da-6683b44e7fd9', 'demo08'),
  ('$2b$10$.Lnul788UDC/RbuF7fsOcuIIfDS52leKnx/3a51T4PSx3lwW7md8i', '11f374af-def2-537d-84c7-5f5875b1fb09', 'demo09'),
  ('$2b$10$.Lnul788UDC/RbuF7fsOcuIIfDS52leKnx/3a51T4PSx3lwW7md8i', '8b0f8352-61f2-5803-bf61-217380f6b3a0', 'demo10')
ON CONFLICT DO NOTHING;

-- perfil_miembro_entity: 10 filas
INSERT INTO public."perfil_miembro_entity" ("afiliacionUniandes", "descripcion", "edad", "estadoActividad", "id", "idUniandes", "imagen", "nombre", "saldo") VALUES
  ('Estudiante', 'Me gusta ayudar con Excel y organizar actividades comunitarias.', 24, TRUE, '5b605ec0-d034-5f52-bff7-be1ccc2b551e', '4da2fb3e-b0f0-566d-876f-4fb684cdfc46', 'https://i.pravatar.cc/300?img=21', 'Ana Rodríguez', 9),
  ('Egresado', 'Apoyo en ofimática, tecnología y reparaciones básicas.', 27, TRUE, 'aeb0917e-4e4a-57ec-9940-07ef4f467397', 'ebfc8f19-cf01-5472-be35-62f33a09c372', 'https://i.pravatar.cc/300?img=22', 'Bruno Salazar', 10),
  ('Estudiante', 'Me interesan los talleres académicos y la orientación laboral.', 22, TRUE, '2667c23a-96e8-5868-bf9d-e4f5041d5c8c', '3b1a7106-f336-5ed3-8264-2734bdca4c0c', 'https://i.pravatar.cc/300?img=23', 'Carla Méndez', 16),
  ('Profesor', 'Disfruto acompañar y enseñar a otros.', 30, TRUE, '4c2d11b4-6b0c-53a6-a026-93fe20993752', 'b73f68e3-670a-5e1b-9b23-1d674f626ed0', 'https://i.pravatar.cc/300?img=24', 'Diego Rojas', 10),
  ('Estudiante', 'Aprendo idiomas y participo en proyectos comunitarios.', 23, TRUE, 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478', '64a71911-cd5f-5471-8352-13f64701c029', 'https://i.pravatar.cc/300?img=25', 'Elena Vargas', 6),
  ('Estudiante', 'Puedo colaborar con limpieza y apoyo logístico.', 25, TRUE, '826c8b60-b075-5364-92c7-d5464df58f01', '1c6d664a-005a-5a17-9a80-25be04b114d0', 'https://i.pravatar.cc/300?img=26', 'Felipe Pardo', 8),
  ('Egresada', 'Ofrezco tutorías de matemáticas y estadística.', 29, TRUE, '16765914-6158-5ede-b963-2ef1dfcc4a40', '39098aa2-657f-5e8b-8e6a-ee43c97c3df0', 'https://i.pravatar.cc/300?img=27', 'Gabriela Díaz', 11),
  ('Administrativo', 'Cuidado de mascotas y pequeños arreglos.', 31, TRUE, 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9', '93287c55-1e48-50d6-a0da-6683b44e7fd9', 'https://i.pravatar.cc/300?img=28', 'Hugo Romero', 7),
  ('Egresada', 'Coordino una red de acompañamiento y apoyo social.', 34, TRUE, '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd', '11f374af-def2-537d-84c7-5f5875b1fb09', 'https://i.pravatar.cc/300?img=29', 'Isabel Molina', 13),
  ('Administrativo', 'Coordino voluntariados y actividades de divulgación.', 32, TRUE, '5d64ab15-0ee8-5e65-b2dd-3b7d7c49c22d', '8b0f8352-61f2-5803-bf61-217380f6b3a0', 'https://i.pravatar.cc/300?img=30', 'Jorge Torres', 10)
ON CONFLICT DO NOTHING;

-- moderador_entity: 1 filas
INSERT INTO public."moderador_entity" ("id", "idUniandes") VALUES
  ('a0ae03c1-c9e1-5ca3-8d69-ea6d36f17d4c', '8b0f8352-61f2-5803-bf61-217380f6b3a0')
ON CONFLICT DO NOTHING;

-- deposito_horas_entity: 1 filas
INSERT INTO public."deposito_horas_entity" ("id", "saldo") VALUES
  ('8ad70e94-6164-54e8-af7b-222b5e79d9a7', 4)
ON CONFLICT DO NOTHING;

-- perfil_organizacion_entity: 2 filas
INSERT INTO public."perfil_organizacion_entity" ("id", "idPerfil", "numMiembros") VALUES
  ('00d09b70-22e1-5604-b145-472c480bcf25', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd', 3),
  ('4b6762ef-e1e7-5115-90e7-09b02f3c2e05', '5d64ab15-0ee8-5e65-b2dd-3b7d7c49c22d', 3)
ON CONFLICT DO NOTHING;

-- miembro_organizacion_entity: 6 filas
INSERT INTO public."miembro_organizacion_entity" ("idOrganizacion", "idPerfil") VALUES
  ('00d09b70-22e1-5604-b145-472c480bcf25', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd'),
  ('00d09b70-22e1-5604-b145-472c480bcf25', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c'),
  ('00d09b70-22e1-5604-b145-472c480bcf25', '16765914-6158-5ede-b963-2ef1dfcc4a40'),
  ('4b6762ef-e1e7-5115-90e7-09b02f3c2e05', '5d64ab15-0ee8-5e65-b2dd-3b7d7c49c22d'),
  ('4b6762ef-e1e7-5115-90e7-09b02f3c2e05', '826c8b60-b075-5364-92c7-d5464df58f01'),
  ('4b6762ef-e1e7-5115-90e7-09b02f3c2e05', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9')
ON CONFLICT DO NOTHING;

-- categoria_entity: 12 filas
INSERT INTO public."categoria_entity" ("id", "nombre") VALUES
  ('1d130175-34d3-577f-af58-3786fcef9f05', 'Académico'),
  ('b42163a7-81c3-51fa-a756-ccac39e0f41b', 'Tecnología'),
  ('e433e67a-6736-5373-9e2d-4ddc984676f3', 'Hogar'),
  ('20cfb31a-dd04-53eb-b6fd-0d787942547d', 'Cuidado y compañía'),
  ('adb1fc75-b9bd-5a59-be9f-8c25a4fe7ad4', 'Limpieza'),
  ('5f13268b-fa20-54a8-b857-e91c0d1c9eb3', 'Artes y manualidades'),
  ('ee2e25fd-0578-583f-bf12-f63bca2b54c9', 'Idiomas'),
  ('78c7dd5b-a06b-5bc7-ab75-f92be4347eb3', 'Mascotas'),
  ('c974d049-9606-5bb3-adb6-262548f1a9db', 'Transporte'),
  ('b36d9fec-80f1-5477-81ef-69475d2d892c', 'Comunidad'),
  ('3d08ad13-ea54-5f22-928b-b925ecf0a5ba', 'Deporte'),
  ('3307eba1-754c-54bd-a963-856090f69bb2', 'Jardinería')
ON CONFLICT DO NOTHING;

-- perfil_interes_entity: 20 filas
INSERT INTO public."perfil_interes_entity" ("idCategoria", "idPerfil") VALUES
  ('b42163a7-81c3-51fa-a756-ccac39e0f41b', '5b605ec0-d034-5f52-bff7-be1ccc2b551e'),
  ('b36d9fec-80f1-5477-81ef-69475d2d892c', '5b605ec0-d034-5f52-bff7-be1ccc2b551e'),
  ('b42163a7-81c3-51fa-a756-ccac39e0f41b', 'aeb0917e-4e4a-57ec-9940-07ef4f467397'),
  ('e433e67a-6736-5373-9e2d-4ddc984676f3', 'aeb0917e-4e4a-57ec-9940-07ef4f467397'),
  ('1d130175-34d3-577f-af58-3786fcef9f05', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c'),
  ('ee2e25fd-0578-583f-bf12-f63bca2b54c9', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c'),
  ('20cfb31a-dd04-53eb-b6fd-0d787942547d', '4c2d11b4-6b0c-53a6-a026-93fe20993752'),
  ('1d130175-34d3-577f-af58-3786fcef9f05', '4c2d11b4-6b0c-53a6-a026-93fe20993752'),
  ('ee2e25fd-0578-583f-bf12-f63bca2b54c9', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478'),
  ('b36d9fec-80f1-5477-81ef-69475d2d892c', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478'),
  ('adb1fc75-b9bd-5a59-be9f-8c25a4fe7ad4', '826c8b60-b075-5364-92c7-d5464df58f01'),
  ('e433e67a-6736-5373-9e2d-4ddc984676f3', '826c8b60-b075-5364-92c7-d5464df58f01'),
  ('1d130175-34d3-577f-af58-3786fcef9f05', '16765914-6158-5ede-b963-2ef1dfcc4a40'),
  ('b42163a7-81c3-51fa-a756-ccac39e0f41b', '16765914-6158-5ede-b963-2ef1dfcc4a40'),
  ('78c7dd5b-a06b-5bc7-ab75-f92be4347eb3', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9'),
  ('3307eba1-754c-54bd-a963-856090f69bb2', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9'),
  ('b36d9fec-80f1-5477-81ef-69475d2d892c', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd'),
  ('20cfb31a-dd04-53eb-b6fd-0d787942547d', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd'),
  ('b36d9fec-80f1-5477-81ef-69475d2d892c', '5d64ab15-0ee8-5e65-b2dd-3b7d7c49c22d'),
  ('3d08ad13-ea54-5f22-928b-b925ecf0a5ba', '5d64ab15-0ee8-5e65-b2dd-3b7d7c49c22d')
ON CONFLICT DO NOTHING;

-- servicio_ofrecido_entity: 12 filas
INSERT INTO public."servicio_ofrecido_entity" ("descripcion", "id", "idPerfil", "imagen", "titulo", "visible") VALUES
  ('Apoyo para organizar tablas, fórmulas y gráficos.', '1b0e4b63-c451-5e9c-a862-e51690c8a5a8', 'aeb0917e-4e4a-57ec-9940-07ef4f467397', 'https://picsum.photos/seed/servicio-s01/640/400', 'Asesoría en Excel', TRUE),
  ('Comentarios sobre formato, claridad y redacción de CV.', 'd2d414be-78f8-5324-8bff-b11babb6051b', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c', 'https://picsum.photos/seed/servicio-s02/640/400', 'Revisión de hojas de vida', TRUE),
  ('Acompañamiento conversacional y actividades no clínicas.', '1c3ccb41-9152-5f19-b41f-94e694d1e754', '4c2d11b4-6b0c-53a6-a026-93fe20993752', 'https://picsum.photos/seed/servicio-s03/640/400', 'Acompañamiento a adultos mayores', TRUE),
  ('Refuerzo de ejercicios y resolución de dudas.', '911347ff-49d8-542c-8a57-b6c4cd106306', '16765914-6158-5ede-b963-2ef1dfcc4a40', 'https://picsum.photos/seed/servicio-s04/640/400', 'Tutoría de álgebra', TRUE),
  ('Paseos cortos y alimentación de mascotas.', '7ff4464e-cba7-5d2f-ba4f-6a180309de0c', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9', 'https://picsum.photos/seed/servicio-s05/640/400', 'Cuidado de mascotas', TRUE),
  ('Ayuda para ordenar y clasificar objetos en casa.', '58e0a7cc-0843-5fb9-852f-b1cd77113efc', '826c8b60-b075-5364-92c7-d5464df58f01', 'https://picsum.photos/seed/servicio-s06/640/400', 'Organización de espacios', TRUE),
  ('Práctica de conversación de nivel básico.', '1631ef06-cb70-51b7-8529-915b55b9c47b', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478', 'https://picsum.photos/seed/servicio-s07/640/400', 'Conversación en inglés', TRUE),
  ('Organizar gastos y tareas en hojas compartidas.', 'a7b6d71e-b986-5190-90a2-637ff16c5227', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 'https://picsum.photos/seed/servicio-s08/640/400', 'Apoyo en hojas de cálculo', TRUE),
  ('Revisión de frenos y ajustes sencillos.', '69087d9b-fc29-5b42-bfd6-d53b4e32cc13', '5d64ab15-0ee8-5e65-b2dd-3b7d7c49c22d', 'https://picsum.photos/seed/servicio-s09/640/400', 'Ajustes básicos de bicicleta', TRUE),
  ('Coordinación de redes de apoyo y actividades vecinales.', 'e30eae95-9fcb-5a97-ae8b-1b198fee6f87', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd', 'https://picsum.photos/seed/servicio-s10/640/400', 'Acompañamiento comunitario', TRUE),
  ('Revisión de estructura y elementos visuales.', '104b94f8-bf9b-5320-9b31-62dd7e3e9a1b', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c', 'https://picsum.photos/seed/servicio-s11/640/400', 'Apoyo con presentaciones', TRUE),
  ('Organización de calendarios y técnicas de repaso.', 'c772d60a-d73c-5728-b4fc-f64264cc3e7e', '4c2d11b4-6b0c-53a6-a026-93fe20993752', 'https://picsum.photos/seed/servicio-s12/640/400', 'Asesoría para hábitos de estudio', TRUE)
ON CONFLICT DO NOTHING;

-- servicio_ofrecido_categoria_entity: 16 filas
INSERT INTO public."servicio_ofrecido_categoria_entity" ("idCategoria", "idServicio") VALUES
  ('b42163a7-81c3-51fa-a756-ccac39e0f41b', '1b0e4b63-c451-5e9c-a862-e51690c8a5a8'),
  ('1d130175-34d3-577f-af58-3786fcef9f05', '1b0e4b63-c451-5e9c-a862-e51690c8a5a8'),
  ('1d130175-34d3-577f-af58-3786fcef9f05', 'd2d414be-78f8-5324-8bff-b11babb6051b'),
  ('20cfb31a-dd04-53eb-b6fd-0d787942547d', '1c3ccb41-9152-5f19-b41f-94e694d1e754'),
  ('1d130175-34d3-577f-af58-3786fcef9f05', '911347ff-49d8-542c-8a57-b6c4cd106306'),
  ('78c7dd5b-a06b-5bc7-ab75-f92be4347eb3', '7ff4464e-cba7-5d2f-ba4f-6a180309de0c'),
  ('adb1fc75-b9bd-5a59-be9f-8c25a4fe7ad4', '58e0a7cc-0843-5fb9-852f-b1cd77113efc'),
  ('e433e67a-6736-5373-9e2d-4ddc984676f3', '58e0a7cc-0843-5fb9-852f-b1cd77113efc'),
  ('ee2e25fd-0578-583f-bf12-f63bca2b54c9', '1631ef06-cb70-51b7-8529-915b55b9c47b'),
  ('b42163a7-81c3-51fa-a756-ccac39e0f41b', 'a7b6d71e-b986-5190-90a2-637ff16c5227'),
  ('e433e67a-6736-5373-9e2d-4ddc984676f3', '69087d9b-fc29-5b42-bfd6-d53b4e32cc13'),
  ('3d08ad13-ea54-5f22-928b-b925ecf0a5ba', '69087d9b-fc29-5b42-bfd6-d53b4e32cc13'),
  ('b36d9fec-80f1-5477-81ef-69475d2d892c', 'e30eae95-9fcb-5a97-ae8b-1b198fee6f87'),
  ('1d130175-34d3-577f-af58-3786fcef9f05', '104b94f8-bf9b-5320-9b31-62dd7e3e9a1b'),
  ('b42163a7-81c3-51fa-a756-ccac39e0f41b', '104b94f8-bf9b-5320-9b31-62dd7e3e9a1b'),
  ('1d130175-34d3-577f-af58-3786fcef9f05', 'c772d60a-d73c-5728-b4fc-f64264cc3e7e')
ON CONFLICT DO NOTHING;

-- organizacion_institucional_entity: 2 filas
INSERT INTO public."organizacion_institucional_entity" ("descripcion", "id", "imagen", "nombre") VALUES
  ('Actividades abiertas a la comunidad universitaria.', '70ea4547-a8c9-52b3-b5e6-a46d555dbda4', 'https://picsum.photos/seed/inst-uniandes/640/400', 'Universidad de los Andes'),
  ('Espacios de participación, integración y voluntariado.', '72555c1e-edf4-54d6-a3fd-9029f2d22cff', 'https://picsum.photos/seed/inst-bienestar/640/400', 'Bienestar Universitario')
ON CONFLICT DO NOTHING;

-- actividad_comunitaria_entity: 2 filas
INSERT INTO public."actividad_comunitaria_entity" ("cupo", "cupoLleno", "descripcion", "fechaCreacion", "id", "idInstitucion", "imagen", "titulo") VALUES
  (10, FALSE, 'Comparte lo que sabes con otros miembros.', CURRENT_DATE + INTERVAL '-5 day' + INTERVAL '8 hour' + INTERVAL '0 minute', 'c25b837a-15e5-50cc-925c-4b5a6c208ca3', '70ea4547-a8c9-52b3-b5e6-a46d555dbda4', 'https://picsum.photos/seed/act1/640/400', 'Taller de intercambio de habilidades'),
  (3, TRUE, 'Actividades de apoyo y encuentro comunitario.', CURRENT_DATE + INTERVAL '-5 day' + INTERVAL '8 hour' + INTERVAL '0 minute', 'd57b2921-63bb-5a1a-a867-8dffe907cbec', '72555c1e-edf4-54d6-a3fd-9029f2d22cff', 'https://picsum.photos/seed/act2/640/400', 'Jornada de voluntariado universitario')
ON CONFLICT DO NOTHING;

-- inscripcion_actividad_entity: 6 filas
INSERT INTO public."inscripcion_actividad_entity" ("idActividad", "idPerfil") VALUES
  ('c25b837a-15e5-50cc-925c-4b5a6c208ca3', '5b605ec0-d034-5f52-bff7-be1ccc2b551e'),
  ('c25b837a-15e5-50cc-925c-4b5a6c208ca3', 'aeb0917e-4e4a-57ec-9940-07ef4f467397'),
  ('c25b837a-15e5-50cc-925c-4b5a6c208ca3', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c'),
  ('d57b2921-63bb-5a1a-a867-8dffe907cbec', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478'),
  ('d57b2921-63bb-5a1a-a867-8dffe907cbec', '826c8b60-b075-5364-92c7-d5464df58f01'),
  ('d57b2921-63bb-5a1a-a867-8dffe907cbec', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9')
ON CONFLICT DO NOTHING;

-- post_ayuda_entity: 14 filas
INSERT INTO public."post_ayuda_entity" ("cupo", "cupoLleno", "descripcion", "fechaCreacion", "horas", "id", "idPerfilAutor", "imagen", "ofrece", "titulo") VALUES
  (1, TRUE, 'Podemos revisar fórmulas y tablas para un proyecto.', CURRENT_DATE + INTERVAL '-25 day' + INTERVAL '12 hour' + INTERVAL '0 minute', 2, '3c04655b-8703-5298-9dd8-87c7a64c9ea0', 'aeb0917e-4e4a-57ec-9940-07ef4f467397', 'https://picsum.photos/seed/post-p01/640/400', TRUE, 'Te ayudo con Excel'),
  (2, TRUE, 'Sesión grupal para mejorar perfiles laborales.', CURRENT_DATE + INTERVAL '-25 day' + INTERVAL '12 hour' + INTERVAL '0 minute', 2, '965bac72-d5d1-50f4-8136-82ebd7394a32', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c', 'https://picsum.photos/seed/post-p02/640/400', TRUE, 'Revisemos tu hoja de vida'),
  (2, FALSE, 'Espacio para conversar y compartir actividades.', CURRENT_DATE + INTERVAL '-25 day' + INTERVAL '12 hour' + INTERVAL '0 minute', 3, 'b560e31a-c2f0-5517-b86f-b8caae1ac2e3', '4c2d11b4-6b0c-53a6-a026-93fe20993752', 'https://picsum.photos/seed/post-p03/640/400', TRUE, 'Acompañamiento y conversación'),
  (1, TRUE, 'Busco apoyo para ensamblar un estante sencillo.', CURRENT_DATE + INTERVAL '-25 day' + INTERVAL '12 hour' + INTERVAL '0 minute', 2, 'e904eed6-8863-5284-b5e3-7df395c8a3e0', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 'https://picsum.photos/seed/post-p04/640/400', FALSE, 'Necesito ayuda para montar un estante'),
  (1, TRUE, 'Resolveremos ejercicios de matrices y vectores.', CURRENT_DATE + INTERVAL '-25 day' + INTERVAL '12 hour' + INTERVAL '0 minute', 2, 'e8f3c8c3-6295-5a58-9392-e08cb7ec0fcd', '16765914-6158-5ede-b963-2ef1dfcc4a40', 'https://picsum.photos/seed/post-p05/640/400', TRUE, 'Refuerzo de álgebra lineal'),
  (3, FALSE, 'Buscamos apoyo para organizar y catalogar libros.', CURRENT_DATE + INTERVAL '-25 day' + INTERVAL '12 hour' + INTERVAL '0 minute', 3, '91d6076d-61b2-5c30-8407-6a5578a71b08', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd', 'https://picsum.photos/seed/post-p06/640/400', FALSE, 'Ayuda con la biblioteca comunitaria'),
  (1, FALSE, 'La cadena y los frenos necesitan ajustes.', CURRENT_DATE + INTERVAL '-25 day' + INTERVAL '12 hour' + INTERVAL '0 minute', 2, '83d6b4a6-5a85-5db4-8add-d4c5bc8ecbf3', '826c8b60-b075-5364-92c7-d5464df58f01', 'https://picsum.photos/seed/post-p07/640/400', FALSE, 'Necesito ayuda para ajustar mi bici'),
  (2, FALSE, 'Paseo corto con correa por zonas seguras.', CURRENT_DATE + INTERVAL '-25 day' + INTERVAL '12 hour' + INTERVAL '0 minute', 1, '04d5b2f8-f62b-527c-9983-c0f4d5045647', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9', 'https://picsum.photos/seed/post-p08/640/400', TRUE, 'Puedo pasear a tu perro'),
  (3, FALSE, 'Conversación básica y vocabulario cotidiano.', CURRENT_DATE + INTERVAL '-25 day' + INTERVAL '12 hour' + INTERVAL '0 minute', 2, 'ede06250-ef50-545d-81f2-83409b26f669', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478', 'https://picsum.photos/seed/post-p09/640/400', TRUE, 'Practicamos inglés'),
  (2, FALSE, 'Busco apoyo visual para unas diapositivas.', CURRENT_DATE + INTERVAL '-25 day' + INTERVAL '12 hour' + INTERVAL '0 minute', 2, '20df70f3-4e42-533e-8251-1e5e68daec4e', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c', 'https://picsum.photos/seed/post-p10/640/400', FALSE, 'Ayuda para preparar una presentación'),
  (5, FALSE, 'Participa recogiendo residuos y organizando material.', CURRENT_DATE + INTERVAL '-25 day' + INTERVAL '12 hour' + INTERVAL '0 minute', 3, 'a4a9ce92-2cdd-596d-a5a1-5db2aa0cf34f', '5d64ab15-0ee8-5e65-b2dd-3b7d7c49c22d', 'https://picsum.photos/seed/post-p11/640/400', TRUE, 'Jornada de limpieza de parque'),
  (2, FALSE, 'Te ayudo a organizar carpetas y documentos.', CURRENT_DATE + INTERVAL '-25 day' + INTERVAL '12 hour' + INTERVAL '0 minute', 2, '4ff990f5-ef5a-5526-ab95-df90d222a6d5', '826c8b60-b075-5364-92c7-d5464df58f01', 'https://picsum.photos/seed/post-p12/640/400', TRUE, 'Orden y clasificación de archivos'),
  (2, FALSE, 'Revisar conceptos y ejercicios de práctica.', CURRENT_DATE + INTERVAL '-25 day' + INTERVAL '12 hour' + INTERVAL '0 minute', 2, 'c367e63d-0697-5596-a186-d7903cef5690', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 'https://picsum.photos/seed/post-p13/640/400', FALSE, 'Necesito apoyo con una tarea de estadística'),
  (1, FALSE, 'Puedo regar macetas en una visita corta.', CURRENT_DATE + INTERVAL '-25 day' + INTERVAL '12 hour' + INTERVAL '0 minute', 1, 'd02150f0-a1da-5d8e-9f9b-dd57d2050f75', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9', 'https://picsum.photos/seed/post-p14/640/400', TRUE, 'Riego de plantas durante vacaciones')
ON CONFLICT DO NOTHING;

-- post_ayuda_categoria_entity: 20 filas
INSERT INTO public."post_ayuda_categoria_entity" ("idCategoria", "idPostAyuda") VALUES
  ('b42163a7-81c3-51fa-a756-ccac39e0f41b', '3c04655b-8703-5298-9dd8-87c7a64c9ea0'),
  ('1d130175-34d3-577f-af58-3786fcef9f05', '3c04655b-8703-5298-9dd8-87c7a64c9ea0'),
  ('1d130175-34d3-577f-af58-3786fcef9f05', '965bac72-d5d1-50f4-8136-82ebd7394a32'),
  ('20cfb31a-dd04-53eb-b6fd-0d787942547d', 'b560e31a-c2f0-5517-b86f-b8caae1ac2e3'),
  ('e433e67a-6736-5373-9e2d-4ddc984676f3', 'e904eed6-8863-5284-b5e3-7df395c8a3e0'),
  ('1d130175-34d3-577f-af58-3786fcef9f05', 'e8f3c8c3-6295-5a58-9392-e08cb7ec0fcd'),
  ('b36d9fec-80f1-5477-81ef-69475d2d892c', '91d6076d-61b2-5c30-8407-6a5578a71b08'),
  ('e433e67a-6736-5373-9e2d-4ddc984676f3', '91d6076d-61b2-5c30-8407-6a5578a71b08'),
  ('3d08ad13-ea54-5f22-928b-b925ecf0a5ba', '83d6b4a6-5a85-5db4-8add-d4c5bc8ecbf3'),
  ('e433e67a-6736-5373-9e2d-4ddc984676f3', '83d6b4a6-5a85-5db4-8add-d4c5bc8ecbf3'),
  ('78c7dd5b-a06b-5bc7-ab75-f92be4347eb3', '04d5b2f8-f62b-527c-9983-c0f4d5045647'),
  ('ee2e25fd-0578-583f-bf12-f63bca2b54c9', 'ede06250-ef50-545d-81f2-83409b26f669'),
  ('1d130175-34d3-577f-af58-3786fcef9f05', '20df70f3-4e42-533e-8251-1e5e68daec4e'),
  ('b42163a7-81c3-51fa-a756-ccac39e0f41b', '20df70f3-4e42-533e-8251-1e5e68daec4e'),
  ('b36d9fec-80f1-5477-81ef-69475d2d892c', 'a4a9ce92-2cdd-596d-a5a1-5db2aa0cf34f'),
  ('adb1fc75-b9bd-5a59-be9f-8c25a4fe7ad4', 'a4a9ce92-2cdd-596d-a5a1-5db2aa0cf34f'),
  ('e433e67a-6736-5373-9e2d-4ddc984676f3', '4ff990f5-ef5a-5526-ab95-df90d222a6d5'),
  ('b42163a7-81c3-51fa-a756-ccac39e0f41b', '4ff990f5-ef5a-5526-ab95-df90d222a6d5'),
  ('1d130175-34d3-577f-af58-3786fcef9f05', 'c367e63d-0697-5596-a186-d7903cef5690'),
  ('3307eba1-754c-54bd-a963-856090f69bb2', 'd02150f0-a1da-5d8e-9f9b-dd57d2050f75')
ON CONFLICT DO NOTHING;

-- solicitud_ayuda_entity: 3 filas
INSERT INTO public."solicitud_ayuda_entity" ("aceptada", "descripcion", "fechaCreacion", "horas", "id", "idPerfilAutor", "idPrestador", "idServicioOfrecido", "titulo") VALUES
  (TRUE, 'Apoyo para organizar un encuentro de vecinos.', CURRENT_DATE + INTERVAL '-7 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 2, '826dc872-45a0-5228-a9ae-b6f2b2f435df', '826c8b60-b075-5364-92c7-d5464df58f01', '00d09b70-22e1-5604-b145-472c480bcf25', 'e30eae95-9fcb-5a97-ae8b-1b198fee6f87', 'Solicito acompañamiento grupal'),
  (FALSE, 'Necesito orientación con la logística de un evento.', CURRENT_DATE + INTERVAL '-7 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 2, 'e53102a5-3381-588b-9ce7-8291549f1b97', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478', '00d09b70-22e1-5604-b145-472c480bcf25', 'e30eae95-9fcb-5a97-ae8b-1b198fee6f87', 'Busco apoyo para una actividad'),
  (FALSE, 'Ajustar frenos antes de una salida corta.', CURRENT_DATE + INTERVAL '-7 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 1, 'e693658e-36e9-5664-9127-0e761c45b419', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', '4b6762ef-e1e7-5115-90e7-09b02f3c2e05', '69087d9b-fc29-5b42-bfd6-d53b4e32cc13', 'Revisión de bicicleta')
ON CONFLICT DO NOTHING;

-- chat_entity: 9 filas
INSERT INTO public."chat_entity" ("id") VALUES
  ('1480078c-6630-535b-bd3f-55667f13534c'),
  ('e948e387-f451-55db-bf3d-7f355d051020'),
  ('c22b2ff7-7037-571e-94f3-c7d77c13ead5'),
  ('4eccc115-eeb3-57aa-b173-58ed7eb9d280'),
  ('f93d1b3b-eefc-553e-a35f-3d335a1cb2e6'),
  ('4e7c35dc-1d21-52df-bc58-901a417190b1'),
  ('48280b1e-4948-5af2-8e6d-296a6d9cef89'),
  ('bfde24a1-6302-536c-a12a-a4fa1f009a92'),
  ('87d58269-0530-54d6-ab4d-8c1ac904994c')
ON CONFLICT DO NOTHING;

-- horario_disponible_entity: 17 filas
INSERT INTO public."horario_disponible_entity" ("fechaFin", "fechaInicio", "id", "idPerfil", "idPostAyuda") VALUES
  (CURRENT_DATE + INTERVAL '-15 day' + INTERVAL '11 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '-15 day' + INTERVAL '9 hour' + INTERVAL '0 minute', 'b0b9c17a-2b90-55a6-905e-510a89c592ef', 'aeb0917e-4e4a-57ec-9940-07ef4f467397', '3c04655b-8703-5298-9dd8-87c7a64c9ea0'),
  (CURRENT_DATE + INTERVAL '-12 day' + INTERVAL '16 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '-12 day' + INTERVAL '14 hour' + INTERVAL '0 minute', '9765f13b-cc99-5e57-ba75-8aa4a0e21481', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c', '965bac72-d5d1-50f4-8136-82ebd7394a32'),
  (CURRENT_DATE + INTERVAL '7 day' + INTERVAL '12 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '7 day' + INTERVAL '9 hour' + INTERVAL '0 minute', '402b0388-fe13-5696-8a0b-c05add8d81d9', '4c2d11b4-6b0c-53a6-a026-93fe20993752', 'b560e31a-c2f0-5517-b86f-b8caae1ac2e3'),
  (CURRENT_DATE + INTERVAL '8 day' + INTERVAL '12 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '8 day' + INTERVAL '9 hour' + INTERVAL '0 minute', '90d077f4-9b45-5d8d-b921-3dd18026f07c', '4c2d11b4-6b0c-53a6-a026-93fe20993752', 'b560e31a-c2f0-5517-b86f-b8caae1ac2e3'),
  (CURRENT_DATE + INTERVAL '9 day' + INTERVAL '16 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '9 day' + INTERVAL '14 hour' + INTERVAL '0 minute', 'cc2c16b0-752b-5593-a2b3-e8a2167a0b16', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 'e904eed6-8863-5284-b5e3-7df395c8a3e0'),
  (CURRENT_DATE + INTERVAL '6 day' + INTERVAL '17 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '6 day' + INTERVAL '15 hour' + INTERVAL '0 minute', '0737a3de-90f6-5590-84a5-91a0615a3252', '16765914-6158-5ede-b963-2ef1dfcc4a40', 'e8f3c8c3-6295-5a58-9392-e08cb7ec0fcd'),
  (CURRENT_DATE + INTERVAL '7 day' + INTERVAL '17 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '7 day' + INTERVAL '15 hour' + INTERVAL '0 minute', '60538d86-f5c0-5b1d-802c-27bfbd26147d', '16765914-6158-5ede-b963-2ef1dfcc4a40', 'e8f3c8c3-6295-5a58-9392-e08cb7ec0fcd'),
  (CURRENT_DATE + INTERVAL '10 day' + INTERVAL '12 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '10 day' + INTERVAL '9 hour' + INTERVAL '0 minute', '92314bfe-97b1-57f9-9ffb-9bd138998ab9', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd', '91d6076d-61b2-5c30-8407-6a5578a71b08'),
  (CURRENT_DATE + INTERVAL '8 day' + INTERVAL '18 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '8 day' + INTERVAL '16 hour' + INTERVAL '0 minute', '33335f77-b166-53ca-a9de-17467366fc3a', '826c8b60-b075-5364-92c7-d5464df58f01', '83d6b4a6-5a85-5db4-8add-d4c5bc8ecbf3'),
  (CURRENT_DATE + INTERVAL '5 day' + INTERVAL '11 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '5 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 'e4ab5b77-7513-5151-b6fd-68dae24233a6', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9', '04d5b2f8-f62b-527c-9983-c0f4d5045647'),
  (CURRENT_DATE + INTERVAL '11 day' + INTERVAL '19 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '11 day' + INTERVAL '17 hour' + INTERVAL '0 minute', 'aa8cb607-8e96-53e3-b231-4d81bc2402b0', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478', 'ede06250-ef50-545d-81f2-83409b26f669'),
  (CURRENT_DATE + INTERVAL '12 day' + INTERVAL '19 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '12 day' + INTERVAL '17 hour' + INTERVAL '0 minute', '81cd3637-adfe-5e9e-a86c-186e0e063e02', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478', 'ede06250-ef50-545d-81f2-83409b26f669'),
  (CURRENT_DATE + INTERVAL '13 day' + INTERVAL '13 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '13 day' + INTERVAL '11 hour' + INTERVAL '0 minute', '32e576ca-616a-5f40-a37e-98fcce350b91', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c', '20df70f3-4e42-533e-8251-1e5e68daec4e'),
  (CURRENT_DATE + INTERVAL '14 day' + INTERVAL '11 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '14 day' + INTERVAL '8 hour' + INTERVAL '0 minute', 'fa804380-7f39-50b7-8116-0bd73504398f', '5d64ab15-0ee8-5e65-b2dd-3b7d7c49c22d', 'a4a9ce92-2cdd-596d-a5a1-5db2aa0cf34f'),
  (CURRENT_DATE + INTERVAL '16 day' + INTERVAL '11 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '16 day' + INTERVAL '9 hour' + INTERVAL '0 minute', 'ba582fbb-1ab2-52f5-be95-87126ffeebc3', '826c8b60-b075-5364-92c7-d5464df58f01', '4ff990f5-ef5a-5526-ab95-df90d222a6d5'),
  (CURRENT_DATE + INTERVAL '15 day' + INTERVAL '17 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '15 day' + INTERVAL '15 hour' + INTERVAL '0 minute', '58542b65-2eeb-5b72-abd8-60dfcd248856', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 'c367e63d-0697-5596-a186-d7903cef5690'),
  (CURRENT_DATE + INTERVAL '18 day' + INTERVAL '11 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '18 day' + INTERVAL '10 hour' + INTERVAL '0 minute', '711b292d-e1a9-579d-b68c-df31f6e25627', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9', 'd02150f0-a1da-5d8e-9f9b-dd57d2050f75')
ON CONFLICT DO NOTHING;

-- horario_disponible_entity: 2 filas
INSERT INTO public."horario_disponible_entity" ("fechaFin", "fechaInicio", "id", "idActividad", "idPerfil") VALUES
  (CURRENT_DATE + INTERVAL '6 day' + INTERVAL '12 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '6 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 'c9be342b-daed-5a8b-b407-3877d4adcd3d', 'c25b837a-15e5-50cc-925c-4b5a6c208ca3', '5d64ab15-0ee8-5e65-b2dd-3b7d7c49c22d'),
  (CURRENT_DATE + INTERVAL '12 day' + INTERVAL '12 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '12 day' + INTERVAL '9 hour' + INTERVAL '0 minute', '9e305306-93be-5b8b-968c-125b00e77fc5', 'd57b2921-63bb-5a1a-a867-8dffe907cbec', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd')
ON CONFLICT DO NOTHING;

-- horario_disponible_entity: 3 filas
INSERT INTO public."horario_disponible_entity" ("fechaFin", "fechaInicio", "id", "idPerfil", "idSolicitud") VALUES
  (CURRENT_DATE + INTERVAL '8 day' + INTERVAL '12 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '8 day' + INTERVAL '10 hour' + INTERVAL '0 minute', '124f631e-7513-5f9a-bab7-b2bc12c03c87', '826c8b60-b075-5364-92c7-d5464df58f01', '826dc872-45a0-5228-a9ae-b6f2b2f435df'),
  (CURRENT_DATE + INTERVAL '17 day' + INTERVAL '12 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '17 day' + INTERVAL '10 hour' + INTERVAL '0 minute', '1d2d6165-0f9e-506e-8aa8-7ec6c8bc5551', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478', 'e53102a5-3381-588b-9ce7-8291549f1b97'),
  (CURRENT_DATE + INTERVAL '19 day' + INTERVAL '11 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '19 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 'b0d0d9de-3a00-5bf0-bee9-49952d62d43a', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 'e693658e-36e9-5664-9127-0e761c45b419')
ON CONFLICT DO NOTHING;

-- acuerdo_entity: 8 filas
INSERT INTO public."acuerdo_entity" ("estado", "fechaCreacion", "fechaRealizacion", "horas", "id", "idChat", "idPostAyuda") VALUES
  (2, CURRENT_DATE + INTERVAL '-10 day' + INTERVAL '10 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '-15 day' + INTERVAL '9 hour' + INTERVAL '0 minute', 2, '9bdc34f2-55ae-53b8-8fd5-567f6acac5ea', '1480078c-6630-535b-bd3f-55667f13534c', '3c04655b-8703-5298-9dd8-87c7a64c9ea0'),
  (2, CURRENT_DATE + INTERVAL '-10 day' + INTERVAL '10 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '-12 day' + INTERVAL '14 hour' + INTERVAL '0 minute', 2, '23d794b9-7c21-565d-8f1d-998a412b1fff', 'e948e387-f451-55db-bf3d-7f355d051020', '965bac72-d5d1-50f4-8136-82ebd7394a32'),
  (1, CURRENT_DATE + INTERVAL '-10 day' + INTERVAL '10 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '7 day' + INTERVAL '9 hour' + INTERVAL '0 minute', 3, 'a2c04c95-f789-5650-9f31-82b144b7b926', 'c22b2ff7-7037-571e-94f3-c7d77c13ead5', 'b560e31a-c2f0-5517-b86f-b8caae1ac2e3'),
  (0, CURRENT_DATE + INTERVAL '-10 day' + INTERVAL '10 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '9 day' + INTERVAL '14 hour' + INTERVAL '0 minute', 2, 'a8fd5cb3-bb94-58a4-9a16-512d844e387e', '4eccc115-eeb3-57aa-b173-58ed7eb9d280', 'e904eed6-8863-5284-b5e3-7df395c8a3e0'),
  (3, CURRENT_DATE + INTERVAL '-10 day' + INTERVAL '10 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '6 day' + INTERVAL '15 hour' + INTERVAL '0 minute', 2, 'ba77ee45-82fb-5e9a-8857-8cfda0eb1fb6', 'f93d1b3b-eefc-553e-a35f-3d335a1cb2e6', 'e8f3c8c3-6295-5a58-9392-e08cb7ec0fcd'),
  (1, CURRENT_DATE + INTERVAL '-10 day' + INTERVAL '10 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '10 day' + INTERVAL '9 hour' + INTERVAL '0 minute', 3, '1279479a-ff3f-5e26-8d40-8f8e1b7bbe0f', '4e7c35dc-1d21-52df-bc58-901a417190b1', '91d6076d-61b2-5c30-8407-6a5578a71b08'),
  (4, CURRENT_DATE + INTERVAL '-10 day' + INTERVAL '10 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '8 day' + INTERVAL '16 hour' + INTERVAL '0 minute', 2, '9adcaa7f-53d0-5b25-ad21-1c84e4026159', '48280b1e-4948-5af2-8e6d-296a6d9cef89', '83d6b4a6-5a85-5db4-8add-d4c5bc8ecbf3'),
  (0, CURRENT_DATE + INTERVAL '-10 day' + INTERVAL '10 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '5 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 1, 'dfeb7ed0-3115-59db-8302-c9fede7988a8', 'bfde24a1-6302-536c-a12a-a4fa1f009a92', '04d5b2f8-f62b-527c-9983-c0f4d5045647')
ON CONFLICT DO NOTHING;

-- acuerdo_entity: 1 filas
INSERT INTO public."acuerdo_entity" ("estado", "fechaCreacion", "fechaRealizacion", "horas", "id", "idChat", "idSolicitud") VALUES
  (1, CURRENT_DATE + INTERVAL '-10 day' + INTERVAL '10 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '8 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 2, '6126976f-6205-54a3-8536-9f29b18e5bd4', '87d58269-0530-54d6-ab4d-8c1ac904994c', '826dc872-45a0-5228-a9ae-b6f2b2f435df')
ON CONFLICT DO NOTHING;

-- participante_acuerdo_entity: 19 filas
INSERT INTO public."participante_acuerdo_entity" ("confirmoPrestacion", "envioDisponibilidad", "fechaConfirmacion", "idAcuerdo", "idPerfil", "rol") VALUES
  (TRUE, TRUE, CURRENT_DATE + INTERVAL '-15 day' + INTERVAL '12 hour' + INTERVAL '0 minute', '9bdc34f2-55ae-53b8-8fd5-567f6acac5ea', 'aeb0917e-4e4a-57ec-9940-07ef4f467397', 'PRESTADOR'),
  (TRUE, TRUE, CURRENT_DATE + INTERVAL '-15 day' + INTERVAL '12 hour' + INTERVAL '0 minute', '9bdc34f2-55ae-53b8-8fd5-567f6acac5ea', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 'RECEPTOR'),
  (TRUE, TRUE, CURRENT_DATE + INTERVAL '-12 day' + INTERVAL '17 hour' + INTERVAL '0 minute', '23d794b9-7c21-565d-8f1d-998a412b1fff', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c', 'PRESTADOR'),
  (TRUE, TRUE, CURRENT_DATE + INTERVAL '-12 day' + INTERVAL '17 hour' + INTERVAL '0 minute', '23d794b9-7c21-565d-8f1d-998a412b1fff', '4c2d11b4-6b0c-53a6-a026-93fe20993752', 'RECEPTOR'),
  (TRUE, TRUE, CURRENT_DATE + INTERVAL '-12 day' + INTERVAL '17 hour' + INTERVAL '0 minute', '23d794b9-7c21-565d-8f1d-998a412b1fff', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478', 'RECEPTOR'),
  (FALSE, TRUE, NULL, 'a2c04c95-f789-5650-9f31-82b144b7b926', '4c2d11b4-6b0c-53a6-a026-93fe20993752', 'PRESTADOR'),
  (FALSE, TRUE, NULL, 'a2c04c95-f789-5650-9f31-82b144b7b926', '826c8b60-b075-5364-92c7-d5464df58f01', 'RECEPTOR'),
  (FALSE, FALSE, NULL, 'a8fd5cb3-bb94-58a4-9a16-512d844e387e', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 'RECEPTOR'),
  (FALSE, FALSE, NULL, 'a8fd5cb3-bb94-58a4-9a16-512d844e387e', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9', 'PRESTADOR'),
  (FALSE, TRUE, NULL, 'ba77ee45-82fb-5e9a-8857-8cfda0eb1fb6', '16765914-6158-5ede-b963-2ef1dfcc4a40', 'PRESTADOR'),
  (FALSE, TRUE, NULL, 'ba77ee45-82fb-5e9a-8857-8cfda0eb1fb6', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478', 'RECEPTOR'),
  (FALSE, TRUE, NULL, '1279479a-ff3f-5e26-8d40-8f8e1b7bbe0f', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd', 'RECEPTOR'),
  (FALSE, TRUE, NULL, '1279479a-ff3f-5e26-8d40-8f8e1b7bbe0f', 'aeb0917e-4e4a-57ec-9940-07ef4f467397', 'PRESTADOR'),
  (FALSE, TRUE, NULL, '9adcaa7f-53d0-5b25-ad21-1c84e4026159', '826c8b60-b075-5364-92c7-d5464df58f01', 'RECEPTOR'),
  (FALSE, TRUE, NULL, '9adcaa7f-53d0-5b25-ad21-1c84e4026159', '5d64ab15-0ee8-5e65-b2dd-3b7d7c49c22d', 'PRESTADOR'),
  (FALSE, FALSE, NULL, 'dfeb7ed0-3115-59db-8302-c9fede7988a8', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9', 'PRESTADOR'),
  (FALSE, FALSE, NULL, 'dfeb7ed0-3115-59db-8302-c9fede7988a8', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 'RECEPTOR'),
  (FALSE, TRUE, NULL, '6126976f-6205-54a3-8536-9f29b18e5bd4', '826c8b60-b075-5364-92c7-d5464df58f01', 'RECEPTOR'),
  (FALSE, TRUE, NULL, '6126976f-6205-54a3-8536-9f29b18e5bd4', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd', 'PRESTADOR')
ON CONFLICT DO NOTHING;

-- chat_participante_entity: 19 filas
INSERT INTO public."chat_participante_entity" ("idChat", "idPerfil") VALUES
  ('1480078c-6630-535b-bd3f-55667f13534c', 'aeb0917e-4e4a-57ec-9940-07ef4f467397'),
  ('1480078c-6630-535b-bd3f-55667f13534c', '5b605ec0-d034-5f52-bff7-be1ccc2b551e'),
  ('e948e387-f451-55db-bf3d-7f355d051020', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c'),
  ('e948e387-f451-55db-bf3d-7f355d051020', '4c2d11b4-6b0c-53a6-a026-93fe20993752'),
  ('e948e387-f451-55db-bf3d-7f355d051020', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478'),
  ('c22b2ff7-7037-571e-94f3-c7d77c13ead5', '4c2d11b4-6b0c-53a6-a026-93fe20993752'),
  ('c22b2ff7-7037-571e-94f3-c7d77c13ead5', '826c8b60-b075-5364-92c7-d5464df58f01'),
  ('4eccc115-eeb3-57aa-b173-58ed7eb9d280', '5b605ec0-d034-5f52-bff7-be1ccc2b551e'),
  ('4eccc115-eeb3-57aa-b173-58ed7eb9d280', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9'),
  ('f93d1b3b-eefc-553e-a35f-3d335a1cb2e6', '16765914-6158-5ede-b963-2ef1dfcc4a40'),
  ('f93d1b3b-eefc-553e-a35f-3d335a1cb2e6', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478'),
  ('4e7c35dc-1d21-52df-bc58-901a417190b1', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd'),
  ('4e7c35dc-1d21-52df-bc58-901a417190b1', 'aeb0917e-4e4a-57ec-9940-07ef4f467397'),
  ('48280b1e-4948-5af2-8e6d-296a6d9cef89', '826c8b60-b075-5364-92c7-d5464df58f01'),
  ('48280b1e-4948-5af2-8e6d-296a6d9cef89', '5d64ab15-0ee8-5e65-b2dd-3b7d7c49c22d'),
  ('bfde24a1-6302-536c-a12a-a4fa1f009a92', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9'),
  ('bfde24a1-6302-536c-a12a-a4fa1f009a92', '5b605ec0-d034-5f52-bff7-be1ccc2b551e'),
  ('87d58269-0530-54d6-ab4d-8c1ac904994c', '826c8b60-b075-5364-92c7-d5464df58f01'),
  ('87d58269-0530-54d6-ab4d-8c1ac904994c', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd')
ON CONFLICT DO NOTHING;

-- horario_disponible_entity: 12 filas
INSERT INTO public."horario_disponible_entity" ("fechaFin", "fechaInicio", "id", "idAcuerdo", "idPerfil") VALUES
  (CURRENT_DATE + INTERVAL '7 day' + INTERVAL '12 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '7 day' + INTERVAL '9 hour' + INTERVAL '0 minute', 'a3707246-d83d-540e-a98f-be574738bdcc', 'a2c04c95-f789-5650-9f31-82b144b7b926', '4c2d11b4-6b0c-53a6-a026-93fe20993752'),
  (CURRENT_DATE + INTERVAL '7 day' + INTERVAL '12 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '7 day' + INTERVAL '9 hour' + INTERVAL '0 minute', 'e0ff4e6d-11ec-5c8c-aba1-289be524bbf9', 'a2c04c95-f789-5650-9f31-82b144b7b926', '826c8b60-b075-5364-92c7-d5464df58f01'),
  (CURRENT_DATE + INTERVAL '9 day' + INTERVAL '16 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '9 day' + INTERVAL '14 hour' + INTERVAL '0 minute', '8485ec8a-a012-5762-b982-4da8482fc362', 'a8fd5cb3-bb94-58a4-9a16-512d844e387e', '5b605ec0-d034-5f52-bff7-be1ccc2b551e'),
  (CURRENT_DATE + INTERVAL '9 day' + INTERVAL '16 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '9 day' + INTERVAL '14 hour' + INTERVAL '0 minute', 'e048f802-1b2d-5c1d-802c-57d8ffe31271', 'a8fd5cb3-bb94-58a4-9a16-512d844e387e', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9'),
  (CURRENT_DATE + INTERVAL '6 day' + INTERVAL '17 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '6 day' + INTERVAL '15 hour' + INTERVAL '0 minute', '234ba394-9fdd-5892-bb0e-f6a769101ca9', 'ba77ee45-82fb-5e9a-8857-8cfda0eb1fb6', '16765914-6158-5ede-b963-2ef1dfcc4a40'),
  (CURRENT_DATE + INTERVAL '6 day' + INTERVAL '17 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '6 day' + INTERVAL '15 hour' + INTERVAL '0 minute', '21a8da99-a538-5918-8373-462f8e7ab615', 'ba77ee45-82fb-5e9a-8857-8cfda0eb1fb6', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478'),
  (CURRENT_DATE + INTERVAL '10 day' + INTERVAL '12 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '10 day' + INTERVAL '9 hour' + INTERVAL '0 minute', '94ae8584-e629-5f85-b29a-1dacc33a2a38', '1279479a-ff3f-5e26-8d40-8f8e1b7bbe0f', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd'),
  (CURRENT_DATE + INTERVAL '10 day' + INTERVAL '12 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '10 day' + INTERVAL '9 hour' + INTERVAL '0 minute', '4cfce7c6-1999-5dc8-9fd8-5e13266abe5a', '1279479a-ff3f-5e26-8d40-8f8e1b7bbe0f', 'aeb0917e-4e4a-57ec-9940-07ef4f467397'),
  (CURRENT_DATE + INTERVAL '5 day' + INTERVAL '11 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '5 day' + INTERVAL '10 hour' + INTERVAL '0 minute', '5ed4d2ee-ac71-59cd-8695-ae72377ce9ad', 'dfeb7ed0-3115-59db-8302-c9fede7988a8', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9'),
  (CURRENT_DATE + INTERVAL '5 day' + INTERVAL '11 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '5 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 'a6695c1e-acc6-577b-9f0f-62d6298c2818', 'dfeb7ed0-3115-59db-8302-c9fede7988a8', '5b605ec0-d034-5f52-bff7-be1ccc2b551e'),
  (CURRENT_DATE + INTERVAL '8 day' + INTERVAL '12 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '8 day' + INTERVAL '10 hour' + INTERVAL '0 minute', '9a9274bc-8ea3-557e-aeb4-0255343ba41a', '6126976f-6205-54a3-8536-9f29b18e5bd4', '826c8b60-b075-5364-92c7-d5464df58f01'),
  (CURRENT_DATE + INTERVAL '8 day' + INTERVAL '12 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '8 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 'c98b4890-7b35-5a44-a4e5-2dd219106bbf', '6126976f-6205-54a3-8536-9f29b18e5bd4', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd')
ON CONFLICT DO NOTHING;

-- mensaje_entity: 18 filas
INSERT INTO public."mensaje_entity" ("contenido", "fecha", "id", "idChat", "idPerfil") VALUES
  ('¡Hola! ¿Confirmamos los detalles de la ayuda?', CURRENT_DATE + INTERVAL '-8 day' + INTERVAL '9 hour' + INTERVAL '0 minute', '4685f180-bb89-5fd7-89e6-455b6a6a52c3', '1480078c-6630-535b-bd3f-55667f13534c', 'aeb0917e-4e4a-57ec-9940-07ef4f467397'),
  ('¡Claro! Podemos coordinarnos por este chat.', CURRENT_DATE + INTERVAL '-7 day' + INTERVAL '10 hour' + INTERVAL '0 minute', '32cd0852-e55e-52f0-9eab-b7e241e99daa', '1480078c-6630-535b-bd3f-55667f13534c', '5b605ec0-d034-5f52-bff7-be1ccc2b551e'),
  ('¡Hola! ¿Confirmamos los detalles de la ayuda?', CURRENT_DATE + INTERVAL '-8 day' + INTERVAL '9 hour' + INTERVAL '0 minute', 'f3f90e64-66a5-557b-b974-48ad1debac3d', 'e948e387-f451-55db-bf3d-7f355d051020', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c'),
  ('¡Claro! Podemos coordinarnos por este chat.', CURRENT_DATE + INTERVAL '-7 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 'db08d3ee-5292-5bf8-bb31-e61a656bac51', 'e948e387-f451-55db-bf3d-7f355d051020', '4c2d11b4-6b0c-53a6-a026-93fe20993752'),
  ('¡Hola! ¿Confirmamos los detalles de la ayuda?', CURRENT_DATE + INTERVAL '-8 day' + INTERVAL '9 hour' + INTERVAL '0 minute', 'bd281d89-0ebf-5666-adc2-69031bed6841', 'c22b2ff7-7037-571e-94f3-c7d77c13ead5', '4c2d11b4-6b0c-53a6-a026-93fe20993752'),
  ('¡Claro! Podemos coordinarnos por este chat.', CURRENT_DATE + INTERVAL '-7 day' + INTERVAL '10 hour' + INTERVAL '0 minute', '69442306-898b-5f0e-a669-7d56f075addd', 'c22b2ff7-7037-571e-94f3-c7d77c13ead5', '826c8b60-b075-5364-92c7-d5464df58f01'),
  ('¡Hola! ¿Confirmamos los detalles de la ayuda?', CURRENT_DATE + INTERVAL '-8 day' + INTERVAL '9 hour' + INTERVAL '0 minute', 'bc8a6dfe-f7be-542e-8e76-aaadd7f2335e', '4eccc115-eeb3-57aa-b173-58ed7eb9d280', '5b605ec0-d034-5f52-bff7-be1ccc2b551e'),
  ('¡Claro! Podemos coordinarnos por este chat.', CURRENT_DATE + INTERVAL '-7 day' + INTERVAL '10 hour' + INTERVAL '0 minute', '4a4308f1-42da-5f84-ad48-1b8de1cd9d54', '4eccc115-eeb3-57aa-b173-58ed7eb9d280', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9'),
  ('¡Hola! ¿Confirmamos los detalles de la ayuda?', CURRENT_DATE + INTERVAL '-8 day' + INTERVAL '9 hour' + INTERVAL '0 minute', 'bb0b2a3d-03e0-56d8-9cf6-f66569a96c0f', 'f93d1b3b-eefc-553e-a35f-3d335a1cb2e6', '16765914-6158-5ede-b963-2ef1dfcc4a40'),
  ('¡Claro! Podemos coordinarnos por este chat.', CURRENT_DATE + INTERVAL '-7 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 'e97a48a4-6bb5-57bc-8934-d01374068a54', 'f93d1b3b-eefc-553e-a35f-3d335a1cb2e6', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478'),
  ('¡Hola! ¿Confirmamos los detalles de la ayuda?', CURRENT_DATE + INTERVAL '-8 day' + INTERVAL '9 hour' + INTERVAL '0 minute', 'c31257e5-808c-5d00-98ad-6c92d5535bc7', '4e7c35dc-1d21-52df-bc58-901a417190b1', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd'),
  ('¡Claro! Podemos coordinarnos por este chat.', CURRENT_DATE + INTERVAL '-7 day' + INTERVAL '10 hour' + INTERVAL '0 minute', '5e80d343-2bf7-5b70-8acb-2aad6d4d49ef', '4e7c35dc-1d21-52df-bc58-901a417190b1', 'aeb0917e-4e4a-57ec-9940-07ef4f467397'),
  ('¡Hola! ¿Confirmamos los detalles de la ayuda?', CURRENT_DATE + INTERVAL '-8 day' + INTERVAL '9 hour' + INTERVAL '0 minute', '7f154767-c66f-538b-aa71-2c720a1b3c1d', '48280b1e-4948-5af2-8e6d-296a6d9cef89', '826c8b60-b075-5364-92c7-d5464df58f01'),
  ('¡Claro! Podemos coordinarnos por este chat.', CURRENT_DATE + INTERVAL '-7 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 'b592de38-59c8-5963-bde0-f556acf7bc93', '48280b1e-4948-5af2-8e6d-296a6d9cef89', '5d64ab15-0ee8-5e65-b2dd-3b7d7c49c22d'),
  ('¡Hola! ¿Confirmamos los detalles de la ayuda?', CURRENT_DATE + INTERVAL '-8 day' + INTERVAL '9 hour' + INTERVAL '0 minute', 'db2bbc14-24bf-5c96-a3f0-6508baa3260a', 'bfde24a1-6302-536c-a12a-a4fa1f009a92', 'dc9f69d2-5078-558d-9de5-1c2ffcab31c9'),
  ('¡Claro! Podemos coordinarnos por este chat.', CURRENT_DATE + INTERVAL '-7 day' + INTERVAL '10 hour' + INTERVAL '0 minute', '9b20a0d7-f997-56e4-908f-c106b6f550d8', 'bfde24a1-6302-536c-a12a-a4fa1f009a92', '5b605ec0-d034-5f52-bff7-be1ccc2b551e'),
  ('¡Hola! ¿Confirmamos los detalles de la ayuda?', CURRENT_DATE + INTERVAL '-8 day' + INTERVAL '9 hour' + INTERVAL '0 minute', '9c82dc59-33e9-5bc1-9961-384296788356', '87d58269-0530-54d6-ab4d-8c1ac904994c', '826c8b60-b075-5364-92c7-d5464df58f01'),
  ('¡Claro! Podemos coordinarnos por este chat.', CURRENT_DATE + INTERVAL '-7 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 'ca66707b-d992-5328-9273-f388218e7770', '87d58269-0530-54d6-ab4d-8c1ac904994c', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd')
ON CONFLICT DO NOTHING;

-- solicitud_modificacion_entity: 2 filas
INSERT INTO public."solicitud_modificacion_entity" ("estado", "estadoAcuerdoAnterior", "fechaCreacion", "fechaRealizacion", "horas", "id", "idAcuerdo", "idSolicitante", "tipo") VALUES
  (0, 1, CURRENT_DATE + INTERVAL '-1 day' + INTERVAL '11 hour' + INTERVAL '0 minute', CURRENT_DATE + INTERVAL '7 day' + INTERVAL '15 hour' + INTERVAL '0 minute', 3, 'bbae9e14-2636-5b8e-9f88-cb303ec89000', 'ba77ee45-82fb-5e9a-8857-8cfda0eb1fb6', '16765914-6158-5ede-b963-2ef1dfcc4a40', 'MODIFICACION'),
  (1, 1, CURRENT_DATE + INTERVAL '-2 day' + INTERVAL '10 hour' + INTERVAL '0 minute', NULL, NULL, 'de122d98-de30-5276-82bb-d4f34c90ee05', '9adcaa7f-53d0-5b25-ad21-1c84e4026159', '826c8b60-b075-5364-92c7-d5464df58f01', 'CANCELACION')
ON CONFLICT DO NOTHING;

-- aprobacion_modificacion_entity: 3 filas
INSERT INTO public."aprobacion_modificacion_entity" ("fecha", "idPerfil", "idSolicitud") VALUES
  (CURRENT_DATE + INTERVAL '-1 day' + INTERVAL '12 hour' + INTERVAL '0 minute', '16765914-6158-5ede-b963-2ef1dfcc4a40', 'bbae9e14-2636-5b8e-9f88-cb303ec89000'),
  (CURRENT_DATE + INTERVAL '-1 day' + INTERVAL '10 hour' + INTERVAL '0 minute', '826c8b60-b075-5364-92c7-d5464df58f01', 'de122d98-de30-5276-82bb-d4f34c90ee05'),
  (CURRENT_DATE + INTERVAL '-1 day' + INTERVAL '10 hour' + INTERVAL '0 minute', '5d64ab15-0ee8-5e65-b2dd-3b7d7c49c22d', 'de122d98-de30-5276-82bb-d4f34c90ee05')
ON CONFLICT DO NOTHING;

-- causa_entity: 1 filas
INSERT INTO public."causa_entity" ("descripcion", "fechaCreacion", "id", "idPerfilCreador", "idPerfilReceptor", "imagen", "nombre") VALUES
  ('Recolección y organización de material educativo.', CURRENT_DATE + INTERVAL '-12 day' + INTERVAL '9 hour' + INTERVAL '0 minute', 'aea9b1f7-6b52-5e00-af42-6c5b1a7810d1', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd', '2c458b0a-bf9b-55d1-8e3e-3e64767b84bd', 'https://picsum.photos/seed/causa-libros/640/400', 'Libros para compartir')
ON CONFLICT DO NOTHING;

-- donacion_entity: 1 filas
INSERT INTO public."donacion_entity" ("fechaDonacion", "horasDonadas", "id", "idPerfilDonante", "idPerfilReceptor", "mensaje") VALUES
  (CURRENT_DATE + INTERVAL '-4 day' + INTERVAL '13 hour' + INTERVAL '0 minute', 1, '844f6b10-287d-5e4e-9c44-08511f7db2ce', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 'Para apoyar tus actividades.')
ON CONFLICT DO NOTHING;

-- donacion_entity: 1 filas
INSERT INTO public."donacion_entity" ("fechaDonacion", "horasDonadas", "id", "idCausa", "idDepositoReceptor", "idPerfilDonante", "mensaje") VALUES
  (CURRENT_DATE + INTERVAL '-3 day' + INTERVAL '16 hour' + INTERVAL '0 minute', 2, '97febe46-43ba-5381-9be6-d840447f6347', 'aea9b1f7-6b52-5e00-af42-6c5b1a7810d1', '8ad70e94-6164-54e8-af7b-222b5e79d9a7', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 'Apoyo al fondo de tiempo para la comunidad.')
ON CONFLICT DO NOTHING;

-- transaccion_entity: 8 filas
INSERT INTO public."transaccion_entity" ("fecha", "horas", "id", "idAcuerdo", "idDonacion", "idPerfil", "saldoResultante", "tipo") VALUES
  (CURRENT_DATE + INTERVAL '-15 day' + INTERVAL '18 hour' + INTERVAL '0 minute', -2, 'b2a58e88-504f-5387-9883-fe6d08f6fe68', '9bdc34f2-55ae-53b8-8fd5-567f6acac5ea', NULL, '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 10, 'SERVICIO_RECIBIDO'),
  (CURRENT_DATE + INTERVAL '-15 day' + INTERVAL '18 hour' + INTERVAL '0 minute', 2, '064b88ea-24c1-55dc-8d84-cf201edde6a4', '9bdc34f2-55ae-53b8-8fd5-567f6acac5ea', NULL, 'aeb0917e-4e4a-57ec-9940-07ef4f467397', 10, 'SERVICIO_PRESTADO'),
  (CURRENT_DATE + INTERVAL '-12 day' + INTERVAL '18 hour' + INTERVAL '0 minute', 2, '8ba02be4-5c19-5ead-874a-fe184ea0c4bf', '23d794b9-7c21-565d-8f1d-998a412b1fff', NULL, '2667c23a-96e8-5868-bf9d-e4f5041d5c8c', 16, 'SERVICIO_PRESTADO'),
  (CURRENT_DATE + INTERVAL '-12 day' + INTERVAL '18 hour' + INTERVAL '0 minute', -2, '9acb24b9-eebc-53f3-9db2-bdd4e37c5460', '23d794b9-7c21-565d-8f1d-998a412b1fff', NULL, '4c2d11b4-6b0c-53a6-a026-93fe20993752', 10, 'SERVICIO_RECIBIDO'),
  (CURRENT_DATE + INTERVAL '-12 day' + INTERVAL '18 hour' + INTERVAL '0 minute', -2, '69d678d2-5d6a-547a-81b4-fbf84bb20ab9', '23d794b9-7c21-565d-8f1d-998a412b1fff', NULL, 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478', 7, 'SERVICIO_RECIBIDO'),
  (CURRENT_DATE + INTERVAL '-4 day' + INTERVAL '18 hour' + INTERVAL '0 minute', -1, '78d41b48-0d4f-5666-a464-f008ff3eb52c', NULL, '844f6b10-287d-5e4e-9c44-08511f7db2ce', 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478', 6, 'DONACION_ENVIADA'),
  (CURRENT_DATE + INTERVAL '-4 day' + INTERVAL '18 hour' + INTERVAL '0 minute', 1, 'df7216d4-e527-50ba-be02-289901ec557a', NULL, '844f6b10-287d-5e4e-9c44-08511f7db2ce', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 11, 'DONACION_RECIBIDA'),
  (CURRENT_DATE + INTERVAL '-3 day' + INTERVAL '18 hour' + INTERVAL '0 minute', -2, 'f36d62c3-c16c-53aa-9566-6b399f04d9f0', NULL, '97febe46-43ba-5381-9be6-d840447f6347', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 9, 'DONACION_ENVIADA')
ON CONFLICT DO NOTHING;

-- transaccion_entity: 2 filas
INSERT INTO public."transaccion_entity" ("fecha", "horas", "id", "idAcuerdo", "idDeposito", "idDonacion", "saldoResultante", "tipo") VALUES
  (CURRENT_DATE + INTERVAL '-12 day' + INTERVAL '18 hour' + INTERVAL '0 minute', 2, 'f26c10ce-074e-5b3e-b67c-8153af7bc0b5', '23d794b9-7c21-565d-8f1d-998a412b1fff', '8ad70e94-6164-54e8-af7b-222b5e79d9a7', NULL, 2, 'APORTE_FONDO'),
  (CURRENT_DATE + INTERVAL '-3 day' + INTERVAL '18 hour' + INTERVAL '0 minute', 2, '5be39cf5-5fe3-5ae3-aa19-a763be2f90da', NULL, '8ad70e94-6164-54e8-af7b-222b5e79d9a7', '97febe46-43ba-5381-9be6-d840447f6347', 4, 'DONACION_RECIBIDA')
ON CONFLICT DO NOTHING;

-- post_comunitario_entity: 2 filas
INSERT INTO public."post_comunitario_entity" ("aprobaciones", "descripcion", "fechaCreacion", "id", "idAcuerdo", "idPerfilCreador", "imagen", "likes", "publico", "titulo") VALUES
  (2, 'Gracias por compartir conocimientos en la sesión.', CURRENT_DATE + INTERVAL '-6 day' + INTERVAL '17 hour' + INTERVAL '0 minute', 'b322e631-581a-52f2-b2ca-3f9f14a9e2fb', '9bdc34f2-55ae-53b8-8fd5-567f6acac5ea', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 'https://picsum.photos/seed/pc01/640/400', 5, TRUE, 'Aprendimos Excel en comunidad'),
  (2, 'Compartimos aprendizajes y consejos útiles.', CURRENT_DATE + INTERVAL '-6 day' + INTERVAL '17 hour' + INTERVAL '0 minute', '5ff4338a-f7de-5b67-9013-f21b86db1f2d', '23d794b9-7c21-565d-8f1d-998a412b1fff', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c', 'https://picsum.photos/seed/pc02/640/400', 8, FALSE, 'Nuestro taller de hojas de vida')
ON CONFLICT DO NOTHING;

-- usuario_post_entity: 5 filas
INSERT INTO public."usuario_post_entity" ("aprobado", "idPerfil", "idPostComunitario") VALUES
  (TRUE, '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 'b322e631-581a-52f2-b2ca-3f9f14a9e2fb'),
  (TRUE, 'aeb0917e-4e4a-57ec-9940-07ef4f467397', 'b322e631-581a-52f2-b2ca-3f9f14a9e2fb'),
  (TRUE, '2667c23a-96e8-5868-bf9d-e4f5041d5c8c', '5ff4338a-f7de-5b67-9013-f21b86db1f2d'),
  (TRUE, '4c2d11b4-6b0c-53a6-a026-93fe20993752', '5ff4338a-f7de-5b67-9013-f21b86db1f2d'),
  (FALSE, 'b8fdc8d3-dbbf-5835-88e1-dfcbbbf42478', '5ff4338a-f7de-5b67-9013-f21b86db1f2d')
ON CONFLICT DO NOTHING;

-- reconocimiento_entity: 3 filas
INSERT INTO public."reconocimiento_entity" ("descripcion", "icono", "id", "nombre", "requerimiento") VALUES
  ('Reconocimiento por apoyar a otros miembros.', 'handshake', 'cc353ab3-b80b-5200-8b39-b2bb58b0b85b', 'Compañerismo', 'Ayudar en un acuerdo.'),
  ('Reconocimiento por compartir conocimiento.', 'graduation-cap', 'da1de249-ead4-5e76-aba0-f2f618fefe9e', 'Mentoría', 'Prestar un servicio académico.'),
  ('Participación destacada en actividades de comunidad.', 'heart', '84a31dad-cb2c-51b8-9a62-e216c5659254', 'Compromiso comunitario', 'Participar en actividades.')
ON CONFLICT DO NOTHING;

-- reconocimiento_otorgado_entity: 2 filas
INSERT INTO public."reconocimiento_otorgado_entity" ("fecha", "id", "idPerfilOtorgante", "idPerfilReceptor", "idPostComunitario", "idReconocimiento") VALUES
  (CURRENT_DATE + INTERVAL '-5 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 'cffa734a-ea1e-509a-b194-d2ef03a452df', '5b605ec0-d034-5f52-bff7-be1ccc2b551e', 'aeb0917e-4e4a-57ec-9940-07ef4f467397', 'b322e631-581a-52f2-b2ca-3f9f14a9e2fb', 'da1de249-ead4-5e76-aba0-f2f618fefe9e'),
  (CURRENT_DATE + INTERVAL '-5 day' + INTERVAL '10 hour' + INTERVAL '0 minute', 'f3490390-3f63-57fe-9048-36c4f4e724b0', '4c2d11b4-6b0c-53a6-a026-93fe20993752', '2667c23a-96e8-5868-bf9d-e4f5041d5c8c', '5ff4338a-f7de-5b67-9013-f21b86db1f2d', 'cc353ab3-b80b-5200-8b39-b2bb58b0b85b')
ON CONFLICT DO NOTHING;

-- Asignar horario finalmente acordado luego de insertar los horarios y acuerdos
UPDATE public."acuerdo_entity" SET "idHorarioAcordado" = 'b0b9c17a-2b90-55a6-905e-510a89c592ef' WHERE "id" = '9bdc34f2-55ae-53b8-8fd5-567f6acac5ea' AND ("idHorarioAcordado" IS NULL OR "idHorarioAcordado" = 'b0b9c17a-2b90-55a6-905e-510a89c592ef');
UPDATE public."acuerdo_entity" SET "idHorarioAcordado" = '9765f13b-cc99-5e57-ba75-8aa4a0e21481' WHERE "id" = '23d794b9-7c21-565d-8f1d-998a412b1fff' AND ("idHorarioAcordado" IS NULL OR "idHorarioAcordado" = '9765f13b-cc99-5e57-ba75-8aa4a0e21481');
UPDATE public."acuerdo_entity" SET "idHorarioAcordado" = '402b0388-fe13-5696-8a0b-c05add8d81d9' WHERE "id" = 'a2c04c95-f789-5650-9f31-82b144b7b926' AND ("idHorarioAcordado" IS NULL OR "idHorarioAcordado" = '402b0388-fe13-5696-8a0b-c05add8d81d9');
UPDATE public."acuerdo_entity" SET "idHorarioAcordado" = '0737a3de-90f6-5590-84a5-91a0615a3252' WHERE "id" = 'ba77ee45-82fb-5e9a-8857-8cfda0eb1fb6' AND ("idHorarioAcordado" IS NULL OR "idHorarioAcordado" = '0737a3de-90f6-5590-84a5-91a0615a3252');
UPDATE public."acuerdo_entity" SET "idHorarioAcordado" = '92314bfe-97b1-57f9-9ffb-9bd138998ab9' WHERE "id" = '1279479a-ff3f-5e26-8d40-8f8e1b7bbe0f' AND ("idHorarioAcordado" IS NULL OR "idHorarioAcordado" = '92314bfe-97b1-57f9-9ffb-9bd138998ab9');
UPDATE public."acuerdo_entity" SET "idHorarioAcordado" = '124f631e-7513-5f9a-bab7-b2bc12c03c87' WHERE "id" = '6126976f-6205-54a3-8536-9f29b18e5bd4' AND ("idHorarioAcordado" IS NULL OR "idHorarioAcordado" = '124f631e-7513-5f9a-bab7-b2bc12c03c87');

-- Verificaciones clave: actúan como aserciones; una falla revierte el seed.
DO $check$
BEGIN
  IF EXISTS (SELECT 1 FROM public."acuerdo_entity" a JOIN public."participante_acuerdo_entity" p ON p."idAcuerdo" = a.id GROUP BY a.id HAVING COUNT(*) FILTER (WHERE p.rol = 'PRESTADOR') > 1 AND COUNT(*) FILTER (WHERE p.rol = 'RECEPTOR') > 1) THEN
    RAISE EXCEPTION 'Error seed: acuerdo con múltiples prestadores Y múltiples receptores';
  END IF;
  IF EXISTS (SELECT 1 FROM public."post_ayuda_entity" WHERE horas <= 0 OR horas <> FLOOR(horas)) THEN
    RAISE EXCEPTION 'Error seed: horas no enteras o inválidas';
  END IF;
END
$check$;
COMMIT;
