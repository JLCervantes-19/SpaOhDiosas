-- ============================================================
-- QUERIES ÚTILES PARA ADMINISTRAR TU SPA EN SUPABASE
-- Copia y pega estos queries en: Supabase → SQL Editor
-- ============================================================

-- ═══════════════════════════════════════════════════════════
-- 📊 REPORTES Y ESTADÍSTICAS
-- ═══════════════════════════════════════════════════════════

-- Ver todas las citas de hoy con información completa
SELECT 
  citas.fecha,
  citas.hora_inicio,
  citas.hora_fin,
  citas.estado,
  clientes.nombre as cliente,
  clientes.telefono,
  servicios.nombre as servicio,
  servicios.precio
FROM citas
JOIN clientes ON citas.cliente_id = clientes.id
JOIN servicios ON citas.servicio_id = servicios.id
WHERE citas.fecha = CURRENT_DATE
ORDER BY citas.hora_inicio;

-- Ver citas de la semana actual
SELECT 
  citas.fecha,
  citas.hora_inicio,
  clientes.nombre as cliente,
  servicios.nombre as servicio,
  citas.estado
FROM citas
JOIN clientes ON citas.cliente_id = clientes.id
JOIN servicios ON citas.servicio_id = servicios.id
WHERE citas.fecha >= DATE_TRUNC('week', CURRENT_DATE)
  AND citas.fecha < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
ORDER BY citas.fecha, citas.hora_inicio;

-- Servicios más reservados (top 5)
SELECT 
  servicios.nombre,
  servicios.categoria,
  COUNT(citas.id) as total_reservas,
  SUM(servicios.precio) as ingresos_totales
FROM servicios
LEFT JOIN citas ON servicios.id = citas.servicio_id
WHERE citas.estado != 'cancelada' OR citas.estado IS NULL
GROUP BY servicios.id, servicios.nombre, servicios.categoria
ORDER BY total_reservas DESC
LIMIT 5;

-- Clientes más frecuentes
SELECT 
  clientes.nombre,
  clientes.telefono,
  COUNT(citas.id) as total_citas,
  MAX(citas.fecha) as ultima_visita
FROM clientes
LEFT JOIN citas ON clientes.id = citas.cliente_id
GROUP BY clientes.id, clientes.nombre, clientes.telefono
HAVING COUNT(citas.id) > 0
ORDER BY total_citas DESC
LIMIT 10;

-- Ingresos del mes actual
SELECT 
  DATE_TRUNC('day', citas.fecha) as dia,
  COUNT(citas.id) as total_citas,
  SUM(servicios.precio) as ingresos_dia
FROM citas
JOIN servicios ON citas.servicio_id = servicios.id
WHERE citas.fecha >= DATE_TRUNC('month', CURRENT_DATE)
  AND citas.estado IN ('confirmada', 'completada')
GROUP BY DATE_TRUNC('day', citas.fecha)
ORDER BY dia DESC;

-- ═══════════════════════════════════════════════════════════
-- 🔧 GESTIÓN DE CITAS
-- ═══════════════════════════════════════════════════════════

-- Confirmar una cita (ya viene confirmada por defecto)
-- Este endpoint se usa si necesitas re-confirmar
UPDATE citas 
SET estado = 'confirmada' 
WHERE id = 'ID_DE_LA_CITA';

-- Cancelar una cita
UPDATE citas 
SET estado = 'cancelada' 
WHERE id = 'ID_DE_LA_CITA';

-- Marcar que el cliente asistió
UPDATE citas 
SET estado = 'asistio' 
WHERE id = 'ID_DE_LA_CITA';

-- Marcar que el cliente NO asistió
UPDATE citas 
SET estado = 'no_asistio' 
WHERE id = 'ID_DE_LA_CITA';

-- Ver citas confirmadas (próximas)
SELECT 
  citas.id,
  citas.fecha,
  citas.hora_inicio,
  clientes.nombre,
  clientes.telefono,
  servicios.nombre as servicio
FROM citas
JOIN clientes ON citas.cliente_id = clientes.id
JOIN servicios ON citas.servicio_id = servicios.id
WHERE citas.estado = 'confirmada'
  AND citas.fecha >= CURRENT_DATE
ORDER BY citas.fecha, citas.hora_inicio;

-- Eliminar citas antiguas canceladas (más de 3 meses)
DELETE FROM citas 
WHERE estado = 'cancelada' 
  AND fecha < CURRENT_DATE - INTERVAL '3 months';

-- ═══════════════════════════════════════════════════════════
-- 👥 GESTIÓN DE CLIENTES
-- ═══════════════════════════════════════════════════════════

-- Buscar cliente por teléfono
SELECT * FROM clientes 
WHERE telefono LIKE '%3001234567%';

-- Buscar cliente por nombre
SELECT * FROM clientes 
WHERE nombre ILIKE '%maria%';

-- Ver historial completo de un cliente (reemplaza el teléfono)
SELECT 
  citas.fecha,
  citas.hora_inicio,
  servicios.nombre as servicio,
  servicios.precio,
  citas.estado
FROM citas
JOIN clientes ON citas.cliente_id = clientes.id
JOIN servicios ON citas.servicio_id = servicios.id
WHERE clientes.telefono = '3001234567'
ORDER BY citas.fecha DESC;

-- Actualizar email de un cliente
UPDATE clientes 
SET email = 'nuevo@email.com' 
WHERE telefono = '3001234567';

