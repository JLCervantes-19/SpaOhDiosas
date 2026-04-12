# 🧪 Pruebas del Chatbot - Versión Final

## ✅ Correcciones Implementadas

### 1. Problema del Nombre Resuelto
**Antes:** El bot no guardaba el nombre cuando el usuario lo proporcionaba
**Ahora:** El nombre se guarda correctamente y se usa para buscar citas

### 2. Conversión de Email a Minúsculas
**Implementado:** Todos los emails se convierten automáticamente a minúsculas antes de guardar en la base de datos

---

## 🔄 Flujo Correcto del Chatbot

```
1. Usuario entra al chat
   ↓
2. Bot: "¿Cómo te llamas?"
   Estado: AWAITING_NAME
   ↓
3. Usuario: "JHAN"
   Frontend: Guarda userName = "JHAN"
   Backend: Procesa con estado "awaiting_name"
   Backend: Guarda en chat_sessions.user_name = "JHAN"
   ↓
4. Bot: "¡Encantado de conocerte, JHAN! 😊"
   Bot: "¿En qué puedo ayudarte hoy?"
   Estado: MAIN_MENU
   Muestra: [Ver servicios] [Agendar cita] [Consultar mis citas]...
   ↓
5. Usuario: Click "Consultar mis citas"
   Frontend: Envía userName = "JHAN" en el contexto
   Backend: Llama checkAppointmentsByName("JHAN")
   ↓
6. Backend busca:
   SELECT * FROM clientes WHERE nombre ILIKE '%JHAN%'
   ↓
7a. Si encuentra cliente CON citas:
    Bot: "Hola JHAN! 👋
         Tus citas próximas:
         1. ✅ Masaje Relajante
            📅 lunes, 15 de abril
            🕐 10:00 - 11:00"
   ↓
7b. Si encuentra cliente SIN citas:
    Bot: "Hola JHAN! 👋
         No tienes citas registradas.
         ¿Te gustaría agendar una?"
    → Redirige a /reservas.html
   ↓
7c. Si NO encuentra cliente:
    Bot: "Hola JHAN! 👋
         No encontré tu perfil.
         ¿Te gustaría agendar tu primera cita?"
    → Redirige a /reservas.html
```

---

## 🧪 Casos de Prueba

### Caso 1: Usuario Nuevo (Flujo Completo)

**Pasos:**
1. Abre: `http://localhost:3000/chat.html`
2. Bot pregunta: "¿Cómo te llamas?"
3. Escribe: "JHAN"
4. Bot responde: "¡Encantado de conocerte, JHAN! 😊"
5. Bot muestra menú
6. Click en "Consultar mis citas"

**Resultado Esperado:**
```
Bot: Hola JHAN! 👋

No encontré tu perfil en nuestro sistema.

¿Te gustaría agendar tu primera cita con nosotros?

[Redirige a /reservas.html en 3 segundos]
```

### Caso 2: Usuario Existente CON Citas

**Requisito:** Cliente "JHAN" existe en la BD con citas futuras

**Pasos:**
1-5. Igual que Caso 1
6. Click en "Consultar mis citas"

**Resultado Esperado:**
```
Bot: Hola JHAN! 👋

📅 Tus citas próximas:

1. ✅ Masaje Relajante
   📅 lunes, 22 de abril de 2026
   🕐 10:00 - 11:00
   Estado: confirmada

¿Necesitas ayuda con algo más?
```

### Caso 3: Usuario Existente SIN Citas

**Requisito:** Cliente "JHAN" existe en la BD pero sin citas

**Pasos:**
1-5. Igual que Caso 1
6. Click en "Consultar mis citas"

**Resultado Esperado:**
```
Bot: Hola JHAN! 👋

No tienes citas registradas en nuestro sistema.

¿Te gustaría agendar una cita?

[Redirige a /reservas.html en 3 segundos]
```

### Caso 4: Email en Minúsculas

**Pasos:**
1. Abre: `http://localhost:3000/reservas.html`
2. Llena el formulario:
   - Nombre: "Juan Pérez"
   - Email: "JUAN.PEREZ@GMAIL.COM" (en mayúsculas)
   - Teléfono: "+57 300 123 4567"
   - Selecciona servicio, fecha y hora
3. Click en "Reservar"

**Resultado Esperado:**
- Reserva creada exitosamente
- En la base de datos, el email se guarda como: "juan.perez@gmail.com" (minúsculas)

**Verificar en Supabase:**
```sql
SELECT email FROM clientes WHERE telefono = '+57 300 123 4567';
-- Debe retornar: juan.perez@gmail.com (todo en minúsculas)
```

---

## 🔍 Verificación Técnica

### 1. Verificar que el Nombre se Guarda

**En la consola del navegador (F12):**
```javascript
localStorage.getItem('chat_user_name')
// Debe retornar: "JHAN"
```

**En Supabase:**
```sql
SELECT session_id, user_name, started_at 
FROM chat_sessions 
ORDER BY started_at DESC 
LIMIT 1;
-- user_name debe ser: "JHAN"
```

### 2. Verificar Búsqueda de Citas

