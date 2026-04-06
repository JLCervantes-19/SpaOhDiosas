-- ============================================================
-- Script para arreglar el constraint del campo estado en citas
-- Ejecuta esto en: Supabase → SQL Editor
-- ============================================================

-- 1. Ver el constraint actual (si existe)
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'citas'::regclass 
  AND conname LIKE '%estado%';

-- 2. Eliminar el constraint antiguo si existe
ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_estado_check;

-- 3. Crear nuevo constraint con los valores correctos
ALTER TABLE citas 
ADD CONSTRAINT citas_estado_check 
CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada'));

-- 4. Verificar que funcionó
SELECT 'Constraint actualizado correctamente' as resultado;

-- 5. Ver todos los estados actuales en la tabla
SELECT DISTINCT estado FROM citas;
