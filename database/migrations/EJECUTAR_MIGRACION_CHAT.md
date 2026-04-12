# 📋 Guía: Ejecutar Migración de Tablas de Chat

## Objetivo

Ejecutar la migración `001_create_chat_tables.sql` en Supabase para crear las tablas `chat_sessions` y `chat_messages` necesarias para el sistema de chat interno.

## Requisitos Previos

- Acceso al dashboard de Supabase
- Variables de entorno configuradas en `.env` (SUPABASE_URL y SUPABASE_ANON_KEY)
- Node.js instalado (para verificación automática)

---

## 📝 Opción 1: Ejecutar desde Supabase Dashboard (Recomendado)

### Paso 1: Acceder al SQL Editor

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **SQL Editor**

### Paso 2: Ejecutar la Migración

1. Haz clic en **New Query** (o presiona `Ctrl/Cmd + Enter`)
2. Copia todo el contenido del archivo `database/migrations/001_create_chat_tables.sql`
3. Pega el contenido en el editor SQL
4. Haz clic en **Run** (o presiona `Ctrl/Cmd + Enter`)

### Paso 3: Verificar Ejecución

Deberías ver un mensaje de éxito similar a:

```
Success. No rows returned
```

Esto es normal porque el script crea tablas pero no retorna datos.

---

## 🔍 Opción 2: Verificación Automática con Script Node.js

Después de ejecutar la migración en Supabase, puedes verificar que todo se creó correctamente:

### Ejecutar Script de Verificación

```bash
node database/migrations/verify_chat_tables.js
```

### Salida Esperada

Si todo está correcto, verás:

```
🔍 Verificando tablas de chat en Supabase...

✓ Verificando tabla chat_sessions...
✅ Tabla chat_sessions existe y es accesible

✓ Verificando tabla chat_messages...
✅ Tabla chat_messages existe y es accesible

✓ Verificando creación de sesión de prueba...
✅ Sesión de prueba creada correctamente
   Session ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   User Name: Test User

✓ Verificando creación de mensaje de prueba...
✅ Mensaje de prueba creado correctamente
   Message ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Sender: user
   Content: Test message

✓ Verificando constraint de foreign key...
✅ Foreign key constraint funciona correctamente

✓ Verificando índices...
✅ Índice en session_id funciona correctamente

✓ Verificando constraint de sender...
✅ Constraint de sender funciona correctamente

✓ Limpiando datos de prueba...
✅ Datos de prueba eliminados (cascade delete funcionó)

═══════════════════════════════════════════════════════
✅ VERIFICACIÓN COMPLETA - TODAS LAS PRUEBAS PASARON
═══════════════════════════════════════════════════════

Tablas verificadas:
  ✓ chat_sessions - existe y funciona
  ✓ chat_messages - existe y funciona

Características verificadas:
  ✓ Creación de sesiones
  ✓ Creación de mensajes
  ✓ Foreign key constraint (session_id)
  ✓ Índice en session_id
  ✓ Constraint de sender (user/bot)
  ✓ Cascade delete

🎉 Las tablas de chat están listas para usar!
```

---

## 🔍 Opción 3: Verificación Manual con SQL

Si prefieres verificar manualmente, ejecuta este script en el SQL Editor de Supabase:

```sql
-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('chat_sessions', 'chat_messages');

-- Verificar columnas de chat_sessions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_sessions'
ORDER BY ordinal_position;

-- Verificar columnas de chat_messages
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_messages'
ORDER BY ordinal_position;

-- Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('chat_sessions', 'chat_messages')
  AND schemaname = 'public';

-- Verificar foreign keys
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'chat_messages';
```

### Resultados Esperados

**Tablas creadas:**
- `chat_sessions`
- `chat_messages`

**Columnas en chat_sessions:**
- `id` (uuid, primary key)
- `session_id` (uuid, unique, not null)
- `user_name` (text, nullable)
- `started_at` (timestamptz)
- `last_activity` (timestamptz)
- `metadata` (jsonb)
- `created_at` (timestamptz)

**Columnas en chat_messages:**
- `id` (uuid, primary key)
- `session_id` (uuid, not null, foreign key)
- `sender` (text, not null, check constraint)
- `content` (text, not null)
- `message_type` (text)
- `created_at` (timestamptz)
- `metadata` (jsonb)

**Índices creados:**
- `idx_chat_sessions_session_id` en `chat_sessions(session_id)`
- `idx_chat_sessions_last_activity` en `chat_sessions(last_activity DESC)`
- `idx_chat_messages_session_id` en `chat_messages(session_id)`
- `idx_chat_messages_created_at` en `chat_messages(created_at DESC)`
- `idx_chat_messages_sender` en `chat_messages(sender)`