**En Supabase:**
```sql
-- Ver si el cliente existe
SELECT * FROM clientes WHERE nombre ILIKE '%JHAN%';

-- Ver sus citas
SELECT 
  c.fecha,
  c.hora_inicio,
  c.estado,
  cl.nombre as cliente,
  s.nombre as servicio
FROM citas c
JOIN clientes cl ON c.cliente_id = cl.id
JOIN servicios s ON c.servicio_id = s.id
WHERE cl.nombre ILIKE '%JHAN%'
ORDER BY c.fecha DESC;
```

### 3. Verificar Email en Minúsculas

**En Supabase:**
```sql
-- Ver todos los emails (deben estar en minúsculas)
SELECT nombre, email FROM clientes ORDER BY fecha_registro DESC LIMIT 10;

-- Buscar emails con mayúsculas (no debe retornar nada)
SELECT nombre, email FROM clientes WHERE email != LOWER(email);
```

---

## 🐛 Solución de Problemas

### Problema: "No estoy seguro de entender"

**Causa:** El nombre no se guardó correctamente

**Solución:**
1. Abre la consola del navegador (F12)
2. Verifica: `localStorage.getItem('chat_user_name')`
3. Si es null, recarga la página y vuelve a escribir tu nombre
4. Verifica que el estado sea "awaiting_name" cuando escribes el nombre

### Problema: El bot no encuentra mis citas

**Causa 1:** El cliente no existe en la base de datos

**Solución:**
```sql
-- Insertar cliente de prueba
INSERT INTO clientes (id, nombre, telefono, email, fecha_registro, origen)
VALUES (
  gen_random_uuid(),
  'JHAN',
  '+57 300 123 4567',
  'jhan@example.com',
  NOW(),
  'chat'
);
```

**Causa 2:** El cliente existe pero no tiene citas

**Solución:**
```sql
-- Insertar cita de prueba
INSERT INTO citas (id, cliente_id, servicio_id, fecha, hora_inicio, hora_fin, estado, origen)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM clientes WHERE nombre ILIKE '%JHAN%' LIMIT 1),
  (SELECT id FROM servicios LIMIT 1),
  CURRENT_DATE + INTERVAL '7 days',
  '10:00',
  '11:00',
  'confirmada',
  'chat'
);
```

### Problema: Email se guarda con mayúsculas

**Causa:** Versión antigua del código

**Solución:**
1. Verifica que `backend/routes/bookings.js` tenga:
```javascript
const emailNormalizado = email ? email.toLowerCase().trim() : ''
```
2. Reinicia el servidor: `npm start`
3. Prueba crear una nueva reserva

---

## ✅ Checklist de Pruebas

- [ ] El bot pregunta el nombre al iniciar
- [ ] El nombre se guarda en localStorage
- [ ] El nombre se guarda en chat_sessions
- [ ] "Consultar mis citas" usa el nombre guardado
- [ ] Si no existe el cliente, ofrece agendar
- [ ] Si existe sin citas, ofrece agendar
- [ ] Si existe con citas, las muestra correctamente
- [ ] Las fechas se formatean en español
- [ ] Los emojis de estado se muestran (✅ ⏳ ❌ ✔️)
- [ ] Redirige a /reservas.html cuando corresponde
- [ ] Los emails se guardan en minúsculas
- [ ] Los emails con mayúsculas se convierten automáticamente

---

## 📊 Datos de Prueba Completos

```sql
-- 1. Cliente
INSERT INTO clientes (id, nombre, telefono, email, fecha_registro, origen)
VALUES (
  gen_random_uuid(),
  'JHAN',
  '+57 300 123 4567',
  'jhan@example.com',
  NOW(),
  'chat'
);

-- 2. Servicio
INSERT INTO servicios (id, nombre, descripcion, precio, duracion_min, buffer_min, activo, categoria)
VALUES (
  gen_random_uuid(),
  'Masaje Relajante',
  'Masaje de cuerpo completo con aceites esenciales para relajación profunda',
  150000,
  60,
  15,
  true,
  'masajes'
);

-- 3. Cita Futura
INSERT INTO citas (id, cliente_id, servicio_id, fecha, hora_inicio, hora_fin, estado, origen, duracion_total)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM clientes WHERE nombre ILIKE '%JHAN%' LIMIT 1),
  (SELECT id FROM servicios WHERE nombre = 'Masaje Relajante' LIMIT 1),
  CURRENT_DATE + INTERVAL '7 days',
  '10:00',
  '11:15',
  'confirmada',
  'chat',
  75
);

-- 4. Verificar
SELECT 
  c.fecha,
  c.hora_inicio,
  c.hora_fin,
  c.estado,
  cl.nombre as cliente,
  s.nombre as servicio
FROM citas c
JOIN clientes cl ON c.cliente_id = cl.id
JOIN servicios s ON c.servicio_id = s.id
WHERE cl.nombre ILIKE '%JHAN%';
```

---

## 🎯 Resultado Final Esperado

Cuando todo funcione correctamente:

1. ✅ Usuario dice su nombre → Se guarda correctamente
2. ✅ Usuario pide sus citas → Bot busca por nombre
3. ✅ Si tiene citas → Las muestra con formato bonito
4. ✅ Si no tiene citas → Ofrece agendar y redirige
5. ✅ Emails siempre en minúsculas en la BD
6. ✅ Todo funciona sin N8N

**¡Chatbot listo para producción! 🌿✨**
