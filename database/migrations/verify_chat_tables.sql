-- ============================================================
-- Verification Script: Check Chat Tables
-- Description: Verifies that chat_sessions and chat_messages 
--              tables were created correctly with all indexes
--              and constraints
-- ============================================================

-- Check if chat_sessions table exists
SELECT 
  'chat_sessions' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'chat_sessions'
  ) as exists;

-- Check if chat_messages table exists
SELECT 
  'chat_messages' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'chat_messages'
  ) as exists;

-- Check columns in chat_sessions
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'chat_sessions'
ORDER BY ordinal_position;

-- Check columns in chat_messages
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'chat_messages'
ORDER BY ordinal_position;

-- Check indexes on chat_sessions
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'chat_sessions'
  AND schemaname = 'public';

-- Check indexes on chat_messages
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'chat_messages'
  AND schemaname = 'public';

-- Check foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'chat_messages';

-- Check constraints on chat_messages
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'chat_messages'
  AND con.contype = 'c';

-- Summary check
SELECT 
  'Summary' as check_type,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('chat_sessions', 'chat_messages')) as tables_created,
  (SELECT COUNT(*) FROM pg_indexes 
   WHERE tablename IN ('chat_sessions', 'chat_messages')
   AND schemaname = 'public') as indexes_created,
  (SELECT COUNT(*) FROM information_schema.table_constraints 
   WHERE table_name = 'chat_messages' 
   AND constraint_type = 'FOREIGN KEY') as foreign_keys_created;
