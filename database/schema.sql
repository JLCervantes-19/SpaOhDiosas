-- ============================================================
-- SCHEMA ACTUAL — Spa Oh Diosas
-- Refleja el estado real de la base de datos en Supabase.
-- Proyecto: whouejjrpjcvoueyajbu.supabase.co
-- Última actualización: 2026-05-10
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SERVICIOS
-- Catálogo de servicios ofrecidos por el spa.
-- ============================================================
CREATE TABLE servicios (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  precio      NUMERIC,
  duracion_min  INTEGER,
  buffer_min    INTEGER,
  imagen_url  TEXT,
  activo      BOOLEAN DEFAULT true,
  categoria   TEXT
);

-- ============================================================
-- EMPLEADOS
-- Profesionales que prestan los servicios.
-- ============================================================
CREATE TABLE empleados (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre        TEXT NOT NULL,
  telefono      TEXT,
  email         TEXT,
  especialidades TEXT[],
  activo        BOOLEAN DEFAULT true,
  color         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CLIENTES
-- Clientes registrados en el sistema.
-- ============================================================
CREATE TABLE clientes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre          TEXT NOT NULL,
  telefono        TEXT,
  email           TEXT,
  documento       TEXT,
  fecha_nacimiento DATE,
  alergias        TEXT,
  notas           TEXT,
  origen          TEXT,
  fecha_registro  TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'America/Bogota')
);

-- ============================================================
-- CITAS
-- Reservas de servicios realizadas por los clientes.
-- ============================================================
CREATE TABLE citas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id    UUID REFERENCES clientes(id),
  servicio_id   UUID REFERENCES servicios(id),
  empleado_id   UUID REFERENCES empleados(id),
  fecha         DATE,
  hora_inicio   TIME,
  hora_fin      TIME,
  duracion_total INTEGER,
  estado        TEXT,
  origen        TEXT,
  notas         TEXT,
  created_at    TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'America/Bogota')
);

-- ============================================================
-- PAGOS
-- Registro de pagos asociados a citas (pago manual).
-- ============================================================
CREATE TABLE pagos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cita_id     UUID REFERENCES citas(id),
  cliente_id  UUID REFERENCES clientes(id),
  monto       NUMERIC,
  metodo_pago TEXT,
  estado      TEXT,
  fecha_pago  TIMESTAMP,
  notas       TEXT
);

-- ============================================================
-- TESTIMONIOS
-- Reseñas y testimonios publicados en la web.
-- ============================================================
CREATE TABLE testimonios (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      TEXT NOT NULL,
  texto       TEXT NOT NULL,
  servicio_id UUID REFERENCES servicios(id),
  rating      INTEGER,
  activo      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'America/Bogota')
);

-- ============================================================
-- DISPONIBILIDAD
-- Horarios de atención por día de la semana (0=dom … 6=sáb).
-- ============================================================
CREATE TABLE disponibilidad (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dia_semana  INTEGER,
  hora_inicio TIME,
  hora_fin    TIME,
  activo      BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT now()
);

-- ============================================================
-- BLOQUEOS
-- Fechas u horas bloqueadas para no recibir citas.
-- ============================================================
CREATE TABLE bloqueos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha       DATE,
  hora_inicio TIME,
  hora_fin    TIME,
  motivo      TEXT
);

-- ============================================================
-- CONFIGURACION
-- Datos del negocio: nombre, contacto, redes sociales.
-- ============================================================
CREATE TABLE configuracion (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_negocio  TEXT NOT NULL,
  slogan          TEXT,
  telefono        TEXT,
  email           TEXT,
  direccion       TEXT,
  whatsapp        TEXT,
  instagram       TEXT,
  facebook        TEXT,
  logo_url        TEXT,
  descripcion     TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INTERACCIONES
-- Log de interacciones con clientes (llamadas, mensajes, etc).
-- ============================================================
CREATE TABLE interacciones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id  UUID REFERENCES clientes(id),
  tipo        TEXT,
  canal       TEXT,
  estado      TEXT,
  contenido   TEXT,
  notas       TEXT,
  fecha_envio TIMESTAMP
);

-- ============================================================
-- MENSAJES_WHATSAPP
-- Registro de mensajes enviados vía WhatsApp a los clientes.
-- ============================================================
CREATE TABLE mensajes_whatsapp (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  UUID,
  cita_id     UUID,
  telefono    TEXT,
  tipo        TEXT,
  estado      TEXT,
  mensaje     TEXT,
  fecha_envio TIMESTAMP DEFAULT now()
);

-- ============================================================
-- CHAT_SESSIONS
-- Sesiones del chat web integrado con N8N.
-- ============================================================
CREATE TABLE chat_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  user_name     TEXT,
  started_at    TIMESTAMPTZ DEFAULT now(),
  last_activity TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_sessions_session_id   ON chat_sessions(session_id);
CREATE INDEX idx_chat_sessions_last_activity ON chat_sessions(last_activity DESC);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insertar chat sessions" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Leer chat sessions"     ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "Actualizar chat sessions" ON chat_sessions FOR UPDATE USING (true);
