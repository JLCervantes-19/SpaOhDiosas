# Chat Interno N8N - Guía de Implementación

## 📋 Resumen

Sistema de chat interno que reemplaza el botón de WhatsApp con un chatbot conversacional integrado. Permite consultar servicios, verificar citas por documento, y obtener información del spa.

## 📁 Documentos del Spec

- **requirements.md** - Requisitos funcionales completos (16 requirements)
- **design.md** - Diseño técnico detallado con arquitectura, componentes y modelos de datos
- **README.md** - Este archivo (guía de implementación)

## 🎯 Objetivos Principales

1. Reemplazar botón de WhatsApp por botón de chat
2. Panel de chat responsivo (desktop: floating, mobile: fullscreen)
3. Flujo conversacional con opciones rápidas (Quick Replies)
4. Consulta de servicios desde Supabase
5. Consulta de citas por documento
6. Integración con N8N para texto libre (con fallback local)
7. Almacenamiento de sesiones y mensajes en Supabase

## 🏗️ Arquitectura

```
Frontend (HTML/CSS/JS vanilla)
    ↓
Backend API (Node.js/Express)
    ↓
Supabase (PostgreSQL) + N8N Webhook
```

## 📦 Archivos a Crear

### Backend
- `backend/routes/chat.js` - Endpoints del chat
- `backend/services/n8n.js` - Integración con N8N
- `backend/services/localResponses.js` - Respuestas de fallback

### Frontend
- `frontend/js/chat.js` - Lógica completa del chat

### Database
- `database/migrations/001_create_chat_tables.sql` - Tablas de chat
- `database/migrations/002_add_documento_to_clientes.sql` - Campo documento

### Modificaciones
- `backend/server.js` - Registrar rutas de chat
- `frontend/css/spa.css` - Estilos del chat
- `frontend/index.html` - Reemplazar botón WhatsApp
- `frontend/reservas.html` - Reemplazar botón WhatsApp

## 🗄️ Esquema de Base de Datos

### Nuevas Tablas

**chat_sessions:**
- id (UUID PK)
- session_id (UUID unique)
- user_name (text)
- started_at (timestamptz)
- last_activity (timestamptz)
- metadata (jsonb)

**chat_messages:**
- id (UUID PK)
- session_id (UUID FK)
- sender (text: 'user' | 'bot')
- content (text)
- message_type (text)
- created_at (timestamptz)
- metadata (jsonb)

### Modificación

**clientes:**
- documento (text) - NUEVO CAMPO

## 🔌 API Endpoints

### POST /api/chat/session
Crea nueva sesión de chat
- Request: `{}`
- Response: `{session_id, started_at}`

### POST /api/chat/message
Procesa mensaje y retorna respuesta del bot
- Request: `{session_id, user_name?, message, message_type}`
- Response: `{bot_response, quick_replies?, cards?}`

### GET /api/chat/services
Lista servicios activos
- Response: `Array<Service>`

### POST /api/chat/appointments
Busca citas por documento
- Request: `{documento}`
- Response: `{appointments: Array<Appointment>}`

## 🎨 Componentes Frontend

### ChatButton
- Botón flotante con animación pulse
- Badge numérico después de 3 segundos
- Toggle del panel

### ChatPanel
- Header con avatar 🌿 y estado online
- Área de mensajes scrollable
- Input field con botón enviar
- Responsivo (desktop: 400x600px, mobile: fullscreen)

### ChatManager
- Gestión de sesión (localStorage + API)
- Procesamiento de mensajes
- Coordinación entre UI y backend
- Manejo de errores

### Message Components
- Message Bubble (user/bot)
- Quick Reply Buttons
- Service Cards (con imagen)
- Appointment Cards (con colores por estado)
- Typing Indicator (3 dots animados)

## 🎨 Paleta de Colores

- Forest Green: `#2C4A2E` (botón, mensajes usuario)
- Golden: `#C9A961` (bordes, mensajes bot)
- Cream: `#FAF8F5` (fondo mensajes)
- White: `#FFFFFF`

Estados de citas:
- Pendiente: amarillo
- Confirmada: verde
- Completada: azul
- Cancelada: rojo

## 🔄 Flujo Conversacional

