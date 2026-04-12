# Requirements Document

## Introduction

Sistema de chat interno integrado en la página web de Serenità Spa que reemplaza el botón flotante de WhatsApp actual. El sistema permite a los usuarios interactuar con un chatbot conversacional para consultar servicios, reservar citas, verificar sus reservas existentes y obtener información del spa. El chat se integra con N8N para respuestas de texto libre y con Supabase para consultas estructuradas de servicios y citas.

## Glossary

- **Chat_System**: Sistema completo de chat interno que incluye UI, lógica conversacional y backend
- **Chat_Button**: Botón flotante que abre el panel de chat
- **Chat_Panel**: Panel deslizante que contiene la interfaz de conversación
- **Bot**: Asistente virtual que responde a las consultas del usuario
- **User**: Cliente o visitante del sitio web que interactúa con el chat
- **N8N_Webhook**: Endpoint de N8N para procesar mensajes de texto libre
- **Supabase**: Base de datos que contiene servicios, clientes y citas
- **Session**: Conversación individual almacenada en la base de datos
- **Message**: Mensaje individual dentro de una sesión de chat
- **Quick_Reply**: Botón de opción rápida clickeable en el chat
- **Service_Card**: Tarjeta visual que muestra información de un servicio
- **Appointment_Card**: Tarjeta visual que muestra información de una cita con estado en colores
- **Typing_Indicator**: Animación de tres puntos que indica que el bot está procesando
- **Badge**: Indicador numérico en el botón de chat que invita a interactuar
- **WhatsApp_Button**: Botón flotante actual de WhatsApp que será reemplazado

## Requirements

### Requirement 1: Reemplazo del Botón de WhatsApp

**User Story:** Como visitante del sitio web, quiero ver un botón de chat moderno en lugar del botón de WhatsApp, para que pueda acceder fácilmente al sistema de chat interno.

#### Acceptance Criteria

