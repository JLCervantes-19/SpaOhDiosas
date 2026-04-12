-- ============================================================
-- Migration: Create Chat Tables
-- Description: Creates chat_sessions and chat_messages tables
--              for the internal chat system
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ——— TABLE: chat_sessions ———————————————————————————————
-- Stores chat session information
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  user_name TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_activity ON chat_sessions(last_activity DESC);

-- ——— TABLE: chat_messages ———————————————————————————————
-- Stores individual messages within chat sessions
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Foreign key to chat_sessions
  CONSTRAINT fk_chat_messages_session
    FOREIGN KEY (session_id)
    REFERENCES chat_sessions(session_id)
    ON DELETE CASCADE
);

-- Indexes for faster message queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender);

-- ——— COMMENTS ————————————————————————————————————————————
COMMENT ON TABLE chat_sessions IS 'Stores chat session information for the internal chat system';
COMMENT ON TABLE chat_messages IS 'Stores individual messages within chat sessions';

COMMENT ON COLUMN chat_sessions.session_id IS 'Unique identifier for the chat session, used by frontend';
COMMENT ON COLUMN chat_sessions.user_name IS 'Name of the user chatting (collected during conversation)';
COMMENT ON COLUMN chat_sessions.last_activity IS 'Timestamp of last message in this session';
COMMENT ON COLUMN chat_sessions.metadata IS 'Additional session data (page_url, user_agent, etc.)';

COMMENT ON COLUMN chat_messages.sender IS 'Who sent the message: user or bot';
COMMENT ON COLUMN chat_messages.content IS 'The actual message text';
COMMENT ON COLUMN chat_messages.message_type IS 'Type of message: text, quick_reply, service_card, appointment_card';
COMMENT ON COLUMN chat_messages.metadata IS 'Additional message data (quick_reply_value, service_id, etc.)';

-- ——— SAMPLE DATA (Optional) ——————————————————————————————
-- Uncomment to insert sample session for testing
/*
INSERT INTO chat_sessions (session_id, user_name, metadata)
VALUES (
  uuid_generate_v4(),
  'Usuario de Prueba',
  '{"page_url": "https://serenita-spa.com", "user_agent": "Mozilla/5.0"}'::jsonb
);
*/
