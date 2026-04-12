# Design Document: Sistema de Chat Interno N8N

## Overview

El sistema de chat interno reemplaza el botón flotante de WhatsApp existente con un chatbot conversacional integrado directamente en el sitio web de Serenità Spa. El sistema permite a los usuarios consultar servicios, reservar citas, verificar reservas existentes y obtener información del spa sin salir de la página.

### Objetivos del Sistema

- Proporcionar una experiencia de chat fluida y elegante acorde al diseño luxury del spa
- Reducir la fricción en el proceso de consulta y reserva de servicios
- Integrar respuestas inteligentes mediante N8N para consultas de texto libre
- Mantener historial de conversaciones en Supabase para análisis y seguimiento
- Ofrecer respuestas rápidas mediante opciones predefinidas (Quick Replies)
- Permitir consulta de citas mediante documento de identidad

### Alcance

**Incluye:**
- Reemplazo del botón de WhatsApp por botón de chat en index.html y reservas.html
- Panel de chat responsivo (desktop: floating panel, mobile: fullscreen)
- Flujo conversacional con opciones de menú
- Consulta de servicios desde Supabase con visualización en cards
- Consulta de citas por documento con visualización en cards con estados coloreados
- Integración con N8N webhook para respuestas de texto libre
- Almacenamiento de sesiones y mensajes en Supabase
- Indicador de escritura (typing indicator)
- Animaciones suaves y transiciones elegantes
- Respuestas de fallback locales cuando N8N no está disponible

**No incluye:**
- Sistema de reservas completo (se redirige a reservas.html existente)
- Procesamiento de pagos
- Videollamadas o llamadas de voz
- Notificaciones push
- Panel de administración para gestionar conversaciones

## Architecture

### Arquitectura General

```mermaid
graph TB
    subgraph "Frontend - Browser"
        A[Chat Button] --> B[Chat Panel UI]
        B --> C[Chat Manager]
        C --> D[Session Storage]
    end
    
    subgraph "Backend - Express API"
        E[/api/chat/session]
        F[/api/chat/message]
        G[/api/chat/services]
        H[/api/chat/appointments]
    end
    
    subgraph "External Services"
        I[(Supabase)]
        J[N8N Webhook]
    end
    
    C --> E
    C --> F
    C --> G
    C --> H
    
    E --> I
    F --> I
    F --> J
    G --> I
    H --> I
    
    J -.fallback.-> F
```

### Flujo de Datos Principal

1. **Inicialización:**
   - Usuario carga la página → Chat Button se renderiza con animación pulse
   - Después de 3 segundos → Badge "1" aparece en el botón
   - Usuario hace clic → Chat Panel se abre con slide-in animation

2. **Creación de Sesión:**
   - Chat Manager verifica localStorage por session_id existente
   - Si no existe → POST /api/chat/session → Supabase crea registro en chat_sessions
   - session_id se guarda en localStorage para persistencia

3. **Flujo Conversacional:**
   - Bot envía mensaje de bienvenida
   - Bot solicita nombre del usuario
   - Usuario proporciona nombre → se actualiza en session
   - Bot muestra 5 Quick Reply options

4. **Procesamiento de Mensajes:**
   - Usuario selecciona Quick Reply o escribe texto libre
   - Frontend → POST /api/chat/message con {session_id, message, message_type}
   - Backend determina tipo de mensaje y procesa:
     - **Quick Reply:** Ejecuta lógica local (consultar servicios, info horarios, etc.)
     - **Texto Libre:** Envía a N8N webhook si está configurado, sino usa respuestas locales
   - Backend guarda mensaje en chat_messages table
   - Backend retorna respuesta del bot
   - Frontend renderiza respuesta con typing indicator

5. **Consulta de Servicios:**
   - Usuario selecciona "Ver servicios"
   - Frontend → GET /api/chat/services
   - Backend → Supabase query: `SELECT * FROM servicios WHERE activo = true`
   - Frontend renderiza Service Cards con imagen, nombre, descripción, precio, duración

6. **Consulta de Citas:**
   - Usuario selecciona "Consultar mis citas"
   - Bot solicita documento
   - Usuario proporciona documento
   - Frontend → POST /api/chat/appointments {documento}
   - Backend busca cliente por documento → busca citas asociadas
   - Frontend renderiza Appointment Cards con colores según estado

### Patrones de Arquitectura

- **MVC Pattern:** Separación entre UI (Chat Panel), lógica (Chat Manager), y datos (Supabase)
- **RESTful API:** Endpoints claros y semánticos para cada operación
- **Session Management:** Persistencia de sesión mediante localStorage + Supabase
- **Graceful Degradation:** Fallback a respuestas locales si N8N falla
- **Progressive Enhancement:** Funcionalidad básica sin JavaScript, mejorada con interactividad