-- ═══════════════════════════════════════════════════════════
-- 💆 GESTIÓN DE SERVICIOS
-- ═══════════════════════════════════════════════════════════

-- Agregar un nuevo servicio
INSERT INTO servicios (nombre, descripcion, precio, duracion_min, buffer_min, imagen_url, activo, categoria)
VALUES (
  'Nombre del Servicio',
  'Descripción detallada del servicio',
  150000,
  60,
  15,
  'https://images.unsplash.com/photo-xxxxx',
  true,
  'Masaje'
);

-- Actualizar precio de un servicio
UPDATE servicios 
SET precio = 180000 
WHERE nombre = 'Masaje Relajante';

-- Desactivar un servicio (no se mostrará en la web)
UPDATE servicios 
SET activo = false 
WHERE nombre = 'Nombre del Servicio';

-- Activar un servicio
UPDATE servicios 
SET activo = true 
WHERE nombre = 'Nombre del Servicio';

-- Actualizar imagen de un servicio
UPDATE servicios 
SET imagen_url = 'https://nueva-url-de-imagen.com/imagen.jpg' 
WHERE nombre = 'Masaje Relajante';

-- Ver todos los servicios con su estado
SELECT 
  nombre,
  categoria,
  precio,
  duracion_min,
  activo,
  CASE WHEN imagen_url IS NOT NULL THEN '✓ Tiene imagen' ELSE '✗ Sin imagen' END as imagen
FROM servicios
ORDER BY categoria, nombre;

-- ═══════════════════════════════════════════════════════════
-- ⭐ GESTIÓN DE TESTIMONIOS
-- ═══════════════════════════════════════════════════════════

-- Agregar un nuevo testimonio
INSERT INTO testimonios (nombre, rating, texto, activo)
VALUES (
  'Nombre del Cliente',
  5,
  'Texto del testimonio aquí...',
  true
);

-- Desactivar un testimonio (no se mostrará en la web)
UPDATE testimonios 
SET activo = false 
WHERE nombre = 'Nombre del Cliente';

-- Ver todos los testimonios
SELECT 
  nombre,
  rating,
  LEFT(texto, 50) || '...' as preview,
  activo,
  created_at
FROM testimonios
ORDER BY created_at DESC;

-- ═══════════════════════════════════════════════════════════
-- 🧹 LIMPIEZA Y MANTENIMIENTO
-- ═══════════════════════════════════════════════════════════

-- Eliminar clientes sin citas (limpieza de datos)
DELETE FROM clientes 
WHERE id NOT IN (SELECT DISTINCT cliente_id FROM citas);

-- Ver servicios sin reservas
SELECT 
  servicios.nombre,
  servicios.categoria,
  servicios.activo
FROM servicios
LEFT JOIN citas ON servicios.id = citas.servicio_id
WHERE citas.id IS NULL;

-- Contar registros en cada tabla
SELECT 'Servicios' as tabla, COUNT(*) as total FROM servicios
UNION ALL
SELECT 'Clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'Citas', COUNT(*) FROM citas
UNION ALL
SELECT 'Testimonios', COUNT(*) FROM testimonios;

-- ═══════════════════════════════════════════════════════════
-- 📅 DISPONIBILIDAD Y HORARIOS
-- ═══════════════════════════════════════════════════════════

-- Ver horarios ocupados de un día específico
SELECT 
  hora_inicio,
  hora_fin,
  clientes.nombre,
  servicios.nombre as servicio
FROM citas
JOIN clientes ON citas.cliente_id = clientes.id
JOIN servicios ON citas.servicio_id = servicios.id
WHERE fecha = '2026-04-10'
  AND estado != 'cancelada'
ORDER BY hora_inicio;

-- Ver días con más reservas
SELECT 
  fecha,
  COUNT(*) as total_citas,
  STRING_AGG(DISTINCT servicios.nombre, ', ') as servicios
FROM citas
JOIN servicios ON citas.servicio_id = servicios.id
WHERE estado != 'cancelada'
GROUP BY fecha
ORDER BY total_citas DESC
LIMIT 10;

-- ═══════════════════════════════════════════════════════════
-- 🔍 BÚSQUEDAS AVANZADAS
-- ═══════════════════════════════════════════════════════════

-- Buscar citas por rango de fechas
SELECT 
  citas.fecha,
  citas.hora_inicio,
  clientes.nombre,
  servicios.nombre as servicio,
  citas.estado
FROM citas
JOIN clientes ON citas.cliente_id = clientes.id
JOIN servicios ON citas.servicio_id = servicios.id
WHERE citas.fecha BETWEEN '2026-04-01' AND '2026-04-30'
ORDER BY citas.fecha, citas.hora_inicio;

-- Buscar por origen de reserva
SELECT 
  origen,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
FROM citas
GROUP BY origen
ORDER BY total DESC;

-- Ver clientes que no han vuelto en más de 2 meses
SELECT 
  clientes.nombre,
  clientes.telefono,
  MAX(citas.fecha) as ultima_visita,
  COUNT(citas.id) as total_visitas
FROM clientes
JOIN citas ON clientes.id = citas.cliente_id
GROUP BY clientes.id, clientes.nombre, clientes.telefono
HAVING MAX(citas.fecha) < CURRENT_DATE - INTERVAL '2 months'
ORDER BY ultima_visita DESC;
