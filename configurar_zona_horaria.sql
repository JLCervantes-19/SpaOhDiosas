-- ============================================================
-- Configurar Zona Horaria de Colombia en Supabase
-- Ejecuta esto en: Supabase → SQL Editor
-- ============================================================

-- 1. Configurar zona horaria de la base de datos a Colombia
ALTER DATABASE postgres SET timezone TO 'America/Bogota';

-- 2. Configurar zona horaria de la sesión actual
SET timezone = 'America/Bogota';

-- 3. Verificar que la zona horaria está configurada
SHOW timezone;

-- 4. Ver la hora actual en Colombia
SELECT NOW() as hora_actual_colombia;

-- 5. Actualizar las tablas para usar timestamptz (timestamp with timezone)
-- Esto asegura que las fechas se guarden con zona horaria

-- Para la tabla citas
ALTER TABLE citas 
ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'America/Bogota';

-- Para la tabla clientes
ALTER TABLE clientes 
ALTER COLUMN fecha_registro TYPE timestamptz USING fecha_registro AT TIME ZONE 'America/Bogota';

-- Para la tabla testimonios
ALTER TABLE testimonios 
ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'America/Bogota';

-- 6. Configurar valores por defecto con zona horaria de Colombia
ALTER TABLE citas 
ALTER COLUMN created_at SET DEFAULT (NOW() AT TIME ZONE 'America/Bogota');

ALTER TABLE clientes 
ALTER COLUMN fecha_registro SET DEFAULT (NOW() AT TIME ZONE 'America/Bogota');

ALTER TABLE testimonios 
ALTER COLUMN created_at SET DEFAULT (NOW() AT TIME ZONE 'America/Bogota');

-- 7. Verificar configuración
SELECT 
  'Zona horaria configurada correctamente ✓' as resultado,
  NOW() as hora_actual,
  NOW() AT TIME ZONE 'America/Bogota' as hora_colombia;