1. Usuario abre chat → Sesión creada
2. Bot saluda → Solicita nombre
3. Usuario da nombre → Bot muestra menú principal
4. Menú: 5 opciones (Ver servicios, Reservar, Consultar citas, Horarios, Certificados)
5. Usuario selecciona opción → Bot procesa y responde
6. Texto libre → Envía a N8N (o fallback local)

## 🔧 Variables de Entorno

```env
# Existentes
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Nuevas
N8N_CHAT_WEBHOOK=https://your-n8n.com/webhook/chat  # OPCIONAL
```

## 📝 Orden de Implementación

### Fase 1: Base de Datos (30 min)
1. Ejecutar `001_create_chat_tables.sql` en Supabase
2. Ejecutar `002_add_documento_to_clientes.sql` en Supabase
3. Verificar tablas creadas correctamente

### Fase 2: Backend (2-3 horas)
1. Crear `backend/services/localResponses.js`
2. Crear `backend/services/n8n.js`
3. Crear `backend/routes/chat.js` con 4 endpoints
4. Modificar `backend/server.js` para registrar rutas
5. Probar endpoints con Postman/Thunder Client

### Fase 3: Frontend (3-4 horas)
1. Crear `frontend/js/chat.js` con clases:
   - ChatButton
   - ChatPanel
   - ChatManager
   - Message rendering functions
2. Agregar estilos a `frontend/css/spa.css`
3. Modificar `frontend/index.html` (reemplazar botón WhatsApp)
4. Modificar `frontend/reservas.html` (reemplazar botón WhatsApp)

### Fase 4: Integración y Testing (1-2 horas)
1. Probar flujo completo en desarrollo
2. Probar en mobile y desktop
3. Probar con N8N (si está configurado)
4. Probar fallback local
5. Verificar persistencia de sesión

### Fase 5: Deploy (30 min)
1. Configurar `N8N_CHAT_WEBHOOK` en Vercel (opcional)
2. Deploy a Vercel
3. Probar en producción

## ✅ Checklist de Testing

- [ ] Botón de chat aparece en index.html y reservas.html
- [ ] Badge "1" aparece después de 3 segundos
- [ ] Panel se abre con animación suave
- [ ] Panel es responsivo (mobile fullscreen, desktop floating)
- [ ] Typing indicator aparece al procesar
- [ ] Quick replies son clickeables
- [ ] Service cards muestran imágenes
- [ ] Appointment cards tienen colores correctos por estado
- [ ] Búsqueda por documento funciona
- [ ] N8N integration funciona (si configurado)
- [ ] Fallback local funciona cuando N8N falla
- [ ] Sesión persiste al recargar página
- [ ] Mensajes de error son amigables
- [ ] Animaciones son suaves
- [ ] Colores coinciden con paleta del spa

## 🐛 Troubleshooting

**Problema:** Chat no abre
- Verificar que `chat.js` está cargado
- Verificar console por errores
- Verificar que botón tiene event listener

**Problema:** No se crean sesiones
- Verificar conexión a Supabase
- Verificar que tabla `chat_sessions` existe
- Verificar variables de entorno

**Problema:** No se muestran servicios
- Verificar que hay servicios con `activo = true`
- Verificar endpoint `/api/chat/services`
- Verificar console por errores

**Problema:** No se encuentran citas por documento
- Verificar que campo `documento` existe en tabla `clientes`
- Verificar que clientes tienen documento asignado
- Verificar query en backend

**Problema:** N8N no responde
- Verificar que `N8N_CHAT_WEBHOOK` está configurado
- Verificar que webhook está activo en N8N
- Sistema debe usar fallback local automáticamente

## 📚 Referencias

- **Supabase Docs:** https://supabase.com/docs
- **Express.js Docs:** https://expressjs.com/
- **N8N Docs:** https://docs.n8n.io/

## 🎯 Próximos Pasos

Después de implementar este spec:
1. Crear tasks.md con tareas específicas de implementación
2. Implementar cada componente según el diseño
3. Escribir tests unitarios
4. Realizar testing manual completo
5. Deploy a producción

---

**Spec Status:** ✅ Design Complete - Ready for Implementation  
**Estimated Time:** 6-10 horas de desarrollo  
**Priority:** High  
**Dependencies:** Supabase, Express backend existente
