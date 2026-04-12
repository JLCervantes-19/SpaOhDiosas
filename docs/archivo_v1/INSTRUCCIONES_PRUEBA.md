# 🧪 Instrucciones para Probar la Gestión de Citas

## ✅ Estado Actual

La funcionalidad de gestión de citas está **completamente implementada** y lista para probar. No hay errores de sintaxis en el código.

## 🚀 Cómo Iniciar las Pruebas

### Paso 1: Iniciar el Servidor

```bash
# Opción A: Modo normal
npm start

# Opción B: Modo desarrollo (con auto-reload)
npm run dev
```

El servidor iniciará en `http://localhost:3000`

### Paso 2: Abrir el Chat

Abre tu navegador en:
```
http://localhost:3000/frontend/chat.html
```

O si prefieres probar desde la página principal:
```
http://localhost:3000/frontend/index.html
```

## 📝 Escenarios de Prueba

### Escenario 1: Flujo Completo Exitoso ✨

**Objetivo**: Verificar que un usuario puede consultar y gestionar sus citas

**Pasos**:
1. Abre el chat
2. Escribe tu nombre cuando te lo pida (ej: "JHAN")
3. Haz clic en "Consultar mis citas"
4. Escribe tu nombre completo
5. Escribe tu email (ej: "jhan@example.com")

**Resultado Esperado**:
- ✅ Muestra tus citas futuras
- ✅ Aparecen botones: "Cancelar cita", "Cambiar fecha", "Todo está bien"
- ✅ Cada cita muestra: fecha, hora, servicio, estado

### Escenario 2: Cancelar una Cita 🗑️

**Prerequisito**: Debes tener una cita agendada con más de 24 horas de anticipación

**Pasos**:
1. Sigue el Escenario 1 hasta ver tus citas
2. Haz clic en "Cancelar cita"
3. Escribe el número de la cita que quieres cancelar (ej: "1")

**Resultado Esperado**:
- ✅ Mensaje de confirmación de cancelación
- ✅ Mensaje de despedida cálido
- ✅ Botones: "Agendar nueva cita", "Volver al menú", "Salir"

**Verificación en BD**:
```sql
SELECT id, fecha, hora_inicio, estado 
FROM citas 
WHERE cliente_id = (SELECT id FROM clientes WHERE email = 'tu_email@example.com')
ORDER BY fecha DESC;
```
El estado debe ser `'cancelada'`

### Escenario 3: Intentar Cancelar con Menos de 24h ⚠️

**Prerequisito**: Debes tener una cita agendada con menos de 24 horas de anticipación

**Pasos**:
1. Sigue el Escenario 1 hasta ver tus citas
2. Haz clic en "Cancelar cita"
3. Escribe el número de la cita

**Resultado Esperado**:
- ✅ Mensaje de error amigable
- ✅ Indica que se requieren 24 horas de anticipación
- ✅ Muestra teléfono de contacto: +57 300 123 4567
- ✅ Botones: "Volver al menú", "Salir"

### Escenario 4: Cambiar Fecha de Cita 📅

**Prerequisito**: Debes tener una cita agendada con más de 24 horas de anticipación

**Pasos**:
1. Sigue el Escenario 1 hasta ver tus citas
2. Haz clic en "Cambiar fecha"
3. Escribe el número de la cita

**Resultado Esperado**:
- ✅ Mensaje explicando que se abrirá el sistema de reservas
- ✅ Redirige a `/reservas.html` después de unos segundos

### Escenario 5: Todo Está Bien 👍

**Pasos**:
1. Sigue el Escenario 1 hasta ver tus citas
2. Haz clic en "Todo está bien"

**Resultado Esperado**:
- ✅ Mensaje de confirmación amigable
- ✅ Mensaje de despedida con información de contacto
- ✅ Botones: "Volver al menú", "Salir"

### Escenario 6: Salir del Chat 🚪

**Pasos**:
1. En cualquier momento donde aparezca el botón "Salir", haz clic

**Resultado Esperado**:
- ✅ Mensaje de despedida cálido
- ✅ Redirige a `/index.html` después de 2 segundos
- ✅ Limpia la sesión (localStorage)

### Escenario 7: Usuario Sin Citas 📭

**Pasos**:
1. Consulta citas con un nombre/email que no tiene citas registradas

**Resultado Esperado**:
- ✅ Mensaje indicando que no tiene citas
- ✅ Ofrece agendar una cita
- ✅ Botones: "Sí, agendar", "No, gracias"

## 🗄️ Preparar Datos de Prueba

Si no tienes citas en tu base de datos, puedes crear algunas de prueba:

### Crear Cita con Más de 24h (Para Probar Cancelación/Cambio)