## Components and Interfaces

### Frontend Components

#### 1. Chat Button Component

**Ubicación:** Reemplaza `#wa-btn` en frontend/index.html y frontend/reservas.html

**Responsabilidades:**
- Renderizar botón flotante con icono de chat
- Mostrar animación pulse continua
- Mostrar badge numérico después de 3 segundos
- Toggle del Chat Panel al hacer clic
- Cambiar icono entre chat y close según estado

**Interfaz:**
```javascript
class ChatButton {
  constructor(containerId)
  render()
  showBadge(count)
  hideBadge()
  toggle()
  open()
  close()
}
```

**Estilos CSS:**
- Background: `#2C4A2E` (forest green)
- Border: `2px solid #C9A961` (golden)
- Pulse animation: 2s infinite
- Badge: golden background, white text, scale animation

#### 2. Chat Panel Component

**Ubicación:** Nuevo elemento `<div id="chat-panel">` inyectado dinámicamente

**Responsabilidades:**
- Renderizar panel de chat con header, messages area, input field
- Adaptar layout según viewport (desktop: 400x600px floating, mobile: fullscreen)
- Scroll automático al último mensaje
- Mostrar typing indicator cuando bot está procesando
- Renderizar diferentes tipos de mensajes (text, quick_replies, service_cards, appointment_cards)

**Interfaz:**
```javascript
class ChatPanel {
  constructor(containerId)
  render()
  open()
  close()
  addMessage(message)
  addQuickReplies(options)
  addServiceCards(services)
  addAppointmentCards(appointments)
  showTypingIndicator()
  hideTypingIndicator()
  scrollToBottom()
  clearInput()
}
```

**Estructura HTML:**
```html
<div id="chat-panel" class="chat-panel">
  <div class="chat-header">
    <div class="chat-avatar">🌿</div>
    <div class="chat-info">
      <span class="chat-name">Serenità Spa</span>
      <span class="chat-status">● En línea</span>
    </div>
    <button class="chat-close">×</button>
  </div>
  <div class="chat-messages" id="chat-messages">
    <!-- Messages rendered here -->
  </div>
  <div class="chat-input-container">
    <input type="text" class="chat-input" placeholder="Escribe un mensaje...">
    <button class="chat-send">➤</button>
  </div>
</div>
```

#### 3. Chat Manager Component

**Ubicación:** frontend/js/chat.js

**Responsabilidades:**
- Gestionar estado de la conversación (session_id, user_name, message_history)
- Coordinar comunicación entre UI y Backend API
- Manejar localStorage para persistencia de sesión
- Procesar respuestas del bot y actualizar UI
- Implementar lógica de flujo conversacional
- Manejar errores y mostrar mensajes de fallback

**Interfaz:**
```javascript
class ChatManager {
  constructor()
  
  // Session management
  async initSession()
  getSessionId()
  setUserName(name)
  getUserName()
  
  // Message handling
  async sendMessage(text, messageType = 'text')
  async processQuickReply(option)
  async handleFreeText(text)
  
  // API calls
  async createSession()
  async sendMessageToAPI(message)
  async getServices()
  async getAppointments(documento)
  
  // Flow control
  startConversation()
  showMainMenu()
  handleServiceInquiry()
  handleAppointmentInquiry()
  handleScheduleInfo()
  handleGiftCertificates()
  
  // Utilities
  addMessageToHistory(message)
  getMessageHistory()
}
```

#### 4. Message Components

**Message Bubble:**
```javascript
function createMessageBubble(text, sender) {
  // sender: 'bot' | 'user'
  // Returns HTML element with appropriate styling
}
```

**Quick Reply Buttons:**
```javascript
function createQuickReplies(options) {
  // options: Array<{text: string, value: string}>
  // Returns container with clickable buttons
}
```

**Service Card:**
```javascript
function createServiceCard(service) {
  // service: {nombre, descripcion, precio, duracion_min, imagen_url}
  // Returns card with image, details, and optional "Reservar" button
}
```

**Appointment Card:**
```javascript
function createAppointmentCard(appointment) {
  // appointment: {servicio_nombre, fecha, hora_inicio, estado}
  // Returns card with color-coded status badge
}
```

**Typing Indicator:**
```javascript
function createTypingIndicator() {
  // Returns animated three-dot indicator
}
```

### Backend Components

#### 1. Chat Routes Module

**Ubicación:** backend/routes/chat.js

**Endpoints:**

