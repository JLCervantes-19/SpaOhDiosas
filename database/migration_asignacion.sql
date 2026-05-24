-- ============================================================
-- MIGRACIÓN: Sistema de asignación automática de empleadas
-- Ejecutar en Supabase SQL Editor
-- Proyecto: whouejjrpjcvoueyajbu.supabase.co
-- ============================================================

-- ============================================================
-- 1. Columna empleado_id en citas (si no existe)
-- ============================================================
ALTER TABLE citas
  ADD COLUMN IF NOT EXISTS empleado_id UUID REFERENCES empleados(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_citas_empleado_id ON citas(empleado_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha       ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_emp_fecha   ON citas(empleado_id, fecha);

-- ============================================================
-- 2. Tabla empleado_servicios (pivote empleada ↔ servicio)
-- ============================================================
CREATE TABLE IF NOT EXISTS empleado_servicios (
  empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  PRIMARY KEY (empleado_id, servicio_id)
);

ALTER TABLE empleado_servicios ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'empleado_servicios' AND policyname = 'lectura_publica_es'
  ) THEN
    CREATE POLICY "lectura_publica_es" ON empleado_servicios
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'empleado_servicios' AND policyname = 'admin_full_es'
  ) THEN
    CREATE POLICY "admin_full_es" ON empleado_servicios
      FOR ALL USING (is_admin()) WITH CHECK (is_admin());
  END IF;
END $$;

-- ============================================================
-- 3. Columnas duracion_min y buffer_min en servicios
-- ============================================================
ALTER TABLE servicios
  ADD COLUMN IF NOT EXISTS duracion_min INTEGER DEFAULT 60,
  ADD COLUMN IF NOT EXISTS buffer_min   INTEGER DEFAULT 10;

-- ============================================================
-- 4. Habilitar Realtime en tabla citas (para staff-app)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE citas;

-- ============================================================
-- Verificación (ejecuta por separado para confirmar):
-- ============================================================

-- Empleadas con sus servicios asignados:
-- SELECT e.nombre, e.apellido, array_agg(s.nombre) AS servicios
-- FROM empleados e
-- JOIN empleado_servicios es ON es.empleado_id = e.id
-- JOIN servicios s ON s.id = es.servicio_id
-- GROUP BY e.id, e.nombre, e.apellido;

-- Citas sin empleada asignada:
-- SELECT count(*) AS sin_asignar FROM citas WHERE empleado_id IS NULL;
