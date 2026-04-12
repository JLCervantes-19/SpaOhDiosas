# ✅ Tarea 1.1: Ejecutar Migración para Crear Tablas de Chat

## 📋 Resumen de la Tarea

**Objetivo:** Ejecutar la migración `001_create_chat_tables.sql` en Supabase para crear las tablas necesarias para el sistema de chat interno.

**Requisitos relacionados:** 11.1, 11.2, 11.3, 11.4

**Estado:** ⏳ Pendiente de ejecución manual en Supabase

---

## 🎯 Qué se va a crear

Esta migración crea dos tablas principales:

### 1. `chat_sessions`
Almacena información de cada sesión de chat (una sesión = una conversación completa)

**Campos:**
- `id`: Identificador único interno (UUID)
- `session_id`: Identificador de sesión usado por el frontend (UUID)
- `user_name`: Nombre del usuario (se recolecta durante la conversación)
- `started_at`: Fecha/hora de inicio de la sesión
- `last_activity`: Fecha/hora de la última actividad
- `metadata`: Datos adicionales en formato JSON (URL de página, user agent, etc.)
- `created_at`: Fecha/hora de creación del registro

**Índices:**
- `idx_chat_sessions_session_id`: Para búsquedas rápidas por session_id
- `idx_chat_sessions_last_activity`: Para ordenar por actividad reciente

### 2. `chat_messages`
Almacena cada mensaje individual dentro de una sesión

**Campos:**
- `id`: Identificador único del mensaje (UUID)
- `session_id`: Referencia a la sesión (foreign key)
- `sender`: Quién envió el mensaje ('user' o 'bot')
- `content`: Contenido del mensaje
- `message_type`: Tipo de mensaje ('text', 'quick_reply', 'service_card', 'appointment_card')
- `created_at`: Fecha/hora del mensaje
- `metadata`: Datos adicionales en formato JSON

**Índices:**
- `idx_chat_messages_session_id`: Para buscar mensajes de una sesión
- `idx_chat_messages_created_at`: Para ordenar mensajes cronológicamente
- `idx_chat_messages_sender`: Para filtrar por remitente

**Constraints:**
- Foreign key: `session_id` → `chat_sessions.session_id` (ON DELETE CASCADE)
- Check constraint: `sender` solo puede ser 'user' o 'bot'

---

## 🚀 Pasos para Ejecutar la Migración

### Paso 1: Verificar Conexión a Supabase

Antes de ejecutar la migración, verifica que tu conexión a Supabase funciona:

```bash
node database/migrations/test_connection.js
```

**Salida esperada:**
```
🔌 Probando conexión a Supabase...

✓ Variables de entorno encontradas:
  SUPABASE_URL: https://xxx.supabase.co
  SUPABASE_ANON_KEY: eyJ...

✓ Intentando consulta de prueba...
✅ Conexión exitosa a Supabase!

═══════════════════════════════════════════════════════
✅ CONEXIÓN VERIFICADA - LISTO PARA EJECUTAR MIGRACIONES
═══════════════════════════════════════════════════════
```

Si ves errores, verifica tu archivo `.env` en la raíz del proyecto.

---

### Paso 2: Ejecutar la Migración en Supabase

**⚠️ IMPORTANTE:** Esta migración debe ejecutarse manualmente en el dashboard de Supabase porque requiere permisos de administrador para crear tablas.

#### Instrucciones:

1. **Abre Supabase Dashboard**
   - Ve a: https://app.supabase.com
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en **SQL Editor**
   - Haz clic en **New Query**

3. **Copia y Pega la Migración**
   - Abre el archivo: `database/migrations/001_create_chat_tables.sql`
   - Copia TODO el contenido
   - Pégalo en el editor SQL de Supabase

4. **Ejecuta la Migración**
   - Haz clic en el botón **Run** (o presiona `Ctrl/Cmd + Enter`)
   - Espera a que termine la ejecución

5. **Verifica el Resultado**
   - Deberías ver: `Success. No rows returned`
   - Esto es normal (el script crea tablas pero no retorna datos)

---

### Paso 3: Verificar que las Tablas se Crearon

Después de ejecutar la migración, verifica que todo se creó correctamente:

```bash
node database/migrations/verify_chat_tables.js
```

**Salida esperada:**
```
🔍 Verificando tablas de chat en Supabase...

✓ Verificando tabla chat_sessions...
✅ Tabla chat_sessions existe y es accesible

✓ Verificando tabla chat_messages...
✅ Tabla chat_messages existe y es accesible

✓ Verificando creación de sesión de prueba...
✅ Sesión de prueba creada correctamente

✓ Verificando creación de mensaje de prueba...
✅ Mensaje de prueba creado correctamente

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

🎉 Las tablas de chat están listas para usar!
```

---

## ✅ Checklist de Verificación