**POST /api/chat/session**
- Crea nueva sesión de chat
- Request: `{}`
- Response: `{session_id, started_at}`

**POST /api/chat/message**
- Procesa mensaje del usuario y retorna respuesta del bot
- Request: `{session_id, user_name?, message, message_type}`
- Response: `{bot_response, quick_replies?, cards?}`

**GET /api/chat/services**
- Retorna lista de servicios activos
- Response: `Array<Service>`

**POST /api/chat/appointments**
- Busca citas por documento
- Request: `{documento}`
- Response: `{appointments: Array<Appointment>}`

**Interfaz del Router:**
```javascript
const express = require('express')
const router = express.Router()

router.post('/session', createSession)
router.post('/message', processMessage)
router.get('/services', getServices)
router.post('/appointments', getAppointments)

module.exports = router
```

#### 2. N8N Integration Service

**Ubicación:** backend/services/n8n.js (nuevo archivo)

**Responsabilidades:**
- Enviar mensajes de texto libre a N8N webhook
- Manejar timeouts y errores
- Retornar respuestas formateadas

**Interfaz:**
```javascript
class N8NService {
  constructor(webhookUrl)
  
  async sendMessage(sessionId, userName, message)
  // Returns: {response: string} or throws error
  
  isConfigured()
  // Returns: boolean
}
```

#### 3. Local Response Service

**Ubicación:** backend/services/localResponses.js (nuevo archivo)

**Responsabilidades:**
- Proporcionar respuestas de fallback cuando N8N no está disponible
- Reconocer keywords comunes (precio, horario, ubicación, reserva)
- Retornar respuestas contextuales

**Interfaz:**
```javascript
class LocalResponseService {
  getResponse(message)
  // Returns: string
  
  recognizeIntent(message)
  // Returns: 'service_inquiry' | 'schedule' | 'location' | 'booking' | 'unknown'
}
```

### External Interfaces

#### Supabase Tables

**chat_sessions:**
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID UNIQUE NOT NULL,
  user_name TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

**chat_messages:**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(session_id),
  sender TEXT NOT NULL, -- 'user' | 'bot'
  content TEXT NOT NULL,
  message_type TEXT, -- 'text' | 'quick_reply' | 'service_card' | 'appointment_card'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

**clientes (modificación):**
```sql
ALTER TABLE clientes ADD COLUMN documento TEXT;
CREATE INDEX idx_clientes_documento ON clientes(documento);
```

#### N8N Webhook Interface

**Request Format:**
```json
{
  "session_id": "uuid",
  "user_name": "string",
  "message": "string",
  "timestamp": "ISO8601"
}
```

**Expected Response Format:**
```json
{
  "response": "string",
  "suggestions": ["string"] // optional
}
```

## Data Models

### Session Model

```typescript
interface ChatSession {
  id: string              // UUID primary key
  session_id: string      // UUID unique identifier
  user_name: string | null
  started_at: Date
  last_activity: Date
  metadata: {
    page_url?: string
    user_agent?: string
    conversation_state?: string
  }
}
```

### Message Model

```typescript
interface ChatMessage {
  id: string              // UUID primary key
  session_id: string      // Foreign key to chat_sessions
  sender: 'user' | 'bot'
  content: string
  message_type: 'text' | 'quick_reply' | 'service_card' | 'appointment_card'
  created_at: Date
  metadata: {
    quick_reply_value?: string
    service_id?: string
    appointment_id?: string
  }
}
```

### Service Model (existing)

```typescript
interface Service {
  id: string
  nombre: string
  descripcion: string
  precio: number
  duracion_min: number
  buffer_min: number
  imagen_url: string
  activo: boolean
  categoria: string
}
```

### Appointment Model (existing with join)

```typescript
interface Appointment {
  id: string
  cliente_id: string
  servicio_id: string
  fecha: string          // YYYY-MM-DD
  hora_inicio: string    // HH:MM
  hora_fin: string       // HH:MM
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada'
  origen: string
  notas: string
  duracion_total: number
  
  // Joined data
  servicio_nombre: string
  cliente_nombre: string
  cliente_telefono: string
}
```

### Cliente Model (modified)

```typescript
interface Cliente {
  id: string
  nombre: string
  telefono: string
  email: string
  fecha_registro: Date
  origen: string
  documento: string | null  // NEW FIELD
}
```

## Error Handling

### Error Categories

1. **Network Errors**
   - Supabase connection failures
   - N8N webhook timeouts
   - API request failures

2. **Validation Errors**
   - Invalid documento format
   - Missing required fields
   - Invalid session_id

