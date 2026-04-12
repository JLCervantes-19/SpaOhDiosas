# 📋 Guía: Ejecutar Migración de Campo Documento en Clientes

## Objetivo

Ejecutar la migración `002_add_documento_to_clientes.sql` en Supabase para agregar el campo `documento` a la tabla `clientes`, permitiendo que los usuarios consulten sus citas usando su número de documento de identidad.

## Requisitos Previos

- Acceso al dashboard de Supabase
- Variables de entorno configuradas en `.env` (SUPABASE_URL y SUPABASE_ANON_KEY)
- Node.js instalado (para verificación automática)
- Tabla `clientes` debe existir en Supabase

---

## 📝 Opción 1: Ejecutar desde Supabase Dashboard (Recomendado)

### Paso 1: Acceder al SQL Editor

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **SQL Editor**

### Paso 2: Ejecutar la Migración

1. Haz clic en **New Query** (o presiona `Ctrl/Cmd + Enter`)
2. Copia todo el contenido del archivo `database/migrations/002_add_documento_to_clientes.sql`
3. Pega el contenido en el editor SQL
4. Haz clic en **Run** (o presiona `Ctrl/Cmd + Enter`)

### Paso 3: Verificar Ejecución

Deberías ver un mensaje de éxito similar a:

```
Success. No rows returned
```

Esto es normal porque el script agrega una columna pero no retorna datos.

---

## 🔍 Opción 2: Verificación Automática con Script Node.js

Después de ejecutar la migración en Supabase, puedes verificar que todo se creó correctamente:

### Ejecutar Script de Verificación

```bash
node database/migrations/verify_documento_migration.js
```

### Salida Esperada

Si todo está correcto, verás:

```
🔍 Verificando migración: Add Documento to Clientes

✓ Variables de entorno encontradas

✓ Verificando tabla clientes...
✅ Tabla clientes existe y es accesible

✓ Verificando columna documento...
✅ Columna documento existe y es accesible

✓ Verificando inserción con documento...
✅ Inserción con documento exitosa
   Cliente ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Documento: TEST-1234567890

✓ Verificando consulta por documento...
✅ Consulta por documento exitosa
   Cliente encontrado: Test Cliente Migración

✓ Verificando índice idx_clientes_documento...
✅ Índice funciona correctamente
   Tiempo de consulta: XX ms

✓ Limpiando datos de prueba...
✅ Datos de prueba eliminados

═══════════════════════════════════════════════════════
✅ VERIFICACIÓN COMPLETA - TODAS LAS PRUEBAS PASARON
═══════════════════════════════════════════════════════

Características verificadas:
  ✓ Tabla clientes existe
  ✓ Columna documento existe
  ✓ Inserción con documento funciona
  ✓ Consulta por documento funciona
  ✓ Índice idx_clientes_documento funciona

🎉 La migración se ejecutó correctamente!

Próximos pasos:
  ✅ Marca la tarea 1.2 como completada
  ➡️  Continúa con la siguiente tarea del spec
```

---

## 🔍 Opción 3: Verificación Manual con SQL

Si prefieres verificar manualmente, ejecuta este script en el SQL Editor de Supabase:

```sql
-- Verificar que la columna documento existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name = 'documento';

-- Verificar que el índice existe
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'clientes'
  AND indexname = 'idx_clientes_documento';

-- Verificar que se puede insertar un cliente con documento
INSERT INTO clientes (nombre, telefono, email, documento, origen)
VALUES ('Test Cliente', '3001234567', 'test@test.com', '12345678', 'test')
RETURNING id, nombre, documento;

-- Verificar que se puede consultar por documento
SELECT id, nombre, telefono, documento
FROM clientes
WHERE documento = '12345678';

-- Limpiar datos de prueba
DELETE FROM clientes WHERE documento = '12345678';
```

### Resultados Esperados

**Columna documento:**
- `column_name`: documento
- `data_type`: text
- `is_nullable`: YES

**Índice:**
- `indexname`: idx_clientes_documento
- `indexdef`: CREATE INDEX idx_clientes_documento ON public.clientes USING btree (documento) WHERE (documento IS NOT NULL)

**Inserción y consulta:**
- Debe poder insertar un cliente con documento
- Debe poder consultar por documento
- Debe poder eliminar el cliente de prueba

---

## ✅ Checklist de Verificación

Marca cada item después de verificarlo:

- [ ] Columna `documento` existe en tabla `clientes`
- [ ] Columna `documento` es de tipo TEXT
- [ ] Columna `documento` es nullable (permite NULL)
- [ ] Índice `idx_clientes_documento` está creado
- [ ] Índice es parcial (solo indexa valores NOT NULL)
- [ ] Puedes insertar un cliente con documento
- [ ] Puedes insertar un cliente sin documento (NULL)
- [ ] Puedes consultar clientes por documento
- [ ] La consulta por documento es rápida (< 50ms)

---

## 🚨 Solución de Problemas

### Error: "column already exists"

Si ves este error, significa que la columna ya existe. Puedes:

1. **Opción A:** Ignorar el error (el script usa `IF NOT EXISTS`)
2. **Opción B:** Verificar que la columna existe correctamente:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name = 'documento';
```

### Error: "relation does not exist"

Si ves este error, significa que la tabla `clientes` no existe. Verifica:

1. Que estás conectado al proyecto correcto de Supabase
2. Que la tabla `clientes` fue creada previamente
3. Ejecuta la migración inicial si es necesario

### Error: "permission denied"

Verifica que estás usando una cuenta con permisos de administrador en Supabase.

### Script de verificación falla con error de conexión

Verifica que:
1. El archivo `.env` existe en la raíz del proyecto
2. Las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY` están correctamente configuradas
3. Tienes conexión a internet
4. Las credenciales de Supabase son válidas