**Constraints:**
- Foreign key: `chat_messages.session_id` → `chat_sessions.session_id` (ON DELETE CASCADE)
- Check constraint: `sender IN ('user', 'bot')`

---

## ✅ Checklist de Verificación

Marca cada item después de verificarlo:

- [ ] Tabla `chat_sessions` existe en Supabase
- [ ] Tabla `chat_messages` existe en Supabase
- [ ] Índice `idx_chat_sessions_session_id` está activo
- [ ] Índice `idx_chat_sessions_last_activity` está activo
- [ ] Índice `idx_chat_messages_session_id` está activo
- [ ] Índice `idx_chat_messages_created_at` está activo
- [ ] Índice `idx_chat_messages_sender` está activo
- [ ] Foreign key constraint `fk_chat_messages_session` está activo
- [ ] Check constraint en `sender` está activo (solo permite 'user' o 'bot')
- [ ] Puedes insertar una sesión de prueba
- [ ] Puedes insertar un mensaje de prueba
- [ ] El cascade delete funciona (eliminar sesión elimina mensajes)

---

## 🚨 Solución de Problemas

### Error: "relation already exists"

Si ves este error, significa que las tablas ya existen. Puedes:

1. **Opción A:** Ignorar el error (el script usa `IF NOT EXISTS`)
2. **Opción B:** Eliminar las tablas existentes y volver a ejecutar:

```sql
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
```

Luego ejecuta la migración nuevamente.

### Error: "permission denied"

Verifica que estás usando una cuenta con permisos de administrador en Supabase.

### Error: "extension uuid-ossp does not exist"

El script debería crear la extensión automáticamente. Si falla, ejecuta manualmente:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Script de verificación falla con error de conexión

Verifica que:
1. El archivo `.env` existe en la raíz del proyecto
2. Las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY` están correctamente configuradas
3. Tienes conexión a internet
4. Las credenciales de Supabase son válidas

---

## 📊 Estructura de las Tablas

### chat_sessions

Almacena información de cada sesión de chat:

```
┌─────────────────┬──────────────┬──────────┬─────────────────────┐
│ Campo           │ Tipo         │ Nullable │ Default             │
├─────────────────┼──────────────┼──────────┼─────────────────────┤
│ id              │ UUID         │ NO       │ uuid_generate_v4()  │
│ session_id      │ UUID         │ NO       │ uuid_generate_v4()  │
│ user_name       │ TEXT         │ YES      │ NULL                │
│ started_at      │ TIMESTAMPTZ  │ NO       │ NOW()               │
│ last_activity   │ TIMESTAMPTZ  │ NO       │ NOW()               │
│ metadata        │ JSONB        │ NO       │ '{}'::jsonb         │
│ created_at      │ TIMESTAMPTZ  │ NO       │ NOW()               │
└─────────────────┴──────────────┴──────────┴─────────────────────┘
```

### chat_messages

Almacena cada mensaje dentro de una sesión:

```
┌─────────────────┬──────────────┬──────────┬─────────────────────┐
│ Campo           │ Tipo         │ Nullable │ Default             │
├─────────────────┼──────────────┼──────────┼─────────────────────┤
│ id              │ UUID         │ NO       │ uuid_generate_v4()  │
│ session_id      │ UUID         │ NO       │ (foreign key)       │
│ sender          │ TEXT         │ NO       │ NULL                │
│ content         │ TEXT         │ NO       │ NULL                │
│ message_type    │ TEXT         │ YES      │ 'text'              │
│ created_at      │ TIMESTAMPTZ  │ NO       │ NOW()               │
│ metadata        │ JSONB        │ NO       │ '{}'::jsonb         │
└─────────────────┴──────────────┴──────────┴─────────────────────┘
```

---

## 🎯 Próximos Pasos

Una vez que hayas verificado que las tablas están creadas correctamente:

1. ✅ Marca la tarea 1.1 como completada
2. ➡️ Continúa con la tarea 1.2: Ejecutar migración para agregar campo documento a clientes
3. 🚀 Luego procede con la implementación del backend (Fase 2)

---

## 📞 Soporte

Si encuentras problemas durante la ejecución de la migración:

1. Revisa los logs de error en Supabase SQL Editor
2. Ejecuta el script de verificación para diagnóstico detallado
3. Consulta la documentación de Supabase: https://supabase.com/docs
4. Revisa el archivo `design.md` para entender la estructura de datos

---

**Última actualización:** 2024  
**Versión:** 1.0  
**Relacionado con:** Requirements 11.1, 11.2, 11.3, 11.4