3. **Business Logic Errors**
   - No appointments found for documento
   - No services available
   - Session expired

### Error Handling Strategy

**Frontend:**
```javascript
try {
  const response = await chatManager.sendMessage(text)
  chatPanel.addMessage(response)
} catch (error) {
  if (error.type === 'network') {
    chatPanel.addMessage({
      sender: 'bot',
      content: 'Lo siento, hay un problema de conexión. Por favor intenta de nuevo.'
    })
  } else if (error.type === 'validation') {
    chatPanel.addMessage({
      sender: 'bot',
      content: error.message
    })
  } else {
    chatPanel.addMessage({
      sender: 'bot',
      content: 'Ocurrió un error inesperado. ¿Puedes intentar de nuevo?'
    })
  }
}
```

**Backend:**
```javascript
// Graceful degradation for N8N
async function processMessage(req, res) {
  try {
    if (n8nService.isConfigured()) {
      try {
        const response = await n8nService.sendMessage(...)
        return res.json({bot_response: response})
      } catch (n8nError) {
        // Fallback to local responses without notifying user
        const localResponse = localResponseService.getResponse(message)
        return res.json({bot_response: localResponse})
      }
    } else {
      const localResponse = localResponseService.getResponse(message)
      return res.json({bot_response: localResponse})
    }
  } catch (error) {
    res.status(500).json({
      error: 'Error procesando mensaje',
      message: 'Por favor intenta de nuevo'
    })
  }
}
```

### Error Messages

Todos los mensajes de error deben mantener el tono amigable y profesional del spa:

- **Connection Error:** "Lo siento, hay un problema de conexión. Por favor intenta de nuevo en un momento."
- **No Appointments Found:** "No encontré citas asociadas a ese documento. ¿Quieres hacer una reserva?"
- **Invalid Documento:** "Por favor ingresa un número de documento válido (solo números y letras)."
- **Session Error:** "Hubo un problema con tu sesión. Por favor recarga la página."
- **Generic Error:** "Ocurrió un error inesperado. ¿Puedes intentar de nuevo?"

## Testing Strategy

### Unit Tests

**Frontend Unit Tests (Jest + Testing Library):**

1. **Chat Button Tests:**
   - Renders with correct styles
   - Shows badge after 3 seconds
   - Toggles panel on click
   - Changes icon when panel is open

2. **Chat Panel Tests:**
   - Renders with correct structure
   - Adapts layout based on viewport
   - Scrolls to bottom when new message added
   - Shows/hides typing indicator correctly

3. **Chat Manager Tests:**
   - Creates session on initialization
   - Stores session_id in localStorage
   - Sends messages to correct API endpoint
   - Handles API errors gracefully
   - Processes quick replies correctly

4. **Message Component Tests:**
   - Renders user messages with correct styling
   - Renders bot messages with correct styling
   - Renders quick reply buttons
   - Renders service cards with all fields
   - Renders appointment cards with color-coded status

**Backend Unit Tests (Jest):**

1. **Chat Routes Tests:**
   - POST /api/chat/session creates session in Supabase
   - POST /api/chat/message stores message in database
   - GET /api/chat/services returns only active services
   - POST /api/chat/appointments finds cliente by documento
   - POST /api/chat/appointments returns joined appointment data

2. **N8N Service Tests:**
   - Sends correct payload to webhook
   - Handles timeout errors
   - Returns formatted response
   - isConfigured() returns correct boolean

3. **Local Response Service Tests:**
   - Recognizes "precio" keyword
   - Recognizes "horario" keyword
   - Recognizes "ubicación" keyword
   - Returns appropriate response for each intent
   - Returns generic response for unknown intents

### Integration Tests

1. **End-to-End Chat Flow:**
   - User opens chat → session created → welcome message displayed
   - User provides name → name stored → main menu displayed
   - User selects "Ver servicios" → services fetched → cards displayed
   - User selects "Consultar citas" → documento requested → appointments displayed

2. **N8N Integration:**
   - Free text message sent to N8N → response received → displayed to user
   - N8N timeout → fallback to local response → user sees response

3. **Supabase Integration:**
   - Session created in chat_sessions table
   - Messages stored in chat_messages table
   - Services fetched from servicios table
   - Appointments fetched with JOIN on clientes and servicios

### Manual Testing Checklist

- [ ] Chat button appears on index.html and reservas.html
- [ ] Badge appears after 3 seconds
- [ ] Panel opens with smooth animation
- [ ] Panel is responsive (test on mobile and desktop)
- [ ] Typing indicator shows when bot is processing
- [ ] Quick reply buttons are clickable
- [ ] Service cards display images correctly
- [ ] Appointment cards show correct color for each status
- [ ] Documento lookup works correctly
- [ ] N8N integration works (if configured)
- [ ] Fallback responses work when N8N is down
- [ ] Session persists across page reloads
- [ ] Error messages are friendly and helpful
- [ ] All animations are smooth
- [ ] Colors match spa brand palette