1. THE Chat_Button SHALL replace the existing WhatsApp_Button in frontend/index.html
2. THE Chat_Button SHALL replace the existing WhatsApp_Button in frontend/reservas.html
3. THE Chat_Button SHALL have a forest green background color (#2C4A2E)
4. THE Chat_Button SHALL have a golden border (#C9A961)
5. THE Chat_Button SHALL display a pulse animation continuously
6. WHEN 3 seconds have elapsed after page load, THE Chat_Button SHALL display a Badge with number "1"
7. WHEN the User clicks the Chat_Button, THE Chat_Panel SHALL open with a slide-in animation from bottom-right
8. WHEN the Chat_Panel is open and the User clicks the Chat_Button, THE Chat_Panel SHALL close with a slide-out animation

### Requirement 2: Panel de Chat Responsivo

**User Story:** Como usuario, quiero que el panel de chat se adapte a mi dispositivo, para que pueda chatear cómodamente desde móvil o desktop.

#### Acceptance Criteria

1. WHILE the viewport width is greater than 768px, THE Chat_Panel SHALL appear as a floating panel in the bottom-right corner with dimensions 400px width and 600px height
2. WHILE the viewport width is 768px or less, THE Chat_Panel SHALL occupy the full screen from bottom with slide-up animation
3. THE Chat_Panel SHALL have a header with spa avatar emoji 🌿, name "Serenità Spa", and green online status indicator
4. THE Chat_Panel SHALL have a scrollable messages area with cream background (#FAF8F5)
5. THE Chat_Panel SHALL have a fixed input field at the bottom with send button
6. THE Chat_Panel SHALL display Bot messages in golden bubbles (#C9A961) aligned to the left
7. THE Chat_Panel SHALL display User messages in forest green bubbles (#2C4A2E) aligned to the right
8. THE Chat_Panel SHALL maintain the luxury spa color palette throughout

### Requirement 3: Indicador de Escritura

**User Story:** Como usuario, quiero ver cuando el bot está procesando mi mensaje, para que sepa que mi consulta está siendo atendida.

#### Acceptance Criteria

1. WHEN the Bot is processing a User message, THE Chat_Panel SHALL display a Typing_Indicator
2. THE Typing_Indicator SHALL consist of three animated dots bouncing vertically
3. THE Typing_Indicator SHALL appear in a golden bubble aligned to the left
4. WHEN the Bot response is ready, THE Typing_Indicator SHALL disappear
5. THE Typing_Indicator SHALL be visible for a minimum of 500 milliseconds

### Requirement 4: Flujo Conversacional Inicial

**User Story:** Como usuario nuevo, quiero ser saludado y guiado por el bot, para que pueda entender qué opciones tengo disponibles.

#### Acceptance Criteria

1. WHEN the Chat_Panel opens for the first time, THE Bot SHALL send a greeting message immediately
2. WHEN the greeting is displayed, THE Bot SHALL request the User's name
3. WHEN the User provides their name, THE Bot SHALL acknowledge the name and display 5 Quick_Reply options
4. THE Quick_Reply options SHALL be: "Ver servicios", "Reservar", "Consultar mis citas", "Horarios y ubicación", "Certificados de regalo"
5. THE Quick_Reply buttons SHALL be clickeable and styled with golden borders
6. WHEN a Quick_Reply is clicked, THE Bot SHALL process the selected option

### Requirement 5: Consulta de Servicios

**User Story:** Como usuario, quiero ver los servicios disponibles en el chat, para que pueda conocer las opciones sin salir de la conversación.

#### Acceptance Criteria

1. WHEN the User selects "Ver servicios" option, THE Chat_System SHALL query Supabase servicios table
2. THE Chat_System SHALL filter only services where activo equals true
3. WHEN services are retrieved, THE Bot SHALL display each service as a Service_Card
4. THE Service_Card SHALL include service name, description, price, and duration
5. THE Service_Card SHALL include the service image if imagen_url is available
6. WHEN no services are available, THE Bot SHALL display a message indicating no services are currently available
7. THE Bot SHALL provide a Quick_Reply option to "Reservar" after displaying services

### Requirement 6: Integración con Sistema de Reservas

**User Story:** Como usuario, quiero poder iniciar una reserva desde el chat, para que pueda agendar mi cita fácilmente.

#### Acceptance Criteria

1. WHEN the User selects "Reservar" option, THE Bot SHALL provide a link to the existing reservas.html page
2. THE Bot SHALL display a message explaining that the reservation system will open
3. THE link SHALL open in the same browser tab
4. THE Bot SHALL provide a Quick_Reply option to return to main menu

### Requirement 7: Consulta de Citas por Documento

**User Story:** Como cliente existente, quiero consultar mis citas usando mi documento, para que pueda verificar mis reservas.

#### Acceptance Criteria

1. WHEN the User selects "Consultar mis citas" option, THE Bot SHALL request the User's documento or cédula
2. WHEN the User provides a documento, THE Chat_System SHALL query Supabase clientes table for matching documento
3. IF no cliente is found with the provided documento, THEN THE Bot SHALL display a message indicating no appointments were found
4. WHEN a cliente is found, THE Chat_System SHALL query Supabase citas table for all appointments linked to that cliente_id
5. THE Chat_System SHALL join citas with servicios table to retrieve service details
6. WHEN appointments are found, THE Bot SHALL display each appointment as an Appointment_Card
7. THE Appointment_Card SHALL include service name, date, time, and status
8. THE Appointment_Card SHALL display status with color coding: pendiente (yellow), confirmada (green), completada (blue), cancelada (red)
9. WHEN no appointments are found for the cliente, THE Bot SHALL display a message indicating no appointments exist

### Requirement 8: Información de Horarios y Ubicación

**User Story:** Como usuario, quiero conocer los horarios y ubicación del spa, para que pueda planificar mi visita.

#### Acceptance Criteria

1. WHEN the User selects "Horarios y ubicación" option, THE Bot SHALL display the spa operating hours
2. THE Bot SHALL display the spa physical address
3. THE Bot SHALL display contact phone number
4. THE Bot SHALL provide a Quick_Reply option to return to main menu
5. THE information SHALL be formatted in a readable message bubble

### Requirement 9: Información de Certificados de Regalo

**User Story:** Como usuario, quiero saber sobre certificados de regalo, para que pueda considerar comprar uno.

#### Acceptance Criteria

1. WHEN the User selects "Certificados de regalo" option, THE Bot SHALL display information about gift certificates
2. THE Bot SHALL explain how to purchase gift certificates
3. THE Bot SHALL provide contact information for gift certificate inquiries
4. THE Bot SHALL provide a Quick_Reply option to return to main menu

### Requirement 10: Integración con N8N para Texto Libre

**User Story:** Como usuario, quiero escribir preguntas en texto libre, para que pueda obtener respuestas personalizadas a mis consultas específicas.

#### Acceptance Criteria

1. WHEN the User sends a message that is not a Quick_Reply selection, THE Chat_System SHALL identify it as free text
2. WHERE the N8N_CHAT_WEBHOOK environment variable is configured, THE Chat_System SHALL send the message to the N8N_Webhook
3. THE Chat_System SHALL send user message, session_id, and user name to N8N_Webhook
4. WHEN N8N_Webhook returns a response, THE Bot SHALL display the response to the User
5. IF the N8N_Webhook request fails, THEN THE Chat_System SHALL use local intelligent responses
6. WHERE the N8N_CHAT_WEBHOOK environment variable is not configured, THE Chat_System SHALL use local intelligent responses
7. THE local intelligent responses SHALL recognize common keywords like "precio", "horario", "ubicación", "reserva"

### Requirement 11: Almacenamiento de Sesiones de Chat

**User Story:** Como administrador del spa, quiero que las conversaciones se guarden en la base de datos, para que pueda revisar las interacciones con los clientes.

#### Acceptance Criteria

1. WHEN a User opens the Chat_Panel for the first time, THE Chat_System SHALL create a new Session in Supabase
2. THE Session SHALL include session_id (uuid), user_name, started_at timestamp, and last_activity timestamp
3. WHEN a Message is sent by User or Bot, THE Chat_System SHALL store the Message in Supabase
4. THE Message SHALL include message_id (uuid), session_id, sender (user or bot), content, and timestamp
5. THE Chat_System SHALL update Session last_activity timestamp with each new Message
6. THE Session SHALL persist across page reloads using browser localStorage with session_id

### Requirement 12: Tabla de Clientes con Campo Documento

**User Story:** Como administrador del spa, quiero que los clientes tengan un campo de documento, para que puedan consultar sus citas fácilmente.

#### Acceptance Criteria

1. THE Supabase clientes table SHALL have a documento column of type text
2. THE documento column SHALL be nullable to maintain backward compatibility
3. WHEN a new cliente is created through the booking system, THE Chat_System SHALL optionally store the documento if provided
4. THE documento field SHALL accept alphanumeric characters
5. THE documento field SHALL be indexed for fast lookup queries

### Requirement 13: Estilos y Animaciones Premium

**User Story:** Como usuario, quiero que el chat tenga animaciones suaves y elegantes, para que la experiencia sea acorde al diseño luxury del spa.

#### Acceptance Criteria

1. THE Chat_Panel SHALL slide in with a cubic-bezier easing function over 300 milliseconds
2. THE Chat_Panel SHALL slide out with a cubic-bezier easing function over 250 milliseconds
3. THE Message bubbles SHALL fade in with opacity transition over 200 milliseconds
4. THE Quick_Reply buttons SHALL have hover effects with color transition over 200 milliseconds
5. THE Typing_Indicator dots SHALL bounce with staggered animation delays
6. THE Badge SHALL pulse with scale animation over 1000 milliseconds
7. THE Chat_Button pulse animation SHALL repeat infinitely with 2000 milliseconds duration
8. ALL animations SHALL use CSS transitions or keyframes for performance

### Requirement 14: Endpoints de Backend para Chat

**User Story:** Como desarrollador, quiero endpoints de API para el chat, para que el frontend pueda comunicarse con el backend.

#### Acceptance Criteria

1. THE Chat_System SHALL provide a POST /api/chat/message endpoint
2. THE POST /api/chat/message endpoint SHALL accept session_id, user_name, message, and message_type parameters
3. THE POST /api/chat/message endpoint SHALL return bot response and updated session information
4. THE Chat_System SHALL provide a GET /api/chat/services endpoint that queries Supabase servicios table
5. THE Chat_System SHALL provide a POST /api/chat/appointments endpoint that accepts documento parameter
6. THE POST /api/chat/appointments endpoint SHALL query Supabase for cliente by documento and return associated citas
7. IF N8N_CHAT_WEBHOOK is configured, THE POST /api/chat/message endpoint SHALL forward free text messages to N8N
8. THE Chat_System SHALL provide a POST /api/chat/session endpoint to create new sessions

### Requirement 15: Manejo de Errores y Respuestas de Fallback

**User Story:** Como usuario, quiero recibir mensajes claros cuando algo falla, para que entienda qué sucedió y qué puedo hacer.

#### Acceptance Criteria

1. IF a Supabase query fails, THEN THE Bot SHALL display a friendly error message
2. IF the N8N_Webhook is unreachable, THEN THE Chat_System SHALL use local responses without notifying the User of the failure
3. IF the User provides invalid documento format, THEN THE Bot SHALL request the documento again with format guidance
4. IF the session cannot be created, THEN THE Chat_Panel SHALL display an error message and disable input
5. THE error messages SHALL maintain the friendly and professional tone of the spa brand
6. THE Bot SHALL provide Quick_Reply options to retry or return to main menu after errors

### Requirement 16: Archivos a Crear y Modificar

**User Story:** Como desarrollador, quiero una estructura clara de archivos, para que pueda implementar el sistema de manera organizada.

#### Acceptance Criteria

1. THE Chat_System SHALL create frontend/js/chat.js file with all client-side chat logic
2. THE Chat_System SHALL modify frontend/css/spa.css to add chat panel styles
3. THE Chat_System SHALL modify frontend/index.html to replace WhatsApp_Button with Chat_Button
4. THE Chat_System SHALL modify frontend/reservas.html to replace WhatsApp_Button with Chat_Button
5. THE Chat_System SHALL create backend/routes/chat.js file with all chat endpoints
6. THE Chat_System SHALL modify backend/server.js to register chat routes
7. THE Chat_System SHALL create database migration SQL for chat_sessions and chat_messages tables
8. THE Chat_System SHALL create database migration SQL to add documento column to clientes table

