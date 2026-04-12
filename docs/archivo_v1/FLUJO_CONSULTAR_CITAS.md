# 🔍 Flujo de Consultar Citas - Corregido

## ✅ Problema Resuelto

**Antes:** Al hacer click en "Consultar mis citas", el bot redirigía inmediatamente a agendar.

**Ahora:** El bot pide nombre Y email, busca en la base de datos, y muestra las citas o redirige si no encuentra.

---

## 🔄 Nuevo Flujo Completo

```
1. Usuario: Click "Consultar mis citas"
   ↓
2. Bot: "Para consultar tus citas, necesito algunos datos.
        ¿Cuál es tu nombre completo?"
   Estado: AWAITING_APPOINTMENT_NAME
   ↓
3. Usuario: "Juan Pérez"
   Frontend: tempName = "Juan Pérez"
   Backend: Guarda tempName en metadata
   ↓
4. Bot: "Perfecto, Juan Pérez. Ahora necesito tu correo electrónico 
        para buscar tus citas:"
   Estado: AWAITING_APPOINTMENT_EMAIL
   ↓
5. Usuario: "juan@gmail.com"
   Backend: Busca en BD con nombre O email
   Query: WHERE nombre ILIKE '%Juan Pérez%' OR email = 'juan@gmail.com'
   ↓
6a. Si encuentra cliente CON citas:
    Bot: "Hola Juan Pérez! 👋
         
         📅 Tus citas próximas:
         
         1. ✅ Masaje Relajante
            📅 lunes, 22 de abril de 2026
            🕐 10:00 - 11:00
            Estado: confirmada"
   ↓
6b. Si encuentra cliente SIN citas:
    Bot: "Hola Juan Pérez! 👋
         
         No tienes citas registradas en nuestro sistema.
         
         ¿Te gustaría agendar una cita?"
    → Redirige a /reservas.html
   ↓
6c. Si NO encuentra cliente:
    Bot: "Hola Juan Pérez! 👋
         
         No encontré tu perfil en nuestro sistema.
         
         ¿Te gustaría agendar tu primera cita con nosotros?"
    → Redirige a /reservas.html
```

---

## 🧪 Casos de Prueba

### Caso 1: Cliente Existe con Citas

**Requisito:** Cliente "Juan Pérez" con email "juan@gmail.com" y citas futuras

**Pasos:**
1. Abre: `http://localhost:3000/chat.html`
2. Escribe tu nombre (ej: "JHAN")
3. Click en "Consultar mis citas"
4. Bot pregunta: "¿Cuál es tu nombre completo?"
5. Escribe: "Juan Pérez"
6. Bot pregunta: "Ahora necesito tu correo electrónico"
7. Escribe: "juan@gmail.com"

**Resultado Esperado:**
```
Bot: Hola Juan Pérez! 👋

📅 Tus citas próximas:

1. ✅ Masaje Relajante
   📅 lunes, 22 de abril de 2026
   🕐 10:00 - 11:00
   Estado: confirmada

¿Necesitas ayuda con algo más?
```

### Caso 2: Cliente Existe sin Citas

**Requisito:** Cliente "María García" con email "maria@gmail.com" pero sin citas

**Pasos:**
1-6. Igual que Caso 1
7. Escribe: "maria@gmail.com"

**Resultado Esperado:**
```
Bot: Hola María García! 👋

No tienes citas registradas en nuestro sistema.

¿Te gustaría agendar una cita?

[Redirige a /reservas.html en 3 segundos]
```

### Caso 3: Cliente NO Existe

**Requisito:** Nombre y email no existen en la BD

**Pasos:**
1-6. Igual que Caso 1
7. Escribe: "noexiste@gmail.com"

**Resultado Esperado:**
```
Bot: Hola Pedro López! 👋

No encontré tu perfil en nuestro sistema.

¿Te gustaría agendar tu primera cita con nosotros?

[Redirige a /reservas.html en 3 segundos]
```

### Caso 4: Búsqueda por Email (sin nombre exacto)

**Requisito:** Cliente con email "juan@gmail.com" pero nombre diferente en BD

**Pasos:**
1-6. Igual que Caso 1
5. Escribe: "Juan" (nombre parcial)
7. Escribe: "juan@gmail.com" (email correcto)

**Resultado Esperado:**
```
Bot encuentra el cliente por email y muestra sus citas
```

---

## 🔍 Lógica de Búsqueda

### Query en Supabase

```javascript
// Busca por nombre O email
supabase
  .from('clientes')
  .select('id, nombre, email, telefono')
  .or(`nombre.ilike.%${userName}%,email.eq.${userEmail}`)
  .limit(5)
```

### Ejemplos de Búsqueda