---

## 📊 Estructura de la Columna

### documento en clientes

Campo para almacenar el documento de identidad del cliente:

```
┌─────────────────┬──────────────┬──────────┬─────────────────────┐
│ Campo           │ Tipo         │ Nullable │ Default             │
├─────────────────┼──────────────┼──────────┼─────────────────────┤
│ documento       │ TEXT         │ YES      │ NULL                │
└─────────────────┴──────────────┴──────────┴─────────────────────┘
```

**Características:**
- **Tipo:** TEXT (acepta números, letras y caracteres especiales)
- **Nullable:** YES (permite clientes sin documento para compatibilidad)
- **Indexado:** Sí, con índice parcial (solo valores NOT NULL)
- **Uso:** Consulta de citas en el sistema de chat interno

**Ejemplos de valores válidos:**
- `"12345678"` (cédula colombiana)
- `"1234567890"` (cédula con más dígitos)
- `"CC-12345678"` (con prefijo)
- `"PA-A1234567"` (pasaporte)
- `NULL` (cliente sin documento)

---

## 🎯 Casos de Uso

### Caso 1: Cliente Nuevo con Documento

Cuando un cliente hace una reserva y proporciona su documento:

```javascript
const { data, error } = await supabase
  .from('clientes')
  .insert({
    nombre: 'María García',
    telefono: '3001234567',
    email: 'maria@example.com',
    documento: '12345678',
    origen: 'web'
  });
```

### Caso 2: Consultar Citas por Documento

Cuando un cliente quiere ver sus citas en el chat:

```javascript
// 1. Buscar cliente por documento
const { data: cliente, error } = await supabase
  .from('clientes')
  .select('id, nombre')
  .eq('documento', '12345678')
  .single();

// 2. Buscar citas del cliente
const { data: citas } = await supabase
  .from('citas')
  .select(`
    id,
    fecha,
    hora_inicio,
    estado,
    servicios (nombre, precio, duracion_min)
  `)
  .eq('cliente_id', cliente.id)
  .order('fecha', { ascending: true });
```

### Caso 3: Cliente Existente sin Documento

Los clientes existentes que no tienen documento pueden seguir funcionando normalmente:

```javascript
// Consulta funciona con documento NULL
const { data: clientes } = await supabase
  .from('clientes')
  .select('*')
  .is('documento', null);
```

---

## 🔒 Consideraciones de Seguridad

### Privacidad del Documento

- El documento es información sensible (PII - Personally Identifiable Information)
- No debe mostrarse en logs o mensajes de error
- Debe estar protegido por las políticas RLS de Supabase
- Solo debe ser accesible por el propietario o administradores

### Políticas RLS Recomendadas

```sql
-- Permitir que los usuarios consulten solo sus propios datos
CREATE POLICY "Users can view their own cliente data"
ON clientes FOR SELECT
USING (auth.uid() = user_id OR auth.role() = 'admin');

-- Permitir que el sistema de chat consulte por documento
-- (requiere service role key en backend)
```

### Validación en Backend

```javascript
// Validar formato de documento antes de consultar
function isValidDocumento(documento) {
  // Solo alfanumérico y guiones
  return /^[A-Za-z0-9\-]+$/.test(documento);
}

// Sanitizar input del usuario
function sanitizeDocumento(documento) {
  return documento.trim().toUpperCase();
}
```

---

## 📈 Rendimiento

### Índice Parcial

El índice `idx_clientes_documento` es parcial (solo indexa valores NOT NULL):

**Ventajas:**
- Menor tamaño del índice
- Más rápido de mantener
- No desperdicia espacio en valores NULL

**Rendimiento esperado:**
- Consulta por documento: < 10ms
- Inserción con documento: < 50ms
- Actualización de documento: < 50ms

### Monitoreo

Para verificar el uso del índice:

```sql
EXPLAIN ANALYZE
SELECT * FROM clientes WHERE documento = '12345678';
```

Deberías ver: `Index Scan using idx_clientes_documento`

---

## 🎯 Próximos Pasos

Una vez que hayas verificado que la migración está completa:

1. ✅ Marca la tarea 1.2 como completada
2. ➡️ Continúa con la siguiente tarea del spec (implementación del backend)
3. 🧪 Prueba la funcionalidad de consulta de citas por documento
4. 📝 Actualiza la documentación si es necesario

---

## 📞 Soporte

Si encuentras problemas durante la ejecución de la migración:

1. Revisa los logs de error en Supabase SQL Editor
2. Ejecuta el script de verificación para diagnóstico detallado
3. Consulta la documentación de Supabase: https://supabase.com/docs
4. Revisa el archivo `design.md` para entender el modelo de datos

---

## 📚 Referencias

- **Requirements:** 12.1, 12.2, 12.5
- **Design Document:** Section "Data Models - Cliente Model"
- **Related Tasks:** 
  - Task 1.1: Create chat tables (prerequisite)
  - Task 2.x: Backend implementation (uses this field)
  - Task 3.x: Frontend implementation (queries by documento)

---

**Última actualización:** 2024  
**Versión:** 1.0  
**Relacionado con:** Requirements 12.1, 12.2, 12.5
