# MIGRATION_CONTEXT — SpaOhDiosas (Landing / Web Clientes)

## Lógicas identificadas
- Sistema de reservas con asignación automática de empleada (menor carga del día)
- Disponibilidad de slots por servicio y fecha (considera duracion_min + buffer_min)
- Verificación de concurrencia (re-check antes de insertar cita)
- Chat con bot IA vía N8N webhook (sesiones en Supabase, fallback graceful)
- Formulario de contacto (inserta en tabla `contactos` — OJO: tabla no listada en CLAUDE.md, puede fallar)
- Configuración dinámica del spa (teléfono, dirección, horarios desde BD)
- Rate limiting por categoría: general (100/15min), chat (20/1h), bookings (10/15min)
- Admin token para endpoints protegidos (header `x-admin-token`)
- Caché HTTP en endpoints públicos

## Rutas API actuales
- `GET  /api/services` — servicios activos (caché 5min)
- `GET  /api/services/:id` — servicio por ID
- `POST /api/services` — crear servicio (sin protección admin en esta versión)
- `GET  /api/slots?servicio=id&fecha=YYYY-MM-DD` — slots disponibles del día
- `POST /api/bookings` — crear reserva con asignación automática
- `GET  /api/bookings/all` — todas las citas (requiere x-admin-token)
- `PATCH /api/bookings/:id/status` — cambiar estado cita (requiere x-admin-token)
- `POST /api/contact` — formulario de contacto
- `POST /api/chat/session` — crear sesión de chat
- `POST /api/chat/message` — enviar mensaje al bot N8N
- `GET  /api/chat/services` — servicios activos (para el chat)
- `POST /api/chat/appointments` — citas de un cliente por documento
- `GET  /api/testimonials` — testimonios (caché 5min)
- `GET  /api/config` — configuración del negocio (caché 10min)
- `GET  /api/health` — health check

## Variables de entorno requeridas
- `SUPABASE_URL` — URL del proyecto Supabase
- `SUPABASE_SERVICE_KEY` — service role key (nombre actual en .env y en código)
- `N8N_CHAT_WEBHOOK` — URL del webhook de N8N para el chatbot
- `ADMIN_TOKEN` — token secreto para endpoints de admin
- `PORT` — puerto local (default 3000)
- `FRONTEND_URL` — URL del frontend para CORS (default '*')

> **ATENCIÓN**: La variable de la service role key se llama `SUPABASE_SERVICE_KEY` en el .env actual.
> El nuevo `config/supabase.js` acepta `SUPABASE_SERVICE_ROLE_KEY` con fallback a `SUPABASE_SERVICE_KEY`.
> En Vercel Dashboard debe existir alguna de las dos.

## Conexiones externas
- **Supabase (service role)**: tablas citas, clientes, servicios, empleados, empleado_servicios, bloqueos, chat_sessions, testimonios, configuracion, contactos
- **N8N**: webhook en `N8N_CHAT_WEBHOOK` (POST, payload: sessionId, userName, chatInput, mensaje, messageType, action)
- **Sin Evolution API** en este proyecto

## Stack actual → Stack objetivo
- **Antes**: CommonJS (`require`), backend en `backend/server.js`, `api/index.js` autónomo
- **Después**: ES Modules (`import/export`), `server.js` en raíz, `api/index.js` solo importa y reexporta
- **Node**: >=18 → 24.x
- **Nuevos directorios**: `config/`, `routes/`, `services/`
- **Conservados**: `backend/` (no eliminar), `frontend/` (no mover ni renombrar)

## Diseño a preservar
- Paleta: fondo oscuro (`#1a1a2e`, `#16213e`), acentos dorados/marfil
- Tipografías: Cormorant Garamond (serif) + Inter (sans-serif) via Google Fonts
- Animaciones: scroll reveal, glassmorphism navbar, WhatsApp flotante
- Páginas: `index.html`, `reservas.html`, `servicios.html`, `chat.html`

## Notas de ambigüedad
1. La tabla `contactos` no aparece en el schema del CLAUDE.md — el endpoint `POST /api/contact` puede fallar en prod. Se migra tal cual.
2. `api/index.js` actual es un Express app autónomo (no importa `backend/server.js`). El nuevo sí importa `server.js`.
3. El frontend ya usa ES Modules (`export`/`import`) — no requiere cambios.