| Nombre Ingresado | Email Ingresado | Nombre en BD | Email en BD | ¿Encuentra? |
|------------------|-----------------|--------------|-------------|-------------|
| Juan Pérez | juan@gmail.com | Juan Pérez | juan@gmail.com | ✅ Sí (ambos) |
| Juan | juan@gmail.com | Juan Pérez | juan@gmail.com | ✅ Sí (email) |
| Pedro | juan@gmail.com | Juan Pérez | juan@gmail.com | ✅ Sí (email) |
| Juan Pérez | otro@gmail.com | Juan Pérez | juan@gmail.com | ✅ Sí (nombre) |
| Pedro | otro@gmail.com | Juan Pérez | juan@gmail.com | ❌ No |

---

## 📝 Estados del Chatbot

### Nuevos Estados Agregados

```javascript
AWAITING_APPOINTMENT_NAME: 'awaiting_appointment_name'
AWAITING_APPOINTMENT_EMAIL: 'awaiting_appointment_email'
```

### Flujo de Estados

```
MAIN_MENU
  ↓ (Click "Consultar mis citas")
AWAITING_APPOINTMENT_NAME
  ↓ (Usuario da nombre)
AWAITING_APPOINTMENT_EMAIL
  ↓ (Usuario da email)
MAIN_MENU (con resultado de búsqueda)
```

---

## 🗄️ Datos de Prueba

```sql
-- Cliente con citas
INSERT INTO clientes (id, nombre, telefono, email, fecha_registro, origen)
VALUES (
  gen_random_uuid(),
  'Juan Pérez',
  '+57 300 111 1111',
  'juan@gmail.com',
  NOW(),
  'web'
);

-- Servicio
INSERT INTO servicios (id, nombre, descripcion, precio, duracion_min, buffer_min, activo)
VALUES (
  gen_random_uuid(),
  'Masaje Relajante',
  'Masaje completo',
  150000,
  60,
  15,
  true
);

-- Cita futura
INSERT INTO citas (id, cliente_id, servicio_id, fecha, hora_inicio, hora_fin, estado, origen, duracion_total)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM clientes WHERE email = 'juan@gmail.com' LIMIT 1),
  (SELECT id FROM servicios WHERE nombre = 'Masaje Relajante' LIMIT 1),
  CURRENT_DATE + INTERVAL '7 days',
  '10:00',
  '11:15',
  'confirmada',
  'web',
  75
);

-- Cliente sin citas
INSERT INTO clientes (id, nombre, telefono, email, fecha_registro, origen)
VALUES (
  gen_random_uuid(),
  'María García',
  '+57 300 222 2222',
  'maria@gmail.com',
  NOW(),
  'web'
);
```

---

## ✅ Verificación

### 1. Verificar que pide nombre

```
Usuario: Click "Consultar mis citas"
Bot: "¿Cuál es tu nombre completo?"
✅ Correcto
```

### 2. Verificar que pide email

```
Usuario: "Juan Pérez"
Bot: "Perfecto, Juan Pérez. Ahora necesito tu correo electrónico"
✅ Correcto
```

### 3. Verificar búsqueda

```sql
-- Debe encontrar por nombre
SELECT * FROM clientes WHERE nombre ILIKE '%Juan Pérez%';

-- Debe encontrar por email
SELECT * FROM clientes WHERE email = 'juan@gmail.com';

-- Debe encontrar por cualquiera de los dos
SELECT * FROM clientes 
WHERE nombre ILIKE '%Juan%' OR email = 'juan@gmail.com';
```

---

## 🐛 Solución de Problemas

### Problema: Bot redirige inmediatamente sin pedir datos

**Causa:** Código antiguo

**Solución:**
1. Verifica que `backend/services/chatbot.js` tenga:
```javascript
case 'appointments':
  return {
    response: 'Para consultar tus citas, necesito algunos datos.\n\n¿Cuál es tu nombre completo?',
    nextState: this.conversationStates.AWAITING_APPOINTMENT_NAME,
    showMenu: false
  };
```
2. Reinicia el servidor: `npm start`

### Problema: Bot no encuentra cliente que existe

**Causa:** Nombre o email no coinciden

**Solución:**
```sql
-- Verificar datos exactos
SELECT nombre, email FROM clientes WHERE email = 'juan@gmail.com';

-- Probar búsqueda flexible
SELECT nombre, email FROM clientes WHERE nombre ILIKE '%Juan%';
```

---

## 📊 Comparación Antes vs Ahora

| Aspecto | Antes ❌ | Ahora ✅ |
|---------|---------|---------|
| **Click "Consultar citas"** | Redirige a agendar | Pide nombre |
| **Datos solicitados** | Ninguno | Nombre + Email |
| **Búsqueda** | No busca | Busca por nombre O email |
| **Resultado** | Siempre redirige | Muestra citas o redirige |
| **Experiencia** | Confusa | Clara y lógica |

---

## 🎯 Resultado Final

✅ Bot pide nombre cuando usuario quiere consultar citas
✅ Bot pide email después del nombre
✅ Bot busca en BD por nombre O email
✅ Bot muestra citas si encuentra
✅ Bot redirige a agendar si no encuentra
✅ Flujo lógico y claro para el usuario

**¡Flujo de consultar citas completamente funcional! 🔍✨**
