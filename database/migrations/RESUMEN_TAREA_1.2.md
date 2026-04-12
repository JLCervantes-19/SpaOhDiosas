# ✅ Tarea 1.2: Ejecutar Migración para Agregar Campo Documento a Clientes

## 📋 Resumen de la Tarea

Esta tarea agrega el campo `documento` a la tabla `clientes` en Supabase, permitiendo que los usuarios consulten sus citas usando su número de documento de identidad (cédula, pasaporte, etc.).

## 🎯 Objetivos

- ✅ Agregar columna `documento` (TEXT, nullable) a tabla `clientes`
- ✅ Crear índice `idx_clientes_documento` para consultas rápidas
- ✅ Verificar que la migración se ejecutó correctamente

## 📝 Pasos para Ejecutar

### Paso 1: Acceder a Supabase Dashboard

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto de Serenità Spa
4. En el menú lateral izquierdo, haz clic en **SQL Editor**

### Paso 2: Ejecutar la Migración

1. En el SQL Editor, haz clic en **New Query**
2. Abre el archivo `database/migrations/002_add_documento_to_clientes.sql`
3. Copia **TODO** el contenido del archivo
4. Pega el contenido en el editor SQL de Supabase
5. Haz clic en el botón **Run** (o presiona `Ctrl/Cmd + Enter`)

### Paso 3: Verificar Ejecución

Deberías ver un mensaje como:

```
Success. No rows returned
```

Esto es **NORMAL** - significa que la migración se ejecutó correctamente.

### Paso 4: Verificar que Todo Funciona

Ejecuta esta consulta en el SQL Editor para verificar:

```sql
-- Verificar que la columna existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name = 'documento';

-- Verificar que el índice existe
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'clientes'
  AND indexname = 'idx_clientes_documento';
```

**Resultados esperados:**

**Columna documento:**
```
column_name | data_type | is_nullable
------------|-----------|------------
documento   | text      | YES
```

**Índice:**
```
indexname                | indexdef
-------------------------|------------------------------------------
idx_clientes_documento   | CREATE INDEX idx_clientes_documento ON...
```

### Paso 5: Prueba Funcional (Opcional)

Puedes probar que todo funciona correctamente:

```sql
-- Insertar un cliente de prueba con documento
INSERT INTO clientes (nombre, telefono, email, documento, origen)
VALUES ('Test Cliente', '3001234567', 'test@test.com', '12345678', 'test')
RETURNING id, nombre, documento;

-- Consultar por documento
SELECT id, nombre, telefono, documento
FROM clientes
WHERE documento = '12345678';

-- Limpiar datos de prueba
DELETE FROM clientes WHERE documento = '12345678';
```

## ✅ Checklist de Verificación

Marca cada item después de completarlo:

- [ ] Accedí a Supabase Dashboard
- [ ] Abrí el SQL Editor
- [ ] Copié el contenido de `002_add_documento_to_clientes.sql`
- [ ] Ejecuté el script en Supabase
- [ ] Vi el mensaje "Success. No rows returned"
- [ ] Verifiqué que la columna `documento` existe
- [ ] Verifiqué que el índice `idx_clientes_documento` existe
- [ ] (Opcional) Probé insertar y consultar por documento

## 📄 Archivos Creados

He creado los siguientes archivos para ayudarte:

1. **`database/migrations/002_add_documento_to_clientes.sql`**
   - El script SQL de la migración (este es el que debes ejecutar)

2. **`database/migrations/EJECUTAR_MIGRACION_DOCUMENTO.md`**
   - Guía completa y detallada con todas las opciones

3. **`database/migrations/verify_documento_migration.js`**
   - Script Node.js para verificación automática (requiere .env)

4. **`database/migrations/execute_documento_migration.js`**
   - Script Node.js para ejecución (requiere .env)

5. **`database/migrations/RESUMEN_TAREA_1.2.md`** (este archivo)
   - Resumen rápido de la tarea

## 🚨 Solución de Problemas

### Error: "column already exists"

✅ **Solución:** La columna ya existe, puedes ignorar este error. Verifica con:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'clientes' AND column_name = 'documento';
```

### Error: "relation does not exist"

❌ **Problema:** La tabla `clientes` no existe.

✅ **Solución:** Verifica que estás en el proyecto correcto de Supabase y que la tabla `clientes` fue creada previamente.

### Error: "permission denied"

❌ **Problema:** No tienes permisos de administrador.

✅ **Solución:** Asegúrate de estar usando una cuenta con permisos de administrador en Supabase.

## 📊 ¿Qué Hace Esta Migración?

### Antes de la Migración

```
Tabla: clientes
┌────────────────┬──────────┬───────┬──────────────┐
│ id             │ nombre   │ tel   │ email        │
├────────────────┼──────────┼───────┼──────────────┤
│ uuid-1         │ María    │ 300.. │ maria@...    │
│ uuid-2         │ Juan     │ 301.. │ juan@...     │
└────────────────┴──────────┴───────┴──────────────┘
```

### Después de la Migración

```
Tabla: clientes
┌────────────────┬──────────┬───────┬──────────────┬────────────┐
│ id             │ nombre   │ tel   │ email        │ documento  │
├────────────────┼──────────┼───────┼──────────────┼────────────┤
│ uuid-1         │ María    │ 300.. │ maria@...    │ NULL       │
│ uuid-2         │ Juan     │ 301.. │ juan@...     │ NULL       │
│ uuid-3         │ Ana      │ 302.. │ ana@...      │ 12345678   │
└────────────────┴──────────┴───────┴──────────────┴────────────┘
                                                    ↑
                                            NUEVA COLUMNA
```

**Características:**
- ✅ Columna `documento` agregada
- ✅ Tipo TEXT (acepta números, letras, guiones)
- ✅ Nullable (permite NULL para clientes existentes)
- ✅ Índice creado para consultas rápidas
- ✅ Índice parcial (solo indexa valores NOT NULL)

## 🎯 Caso de Uso

Esta columna se usará en el sistema de chat interno:

1. **Usuario en el chat:** "Quiero consultar mis citas"
2. **Bot:** "Por favor ingresa tu número de documento"
3. **Usuario:** "12345678"
4. **Sistema:** Busca en `clientes` WHERE `documento = '12345678'`
5. **Sistema:** Encuentra el cliente y muestra sus citas

## 📚 Referencias

- **Requirements:** 12.1, 12.2, 12.5
- **Design Document:** `.kiro/specs/chat-interno-n8n/design.md` - Section "Data Models - Cliente Model"
- **Task:** `.kiro/specs/chat-interno-n8n/tasks.md` - Task 1.2

## ✅ Próximos Pasos

Una vez que hayas completado esta tarea:

1. ✅ Marca todos los items del checklist arriba
2. ✅ Confirma que la migración se ejecutó correctamente
3. ➡️ Notifica que la tarea 1.2 está completa
4. ➡️ Continúa con la siguiente tarea del spec

---

## 💡 Ayuda Adicional

Si necesitas más detalles, consulta:

- **Guía completa:** `database/migrations/EJECUTAR_MIGRACION_DOCUMENTO.md`
- **Script SQL:** `database/migrations/002_add_documento_to_clientes.sql`
- **Documentación Supabase:** https://supabase.com/docs

---

**Última actualización:** 2024  
**Versión:** 1.0  
**Estado:** ✅ Listo para ejecutar
