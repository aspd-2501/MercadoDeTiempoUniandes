-- Verificación de población; en un entorno VACÍO deben aparecer los totales indicados.
SELECT 'usuarios' AS elemento, COUNT(*) AS cantidad FROM public.usuario_entity
UNION ALL SELECT 'perfiles', COUNT(*) FROM public.perfil_miembro_entity
UNION ALL SELECT 'categorias', COUNT(*) FROM public.categoria_entity
UNION ALL SELECT 'servicios', COUNT(*) FROM public.servicio_ofrecido_entity
UNION ALL SELECT 'publicaciones de ayuda', COUNT(*) FROM public.post_ayuda_entity
UNION ALL SELECT 'acuerdos', COUNT(*) FROM public.acuerdo_entity
UNION ALL SELECT 'participaciones', COUNT(*) FROM public.participante_acuerdo_entity
UNION ALL SELECT 'horarios', COUNT(*) FROM public.horario_disponible_entity
UNION ALL SELECT 'transacciones', COUNT(*) FROM public.transaccion_entity
UNION ALL SELECT 'mensajes', COUNT(*) FROM public.mensaje_entity
UNION ALL SELECT 'organizaciones', COUNT(*) FROM public.perfil_organizacion_entity
ORDER BY elemento;

-- Saldos demo (la historia es parcial y parte de saldos iniciales simulados).
SELECT nombre, saldo FROM public.perfil_miembro_entity ORDER BY nombre;
SELECT saldo AS fondo_comunitario FROM public.deposito_horas_entity;

-- Estados: 0 en creación, 1 acordado, 2 realizado, 3 en modificación, 4 cancelado.
SELECT estado, COUNT(*) AS acuerdos FROM public.acuerdo_entity GROUP BY estado ORDER BY estado;

-- Verificación esencial de integridad: debe devolver cero filas.
SELECT p."idAcuerdo"
FROM public.participante_acuerdo_entity p
GROUP BY p."idAcuerdo"
HAVING COUNT(*) FILTER (WHERE rol = 'PRESTADOR') > 1
   AND COUNT(*) FILTER (WHERE rol = 'RECEPTOR') > 1;
