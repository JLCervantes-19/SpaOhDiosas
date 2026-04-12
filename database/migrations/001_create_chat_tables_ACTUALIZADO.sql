-- ============================================================
-- schema-chat.sql — Tabla de sesiones del chat web
-- ACTUALIZADO para coincidir con el flujo de N8N
-- Ejecuta en: Supabase → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ——— TABLE: chat_sessions ———————————————————————————————
-- Guarda cada intercambio del chat web para análisis
CREATE TABLE IF NOT EXISTS chat_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       TEXT NOT NULL,        -- ID único de la sesión del navegador
  cliente_id       UUID REFERENCES clientes(id) ON DELETE SET NULL,
  mensaje_usuario  TEXT,
  respuesta_bot    TEXT,
  canal            TEXT DEFAULT 'web_chat',
  step             TEXT,                 -- estado conversacional al momento
  fecha            TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_chat_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_fecha ON chat_sessions(fecha);
CREATE INDEX IF NOT EXISTS idx_chat_cliente_id ON chat_sessions(cliente_id);

-- ——— TABLE: chat_messages (OPCIONAL - para historial detallado) ———
-- Si quieres mantener un historial más detallado de cada mensaje
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ——— RLS (Row Level Security) ————————————————————————————
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insertar chat sessions"
  ON chat_sessions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Leer chat sessions"
  ON chat_sessions FOR SELECT 
  USING (true);

-- RLS para chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insertar chat messages"
  ON chat_messages FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Leer chat messages"
  ON chat_messages FOR SELECT 
  USING (true);

-- ——— VISTA ÚTIL ——————————————————————————————————————————
-- Vista para admin: últimas conversaciones con nombre del cliente
CREATE OR REPLACE VIEW v_chat_recientes AS
SELECT
  cs.session_id,
  cs.mensaje_usuario,
  cs.respuesta_bot,
  cs.canal,
  cs.step,
  cs.fecha,
  c.nombre AS cliente_nombre,
  c.telefono,
  c.documento
FROM chat_sessions cs
LEFT JOIN clientes c ON c.id = cs.cliente_id
ORDER BY cs.fecha DESC
LIMIT 200;

-- ——— COMMENTS ————————————————————————————————————————————
COMMENT ON TABLE chat_sessions IS 'Sesiones del chat web integrado con N8N';
COMMENT ON TABLE chat_messages IS 'Historial detallado de mensajes del chat';
COMMENT ON VIEW v_chat_recientes IS 'Vista de las últimas 200 conversaciones con datos del cliente';

COMMENT ON COLUMN chat_sessions.session_id IS 'ID único de la sesión del navegador';
COMMENT ON COLUMN chat_sessions.cliente_id IS 'Referencia al cliente (si se identificó)';
COMMENT ON COLUMN chat_sessions.mensaje_usuario IS 'Último mensaje del usuario';
COMMENT ON COLUMN chat_sessions.respuesta_bot IS 'Última respuesta del bot';
COMMENT ON COLUMN chat_sessions.canal IS 'Canal de origen (web_chat, whatsapp, etc)';
COMMENT ON COLUMN chat_sessions.step IS 'Estado conversacional (inicio, consultar_citas, etc)';
