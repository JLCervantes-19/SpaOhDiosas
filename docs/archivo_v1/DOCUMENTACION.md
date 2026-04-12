# 📚 Serenità Spa - Documentación Completa

Sistema de gestión de reservas y chat para spa con integración a Supabase.

---

## 📋 Tabla de Contenidos

1. [Inicio Rápido](#inicio-rápido)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Configuración](#configuración)
4. [Base de Datos](#base-de-datos)
5. [Chatbot](#chatbot)
6. [Deploy en Vercel](#deploy-en-vercel)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🚀 Inicio Rápido

### 1. Clonar e Instalar

```bash
git clone <tu-repo>
cd serenita-spa
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-clave-anon

# Servidor
PORT=3000
```

### 3. Configurar Base de Datos

Ejecuta en Supabase SQL Editor:

```sql
-- Ver archivo: supabase_datos_ejemplo.sql
-- O usar: queries_utiles.sql para consultas comunes
```

### 4. Iniciar Servidor

```bash
npm start
```

Abre: `http://localhost:3000`

---

## 📁 Estructura del Proyecto

```
serenita-spa/
├── api/
│   └── index.js              # Serverless handler para Vercel
├── backend/
│   ├── lib/
│   │   └── supabase.js       # Cliente de Supabase
│   ├── routes/
│   │   ├── chat.js           # Endpoints del chatbot
│   │   ├── citas.js          # Gestión de citas
│   │   ├── clientes.js       # Gestión de clientes
│   │   ├── disponibilidad.js # Horarios disponibles
│   │   └── servicios.js      # Servicios del spa
│   ├── services/
│   │   └── chatbot.js        # Lógica del chatbot
│   └── server.js             # Servidor Express
├── frontend/
│   ├── chat.html             # Interfaz del chatbot
│   ├── index.html            # Página principal
│   ├── reservas.html         # Sistema de reservas
│   └── servicios.html        # Catálogo de servicios
├── .env                      # Variables de entorno (no subir a git)
├── .env.example              # Plantilla de variables
├── package.json              # Dependencias
├── vercel.json               # Configuración de Vercel
└── DOCUMENTACION.md          # Este archivo
```

---

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SUPABASE_URL` | URL de tu proyecto Supabase | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Clave anon de Supabase | `eyJhbGc...` |
| `PORT` | Puerto del servidor local | `3000` |

### Dependencias Principales

```json
{
  "express": "^4.18.2",
  "@supabase/supabase-js": "^2.39.0",
  "uuid": "^9.0.1",
  "dotenv": "^16.3.1"
}
```

---

## 🗄️ Base de Datos

### Estructura de Tablas

#### `clientes`
```sql
id              uuid (PK)
nombre          text (NOT NULL)
telefono        text
email           text
fecha_registro  timestamp
origen          text
```

#### `servicios`
```sql
id              uuid (PK)
nombre          text (NOT NULL)
descripcion     text
precio          numeric
duracion_min    integer
buffer_min      integer
imagen_url      text
activo          boolean (default: true)
categoria       text
```

#### `citas`
```sql
id              uuid (PK)
cliente_id      uuid (FK → clientes.id)
servicio_id     uuid (FK → servicios.id)
fecha           date
hora_inicio     time
hora_fin        time
estado          text (confirmada, pendiente, cancelada, completada)
origen          text
notas           text
duracion_total  integer
created_at      timestamp
```

#### `disponibilidad`
```sql
id              uuid (PK)
dia_semana      integer (0=Domingo, 6=Sábado)
hora_inicio     time
hora_fin        time
activo          boolean
created_at      timestamp
```

#### `chat_sessions`
```sql
id              uuid (PK)
session_id      uuid (UNIQUE)
user_name       text
started_at      timestamp
last_activity   timestamp
metadata        jsonb
```

#### `chat_messages`
```sql
id              uuid (PK)
session_id      uuid (FK → chat_sessions.session_id)
sender          text (user, bot)
content         text
message_type    text
created_at      timestamp
metadata        jsonb
```

### Relaciones

```
clientes ←─── citas ───→ servicios
              ↓
         (cliente_id, servicio_id)

chat_sessions ←─── chat_messages
                   (session_id)
```

### Datos de Prueba

```sql
-- Cliente
INSERT INTO clientes (id, nombre, telefono, email, fecha_registro, origen)
VALUES (
  gen_random_uuid(),
  'JHAN',
  '+57 300 123 4567',
  'jhan@example.com',
  NOW(),
  'chat'
);

-- Servicio
INSERT INTO servicios (id, nombre, descripcion, precio, duracion_min, buffer_min, activo)
VALUES (
  gen_random_uuid(),
  'Masaje Relajante',
  'Masaje de cuerpo completo con aceites esenciales',
  150000,
  60,
  15,
  true
);

-- Cita
INSERT INTO citas (id, cliente_id, servicio_id, fecha, hora_inicio, hora_fin, estado, origen)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM clientes WHERE nombre = 'JHAN' LIMIT 1),
  (SELECT id FROM servicios WHERE nombre = 'Masaje Relajante' LIMIT 1),
  CURRENT_DATE + INTERVAL '7 days',
  '10:00',
  '11:00',
  'confirmada',
  'chat'
);
```

---

## 🤖 Chatbot

### Características

- ✅ Búsqueda de citas por nombre del cliente (guardado automáticamente)
- ✅ Consulta de servicios disponibles
- ✅ Información de horarios y ubicación
- ✅ Redirección inteligente a reservas
- ✅ Sin dependencia de N8N (directo con Supabase)
- ✅ Emails convertidos automáticamente a minúsculas

### Flujo de Conversación Correcto

```
1. Usuario entra al chat
   ↓
2. Bot: "¿Cómo te llamas?"
   Estado: AWAITING_NAME
   ↓
3. Usuario: "JHAN"
   → Nombre se guarda en localStorage
   → Nombre se guarda en chat_sessions
   → Nombre se usa para buscar citas
   ↓
4. Bot: "¡Encantado de conocerte, JHAN! 😊"
   Bot: "¿En qué puedo ayudarte hoy?"
   Estado: MAIN_MENU
   ↓
5. Usuario: Click "Consultar mis citas"
   → Bot busca en BD: WHERE nombre ILIKE '%JHAN%'
   → Muestra citas o redirige a reservas
```

### Intenciones Reconocidas

| Intención | Palabras Clave | Acción |
|-----------|----------------|--------|
| Saludo | hola, buenos días, hey | Saluda y muestra menú |
| Servicios | servicios, tratamientos, masajes | Lista servicios |
| Agendar | agendar, reservar, cita | Redirige a reservas |
| Consultar Citas | mis citas, ver citas | Busca por nombre |
| Horarios | horario, cuando abren | Muestra horarios |
| Ubicación | ubicación, dirección | Muestra dirección |

### Consultar Citas

El chatbot busca citas por **nombre del cliente**:

```javascript
// Backend: backend/services/chatbot.js
async checkAppointmentsByName(userName) {
  // 1. Buscar cliente por nombre
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nombre, email, telefono')
    .ilike('nombre', `%${userName}%`)
    .limit(5);

  // 2. Si encuentra, buscar sus citas
  const { data: citas } = await supabase
    .from('citas')
    .select(`
      id, fecha, hora_inicio, hora_fin, estado, notas,
      servicios (nombre, duracion_min, precio)
    `)
    .eq('cliente_id', cliente.id)
    .order('fecha', { ascending: false });

  // 3. Separar futuras y pasadas
  const hoy = new Date().toISOString().split('T')[0];
  const citasFuturas = citas?.filter(c => c.fecha >= hoy) || [];
  
  // 4. Responder según el caso
}
```

### Casos Manejados

#### Cliente NO existe
```
Bot: "No encontré tu perfil. ¿Agendar primera cita?"
→ Redirige a /reservas.html
```

#### Cliente SIN citas
```
Bot: "No tienes citas registradas. ¿Agendar una?"
→ Redirige a /reservas.html
```

#### Cliente CON citas futuras
```
Bot: "Tus citas próximas:
     1. ✅ Masaje Relajante
        📅 lunes, 15 de abril de 2026
        🕐 10:00 - 11:00"
```

#### Cliente solo con citas pasadas
```
Bot: "No tienes próximas. ¡Gracias por visitarnos! 💜"
→ Redirige a /reservas.html
```

### Endpoints del Chatbot

```javascript
// POST /api/chat/session
// Crea una nueva sesión de chat
{
  "session_id": "uuid",
  "started_at": "timestamp"
}

// POST /api/chat/message
// Procesa un mensaje del usuario
{
  "session_id": "uuid",
  "user_name": "JHAN",
  "message": "Consultar mis citas",
  "step": "main_menu"
}

// Respuesta:
{
  "bot_response": "Hola JHAN! Tus citas próximas...",
  "showMenu": true,
  "nextState": "main_menu",
  "action": "suggest_booking",
  "data": { ... }
}
```

### Probar el Chatbot

1. Inserta datos de prueba (ver sección Base de Datos)
2. Abre: `http://localhost:3000/chat.html`
3. Escribe tu nombre: "JHAN"
4. Click en "Consultar mis citas"
5. ✅ Verás tus citas!

---

## 🚀 Deploy en Vercel

### 1. Preparar el Proyecto

Asegúrate de tener `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

### 2. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 3. Deploy

```bash
vercel
```

Sigue las instrucciones en pantalla.

### 4. Configurar Variables de Entorno

En el dashboard de Vercel:

1. Ve a tu proyecto
2. Settings → Environment Variables
3. Agrega:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`

### 5. Redeploy

```bash
vercel --prod
```

### URLs Resultantes

```
https://tu-proyecto.vercel.app/              → index.html
https://tu-proyecto.vercel.app/chat.html     → chat
https://tu-proyecto.vercel.app/reservas.html → reservas
https://tu-proyecto.vercel.app/api/chat/...  → API
```

---

## 🔧 Solución de Problemas

### Error: "No encontré tu perfil"

**Causa:** El cliente no existe en la base de datos.

**Solución:**
```sql
SELECT * FROM clientes WHERE nombre ILIKE '%JHAN%';
-- Si no existe, insertar:
INSERT INTO clientes (id, nombre, telefono, email, fecha_registro, origen)
VALUES (gen_random_uuid(), 'JHAN', '+57 300 123 4567', 'jhan@example.com', NOW(), 'chat');
```

### Error: "No tienes citas registradas"

**Causa:** El cliente existe pero no tiene citas.

**Solución:**
```sql
-- Insertar cita de prueba
INSERT INTO citas (id, cliente_id, servicio_id, fecha, hora_inicio, hora_fin, estado, origen)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM clientes WHERE nombre = 'JHAN' LIMIT 1),
  (SELECT id FROM servicios LIMIT 1),
  CURRENT_DATE + INTERVAL '7 days',
  '10:00', '11:00', 'confirmada', 'chat'
);
```

### Error de Conexión a Supabase

**Causa:** Variables de entorno incorrectas.

**Solución:**
1. Verifica `.env`:
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-clave-anon
```
2. Reinicia el servidor: `npm start`

### El Chatbot No Responde

**Causa:** Servidor no está corriendo o error en el frontend.

**Solución:**
1. Verifica que el servidor esté corriendo: `npm start`
2. Abre la consola del navegador (F12) para ver errores
3. Verifica que la URL de la API sea correcta

### Error en Deploy de Vercel

**Causa:** Variables de entorno no configuradas.

**Solución:**
1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Agrega `SUPABASE_URL` y `SUPABASE_KEY`
3. Redeploy: `vercel --prod`

---

## 📝 Archivos SQL Útiles

### `supabase_datos_ejemplo.sql`
Contiene datos de ejemplo para poblar la base de datos con servicios, clientes y citas de prueba.

### `queries_utiles.sql`
Consultas SQL comunes para:
- Ver clientes
- Ver citas
- Ver servicios activos
- Estadísticas de reservas

---

## 🎨 Personalización

### Colores del Tema

```css
:root {
  --lilac: #AD74C3;
  --lilac-light: #C9A0D9;
  --lilac-dark: #8B5BA8;
  --purple-dark: #522665;
  --gold: #C9A961;
  --gold-light: #DFC98A;
  --white: #FFFFFF;
  --cream: #FAF8F5;
  --text-dark: #1C1C1E;
}
```

### Horarios de Atención

Edita en `backend/services/chatbot.js`:

```javascript
showSchedule() {
  return {
    response: '🕐 **Nuestros horarios de atención:**\n\n' +
              '📅 Lunes a Sábado: 9:00 AM - 7:00 PM\n' +
              '📅 Domingos: 10:00 AM - 5:00 PM\n\n'
  };
}
```

### Ubicación

Edita en `backend/services/chatbot.js`:

```javascript
showLocation() {
  return {
    response: '📍 **Nuestra ubicación:**\n\n' +
              'Carrera 1 # 2-3\n' +
              'Riohacha, La Guajira\n' +
              'Colombia\n\n' +
              '📞 Teléfono: +57 300 123 4567\n\n'
  };
}
```

---

## 📞 Soporte

Para más información o soporte, consulta:
- Código fuente en: `backend/` y `frontend/`
- Archivos SQL en: `supabase_datos_ejemplo.sql` y `queries_utiles.sql`
- Configuración de Vercel en: `vercel.json`

---

**¡Listo! Tu sistema de gestión de spa está configurado y funcionando. 🌿✨**