### Performance Testing

- Chat panel should open in < 300ms
- Messages should render in < 100ms
- API responses should return in < 500ms
- Typing indicator should appear within 100ms
- Service cards should load images progressively
- No memory leaks after 100+ messages

## Implementation Plan

### Phase 1: Database Setup

1. Create chat_sessions table
2. Create chat_messages table
3. Add documento column to clientes table
4. Create indexes for performance

### Phase 2: Backend API

1. Create backend/routes/chat.js
2. Implement POST /api/chat/session
3. Implement POST /api/chat/message
4. Implement GET /api/chat/services
5. Implement POST /api/chat/appointments
6. Create backend/services/n8n.js
7. Create backend/services/localResponses.js
8. Register routes in backend/server.js

### Phase 3: Frontend Components

1. Create frontend/js/chat.js
2. Implement ChatButton class
3. Implement ChatPanel class
4. Implement ChatManager class
5. Implement message rendering functions
6. Add CSS styles to frontend/css/spa.css

### Phase 4: Integration

1. Replace WhatsApp button in frontend/index.html
2. Replace WhatsApp button in frontend/reservas.html
3. Test session creation and persistence
4. Test message flow
5. Test service inquiry
6. Test appointment inquiry

### Phase 5: N8N Integration

1. Configure N8N_CHAT_WEBHOOK environment variable
2. Test N8N webhook integration
3. Test fallback to local responses
4. Verify error handling

### Phase 6: Testing & Polish

1. Write unit tests
2. Write integration tests
3. Manual testing on multiple devices
4. Performance optimization
5. Accessibility review
6. Final polish and animations

## File Structure

```
backend/
├── routes/
│   ├── bookings.js (existing)
│   ├── services.js (existing)
│   ├── contact.js (existing)
│   └── chat.js (NEW)
├── services/
│   ├── n8n.js (NEW)
│   └── localResponses.js (NEW)
├── lib/
│   └── supabase.js (existing)
└── server.js (MODIFY - register chat routes)

frontend/
├── js/
│   ├── main.js (existing)
│   ├── services.js (existing)
│   ├── bookings.js (existing)
│   ├── animations.js (existing)
│   └── chat.js (NEW)
├── css/
│   └── spa.css (MODIFY - add chat styles)
├── index.html (MODIFY - replace WhatsApp button)
└── reservas.html (MODIFY - replace WhatsApp button)

database/
└── migrations/
    ├── 001_create_chat_tables.sql (NEW)
    └── 002_add_documento_to_clientes.sql (NEW)
```

## Environment Variables

```env
# Existing
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
WHATSAPP_NUMBER=573001234567

# New
N8N_CHAT_WEBHOOK=https://your-n8n-instance.com/webhook/chat
```

## Deployment Considerations

### Vercel Deployment

- All environment variables must be configured in Vercel dashboard
- N8N_CHAT_WEBHOOK is optional - system will work without it
- Ensure Supabase connection is stable
- Test chat functionality in preview deployments before production

### Database Migrations

Run migrations in this order:
1. Create chat_sessions table
2. Create chat_messages table
3. Add documento column to clientes

### Rollback Plan

If issues arise:
1. Revert frontend/index.html and frontend/reservas.html to restore WhatsApp button
2. Disable chat routes in backend/server.js
3. Chat tables can remain in database (no data loss)

## Security Considerations

- Session IDs are UUIDs (not guessable)
- No sensitive data stored in localStorage (only session_id)
- Input sanitization on all user messages
- Rate limiting on API endpoints (prevent spam)
- N8N webhook URL should be kept secret
- Supabase RLS policies should restrict access to chat tables
- CORS configured to only allow requests from spa domain

## Accessibility

- Chat button has aria-label
- Chat panel has proper ARIA roles
- Keyboard navigation supported (Tab, Enter, Escape)
- Screen reader announcements for new messages
- Color contrast meets WCAG AA standards
- Focus management when panel opens/closes

## Future Enhancements

- Admin panel to view and respond to conversations
- Real-time updates using Supabase Realtime
- File upload support (images for consultation)
- Voice message support
- Multi-language support
- Sentiment analysis on conversations
- Automated appointment reminders via chat
- Integration with calendar systems
- Chat analytics dashboard

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** Kiro AI Assistant  
**Status:** Ready for Implementation