Marca cada item después de completarlo:

- [ ] **Paso 1:** Ejecuté `test_connection.js` y la conexión funciona
- [ ] **Paso 2:** Abrí Supabase Dashboard → SQL Editor
- [ ] **Paso 3:** Copié el contenido de `001_create_chat_tables.sql`
- [ ] **Paso 4:** Pegué y ejecuté el script en Supabase
- [ ] **Paso 5:** Vi el mensaje "Success. No rows returned"
- [ ] **Paso 6:** Ejecuté `verify_chat_tables.js` y todas las pruebas pasaron
- [ ] **Paso 7:** Verifiqué que la tabla `chat_sessions` existe
- [ ] **Paso 8:** Verifiqué que la tabla `chat_messages` existe
- [ ] **Paso 9:** Verifiqué que los índices están activos
- [ ] **Paso 10:** Verifiqué que los constraints están activos

---

## 🔍 Verificación Manual (Opcional)

Si prefieres verificar manualmente en Supabase:

1. Ve a **Table Editor** en Supabase Dashboard
2. Deberías ver dos nuevas tablas:
   - `chat_sessions`
   - `chat_messages`
3. Haz clic en cada tabla para ver su estructura
4. Verifica que tienen las columnas mencionadas arriba

O ejecuta este SQL en el SQL Editor:

```sql
-- Ver todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'chat_%';

-- Ver columnas de chat_sessions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_sessions'
ORDER BY ordinal_position;

-- Ver columnas de chat_messages
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_messages'
ORDER BY ordinal_position;
```

---

## 🚨 Solución de Problemas

### ❌ Error: "relation already exists"

**Causa:** Las tablas ya existen en la base de datos.

**Solución:** 
- Si las tablas ya existen, la migración es exitosa (el script usa `IF NOT EXISTS`)
- Si quieres recrearlas, primero elimínalas:

```sql
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
```

Luego ejecuta la migración nuevamente.

---

### ❌ Error: "permission denied"

**Causa:** No tienes permisos de administrador en Supabase.

**Solución:**
- Verifica que estás usando la cuenta correcta
- Asegúrate de tener rol de Owner o Admin en el proyecto

---

### ❌ Error en verify_chat_tables.js: "relation does not exist"

**Causa:** La migración no se ejecutó correctamente en Supabase.

**Solución:**
1. Ve a Supabase Dashboard → Table Editor
2. Verifica si las tablas `chat_sessions` y `chat_messages` existen
3. Si no existen, ejecuta la migración nuevamente
4. Si existen pero el script falla, verifica las credenciales en `.env`

---

### ❌ Error: "SUPABASE_URL no está configurada"

**Causa:** El archivo `.env` no existe o no tiene las variables necesarias.

**Solución:**
1. Crea un archivo `.env` en la raíz del proyecto
2. Agrega estas líneas:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-aqui
```

3. Obtén las credenciales desde Supabase Dashboard → Settings → API

---

## 📊 Archivos Creados

Como parte de esta tarea, se crearon los siguientes archivos de soporte:

```
database/migrations/
├── 001_create_chat_tables.sql          ← Migración principal
├── verify_chat_tables.sql              ← Verificación SQL manual
├── verify_chat_tables.js               ← Verificación automática
├── test_connection.js                  ← Test de conexión
├── EJECUTAR_MIGRACION_CHAT.md         ← Guía detallada
└── README_TASK_1.1.md                 ← Este archivo
```

---

## 🎯 Próximos Pasos

Una vez que hayas completado esta tarea:

1. ✅ Marca todos los items del checklist
2. ✅ Confirma que el script de verificación pasó todas las pruebas
3. ➡️ Continúa con **Tarea 1.2**: Ejecutar migración para agregar campo documento a clientes
4. 📝 Documenta cualquier problema encontrado

---

## 📚 Referencias

- **Requirements:** 11.1, 11.2, 11.3, 11.4 en `requirements.md`
- **Design:** Sección "External Interfaces → Supabase Tables" en `design.md`
- **Documentación Supabase:** https://supabase.com/docs/guides/database

---

## 💡 Notas Importantes

- ⚠️ **No ejecutes esta migración más de una vez** (a menos que elimines las tablas primero)
- ✅ El script usa `IF NOT EXISTS` para evitar errores si las tablas ya existen
- 🔒 Las tablas se crean en el schema `public` de PostgreSQL
- 🗑️ El constraint `ON DELETE CASCADE` significa que al eliminar una sesión, todos sus mensajes se eliminan automáticamente
- 📊 Los índices mejoran el rendimiento de las consultas frecuentes
- 🔐 Considera configurar Row Level Security (RLS) en Supabase para proteger los datos

---

**Última actualización:** 2024  
**Versión:** 1.0  
**Autor:** Kiro AI Assistant  
**Estado:** ✅ Listo para ejecutar
