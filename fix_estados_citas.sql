-- ============================================================
-- Script para configurar los estados correctos en la tabla citas
-- Ejecuta esto en: Supabase → SQL Editor
-- ============================================================

-- 1. Eliminar constraint antiguo
ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_estado_check;
ALTER TABLE citas DROP CONSTRAINT IF EXISTS estado_check;

-- 2. Crear nuevo constraint con los estados correctos
ALTER TABLE citas 
ADD CONSTRAINT estado_check 
CHECK (estado IN ('confirmada', 'cancelada', 'asistio', 'no_asistio'));

-- 3. Actualizar registros existentes si los hay
-- Convertir 'pendiente' a 'confirmada' (si existen)
UPDATE citas SET estado = 'confirmada' WHERE estado = 'pendiente';
UPDATE citas SET estado = 'confirmada' WHERE estado = 'completada';

-- 4. Verificar que funcionó
SELECT 'Estados configurados correctamente ✓' as resultado;

-- 5. Ver estados actuales en la tabla
SELECT estado, COUNT(*) as total 
FROM citas 
GROUP BY estado;