```sql
-- Primero, obtén tu cliente_id
SELECT id, nombre, email FROM clientes WHERE email = 'tu_email@example.com';

-- Luego, obtén un servicio_id
SELECT id, nombre FROM servicios WHERE activo = true LIMIT 1;

-- Crear cita de prueba (3 días en el futuro)
INSERT INTO citas (id, cliente_id, servicio_id, fecha, hora_inicio, hora_fin, estado, origen, created_at)
VALUES (
  gen_random_uuid(),
  '[TU_CLIENTE_ID]',
  '[UN_SERVICIO_ID]',
  CURRENT_DATE + INTERVAL '3 days',
  '14:00:00',
  '15:30:00',
  'confirmada',
  'web',
  NOW()
);
```

### Crear Cita con Menos de 24h (Para Probar Validación)

```sql
-- Crear cita de prueba (12 horas en el futuro)
INSERT INTO citas (id, cliente_id, servicio_id, fecha, hora_inicio, hora_fin, estado, origen, created_at)
VALUES (
  gen_random_uuid(),
  '[TU_CLIENTE_ID]',
  '[UN_SERVICIO_ID]',
  CURRENT_DATE,
  (CURRENT_TIME + INTERVAL '12 hours')::time,
  (CURRENT_TIME + INTERVAL '13.5 hours')::time,
  'confirmada',
  'web',
  NOW()
);
```

## ✅ Checklist de Verificación

Marca cada item después de probarlo:

- [ ] El chat se abre correctamente
- [ ] Pide nombre al inicio
- [ ] Muestra menú principal después del nombre
- [ ] "Consultar mis citas" pide nombre completo
- [ ] Luego pide email
- [ ] Busca citas correctamente (por nombre O email)
- [ ] Muestra citas futuras con formato correcto
- [ ] Aparecen botones de acción rápida
- [ ] "Cancelar cita" funciona con 24h de anticipación
- [ ] "Cancelar cita" muestra error sin 24h de anticipación
- [ ] Cancelación actualiza estado en BD
- [ ] "Cambiar fecha" funciona con 24h de anticipación
- [ ] "Cambiar fecha" muestra error sin 24h de anticipación
- [ ] "Cambiar fecha" redirige a reservas
- [ ] "Todo está bien" muestra mensaje apropiado
- [ ] "Salir" limpia sesión y redirige
- [ ] Mensajes de despedida son cálidos
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del servidor

## 🐛 Si Encuentras Problemas

### Error: "Cannot connect to database"
- Verifica que tu archivo `.env` tiene las credenciales correctas de Supabase
- Verifica que las variables están cargadas: `SUPABASE_URL` y `SUPABASE_KEY`

### Error: "Session not found"
- Limpia el localStorage del navegador
- Recarga la página
- Inicia una nueva sesión

### Las citas no aparecen
- Verifica que tienes citas en la BD con `SELECT * FROM citas WHERE cliente_id = '[TU_ID]'`
- Verifica que las citas tienen `fecha >= CURRENT_DATE`
- Verifica que el email está en minúsculas en la BD

### Los botones no aparecen
- Abre la consola del navegador (F12)
- Busca errores de JavaScript
- Verifica que `quickReplies` se está retornando del backend

## 📊 Verificar en Base de Datos

Después de cada prueba, puedes verificar los cambios:

```sql
-- Ver todas las citas de un cliente
SELECT 
  c.id,
  c.fecha,
  c.hora_inicio,
  c.hora_fin,
  c.estado,
  s.nombre as servicio,
  cl.nombre as cliente,
  cl.email
FROM citas c
JOIN clientes cl ON c.cliente_id = cl.id
JOIN servicios s ON c.servicio_id = s.id
WHERE cl.email = 'tu_email@example.com'
ORDER BY c.fecha DESC, c.hora_inicio DESC;
```

```sql
-- Ver sesiones de chat recientes
SELECT 
  session_id,
  user_name,
  started_at,
  last_activity
FROM chat_sessions
ORDER BY started_at DESC
LIMIT 10;
```

```sql
-- Ver mensajes de una sesión
SELECT 
  sender,
  content,
  created_at
FROM chat_messages
WHERE session_id = '[TU_SESSION_ID]'
ORDER BY created_at ASC;
```

## 🎉 Cuando Todo Funcione

Una vez que hayas verificado todos los escenarios:

1. ✅ Marca como completada la Tarea 5 en tu lista
2. 📝 Documenta cualquier comportamiento inesperado
3. 🚀 Prepara para deploy a producción (Vercel)
4. 🎊 ¡Celebra! El chatbot está "bien pilas" como querías

## 📞 Próximos Pasos

Después de las pruebas, considera:

1. **Deploy a Vercel**: `vercel --prod`
2. **Probar en producción** con datos reales
3. **Integración con N8N** (cuando estés listo para escalar)
4. **Monitoreo de errores** en producción
5. **Feedback de usuarios reales**

---

**Nota**: Todos los archivos de documentación creados:
- `PRUEBAS_GESTION_CITAS.md` - Plan de pruebas detallado
- `ESTADO_ACTUAL_CHATBOT.md` - Estado completo del proyecto
- `INSTRUCCIONES_PRUEBA.md` - Este archivo (guía paso a paso)
