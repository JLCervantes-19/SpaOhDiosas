# Implementation Plan: Sistema de Chat Interno N8N

## Overview

Este plan implementa un sistema de chat interno completo que reemplaza el botón de WhatsApp existente. El sistema incluye un chatbot conversacional con integración a N8N para respuestas inteligentes, consulta de servicios y citas desde Supabase, y almacenamiento de conversaciones. La implementación sigue un enfoque incremental: primero la base de datos, luego el backend, después el frontend, y finalmente la integración completa.

## Tasks

- [x] 1. Configurar base de datos y migraciones
  - [x] 1.1 Ejecutar migración para crear tablas de chat
    - Ejecutar `database/migrations/001_create_chat_tables.sql` en Supabase
    - Verificar que las tablas `chat_sessions` y `chat_messages` se crearon correctamente
    - Verificar que los índices y constraints están activos
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [x] 1.2 Ejecutar migración para agregar campo documento a clientes
    - Ejecutar `database/migrations/002_add_documento_to_clientes.sql` en Supabase
    - Verificar que la columna `documento` existe en tabla `clientes`
    - Verificar que el índice `idx_clientes_documento` está creado
    - _Requirements: 12.1, 12.2, 12.5_

- [x] 2. Implementar servicios backend
  - [x] 2.1 Crear servicio de integración con N8N
    - Crear archivo `backend/services/n8n.js`
    - Implementar clase `N8NService` con métodos `sendMessage()` y `isConfigured()`
    - Manejar timeouts y errores de conexión con N8N webhook
    - Leer variable de entorno `N8N_CHAT_WEBHOOK`
    - _Requirements: 10.2, 10.3, 10.4, 10.6_
  
  - [x] 2.2 Crear servicio de respuestas locales de fallback
    - Crear archivo `backend/services/localResponses.js`
    - Implementar clase `LocalResponseService` con método `getResponse()`
    - Reconocer keywords: "precio", "horario", "ubicación", "reserva", "servicio"
    - Retornar respuestas contextuales en español
    - _Requirements: 10.5, 10.7, 15.2_

- [x] 3. Implementar endpoints de API de chat
  - [x] 3.1 Crear router de chat con endpoint de sesión
    - Crear archivo `backend/routes/chat.js`
    - Implementar POST `/api/chat/session` que crea registro en `chat_sessions`
    - Generar `session_id` como UUID
    - Retornar `{session_id, started_at}`
    - _Requirements: 14.8, 11.1_
  
  - [x] 3.2 Implementar endpoint de mensajes
    - Implementar POST `/api/chat/message` en `backend/routes/chat.js`
    - Aceptar parámetros: `session_id`, `user_name`, `message`, `message_type`
    - Guardar mensaje en tabla `chat_messages`
    - Actualizar `last_activity` en `chat_sessions`
    - Determinar si es quick_reply o texto libre
    - Integrar con N8NService para texto libre
    - Usar LocalResponseService como fallback
    - _Requirements: 14.1, 14.2, 14.3, 14.7, 10.2, 10.5_
  
  - [x] 3.3 Implementar endpoint de servicios
    - Implementar GET `/api/chat/services` en `backend/routes/chat.js`
    - Consultar tabla `servicios` con filtro `activo = true`
    - Retornar array de servicios con todos los campos
    - _Requirements: 14.4, 5.1, 5.2_
  
  - [x] 3.4 Implementar endpoint de consulta de citas
    - Implementar POST `/api/chat/appointments` en `backend/routes/chat.js`
    - Aceptar parámetro `documento`
    - Buscar cliente en tabla `clientes` por campo `documento`
    - Si existe cliente, buscar citas en tabla `citas` con JOIN a `servicios`
    - Retornar array de citas con información del servicio
    - _Requirements: 14.5, 14.6, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [x] 3.5 Registrar rutas de chat en server.js
    - Modificar `backend/server.js`
    - Importar `chatRouter` desde `./routes/chat`
    - Agregar `app.use('/api/chat', chatRouter)` antes de las rutas existentes
    - _Requirements: 16.6_

- [x] 4. Checkpoint - Verificar backend funcional
  - Probar cada endpoint con herramienta como Postman o curl
  - Verificar que POST /api/chat/session crea registros en Supabase
  - Verificar que POST /api/chat/message guarda mensajes
  - Verificar que GET /api/chat/services retorna servicios activos
  - Verificar que POST /api/chat/appointments encuentra citas por documento
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implementar componentes frontend de chat
  - [x] 5.1 Crear clase ChatButton
    - Crear archivo `frontend/js/chat.js`
    - Implementar clase `ChatButton` con métodos: `render()`, `showBadge()`, `toggle()`, `open()`, `close()`
    - Renderizar botón flotante con icono de chat
    - Implementar animación pulse continua
    - Mostrar badge "1" después de 3 segundos
    - Cambiar icono entre chat y close según estado del panel
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [~] 5.2 Crear clase ChatPanel
    - Implementar clase `ChatPanel` en `frontend/js/chat.js`
    - Métodos: `render()`, `open()`, `close()`, `addMessage()`, `addQuickReplies()`, `addServiceCards()`, `addAppointmentCards()`, `showTypingIndicator()`, `hideTypingIndicator()`, `scrollToBottom()`
    - Renderizar estructura HTML: header con avatar 🌿, área de mensajes, input field
    - Implementar layout responsivo: desktop (400x600px floating), mobile (fullscreen)
    - Implementar animaciones de slide-in y slide-out
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 13.1, 13.2_
  
  - [~] 5.3 Crear funciones de renderizado de mensajes
    - Implementar `createMessageBubble(text, sender)` en `frontend/js/chat.js`
    - Implementar `createQuickReplies(options)` con botones clickeables
    - Implementar `createServiceCard(service)` con imagen, nombre, descripción, precio, duración
    - Implementar `createAppointmentCard(appointment)` con colores según estado
    - Implementar `createTypingIndicator()` con animación de tres puntos
    - _Requirements: 2.6, 2.7, 4.5, 5.4, 5.5, 7.7, 7.8, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [~] 5.4 Crear clase ChatManager para lógica de negocio
    - Implementar clase `ChatManager` en `frontend/js/chat.js`
    - Métodos de sesión: `initSession()`, `getSessionId()`, `setUserName()`, `getUserName()`
    - Métodos de mensajes: `sendMessage()`, `processQuickReply()`, `handleFreeText()`
    - Métodos de API: `createSession()`, `sendMessageToAPI()`, `getServices()`, `getAppointments()`
    - Métodos de flujo: `startConversation()`, `showMainMenu()`, `handleServiceInquiry()`, `handleAppointmentInquiry()`, `handleScheduleInfo()`, `handleGiftCertificates()`
    - Implementar persistencia de session_id en localStorage
    - _Requirements: 11.6, 4.1, 4.2, 4.3, 4.4, 4.6, 5.1, 6.1, 7.1, 7.2, 8.1, 9.1_
  
  - [~] 5.5 Implementar manejo de errores en frontend
    - Agregar try-catch en todos los métodos async de ChatManager
    - Mostrar mensajes de error amigables en el chat
    - Implementar lógica de retry para errores de red
    - Mantener tono profesional y amigable en mensajes de error
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [ ] 6. Agregar estilos CSS para el chat
  - [~] 6.1 Agregar estilos del botón de chat
    - Modificar `frontend/css/spa.css`
    - Agregar estilos para `.chat-button` con background `#2C4A2E` y border `#C9A961`
    - Agregar keyframes para animación pulse (2s infinite)
    - Agregar estilos para `.chat-badge` con animación scale
    - Agregar estilos para hover y active states
    - _Requirements: 1.3, 1.4, 1.5, 13.6, 13.7_
  
  - [~] 6.2 Agregar estilos del panel de chat
    - Agregar estilos para `.chat-panel` con posicionamiento fixed
    - Implementar media query para mobile (fullscreen) y desktop (400x600px)
    - Agregar estilos para `.chat-header` con avatar y status indicator
    - Agregar estilos para `.chat-messages` con background cream `#FAF8F5`
    - Agregar estilos para `.chat-input-container` con input y botón send
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.8_
  
  - [~] 6.3 Agregar estilos de burbujas de mensajes
    - Agregar estilos para `.message-bubble.bot` con background golden `#C9A961`
    - Agregar estilos para `.message-bubble.user` con background green `#2C4A2E`
    - Agregar animación fade-in para mensajes (200ms)
    - Agregar estilos para quick-reply buttons con hover effects
    - _Requirements: 2.6, 2.7, 13.3, 13.4_
  
  - [~] 6.4 Agregar estilos de cards y typing indicator
    - Agregar estilos para `.service-card` con imagen, título, descripción
    - Agregar estilos para `.appointment-card` con badges de estado coloreados
    - Agregar keyframes para animación de typing indicator (bounce)
    - Agregar estilos para animaciones de slide-in y slide-out del panel
    - _Requirements: 5.4, 5.5, 7.7, 7.8, 3.2, 3.3, 13.1, 13.2, 13.5, 13.8_

- [ ] 7. Integrar chat en páginas HTML
  - [~] 7.1 Reemplazar botón de WhatsApp en index.html
    - Modificar `frontend/index.html`
    - Eliminar el div `#wa-menu` y botón `#wa-btn` existentes
    - Agregar div contenedor `<div id="chat-container"></div>` antes del cierre de body
    - Importar script `chat.js` como módulo
    - Inicializar ChatButton y ChatManager en DOMContentLoaded
    - _Requirements: 1.1, 16.3_
  
  - [~] 7.2 Reemplazar botón de WhatsApp en reservas.html
    - Modificar `frontend/reservas.html`
    - Eliminar el botón de WhatsApp existente
    - Agregar div contenedor `<div id="chat-container"></div>`
    - Importar script `chat.js` como módulo
    - Inicializar ChatButton y ChatManager en DOMContentLoaded
    - _Requirements: 1.2, 16.4_

- [ ] 8. Checkpoint - Verificar integración frontend-backend
  - Abrir index.html en navegador
  - Verificar que el botón de chat aparece con animación pulse
  - Verificar que el badge "1" aparece después de 3 segundos
  - Hacer clic en el botón y verificar que el panel se abre
  - Verificar que el mensaje de bienvenida aparece
  - Probar flujo completo: nombre → menú → ver servicios
  - Probar consulta de citas con documento válido
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implementar flujos conversacionales completos
  - [~] 9.1 Implementar flujo de consulta de servicios
    - En ChatManager, implementar lógica completa de `handleServiceInquiry()`
    - Llamar a `getServices()` API
    - Renderizar Service Cards con `addServiceCards()`
    - Agregar Quick Reply "Reservar" después de mostrar servicios
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [~] 9.2 Implementar flujo de reserva
    - En ChatManager, implementar lógica de `handleBookingInquiry()`
    - Mostrar mensaje explicando que se abrirá el sistema de reservas
    - Proporcionar link a `reservas.html`
    - Agregar Quick Reply para volver al menú principal
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [~] 9.3 Implementar flujo de consulta de citas
    - En ChatManager, implementar lógica completa de `handleAppointmentInquiry()`
    - Solicitar documento al usuario
    - Validar formato de documento (alfanumérico)
    - Llamar a `getAppointments(documento)` API
    - Renderizar Appointment Cards con colores según estado
    - Manejar caso de no encontrar citas
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 15.3_
  
  - [~] 9.4 Implementar flujo de horarios y ubicación
    - En ChatManager, implementar `handleScheduleInfo()`
    - Mostrar horarios de atención del spa
    - Mostrar dirección física
    - Mostrar número de teléfono de contacto
    - Agregar Quick Reply para volver al menú
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [~] 9.5 Implementar flujo de certificados de regalo
    - En ChatManager, implementar `handleGiftCertificates()`
    - Mostrar información sobre certificados de regalo
    - Explicar cómo comprar certificados
    - Proporcionar información de contacto para consultas
    - Agregar Quick Reply para volver al menú
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 10. Implementar integración con N8N
  - [~] 10.1 Configurar variable de entorno N8N_CHAT_WEBHOOK
    - Agregar `N8N_CHAT_WEBHOOK` a archivo `.env` local
    - Agregar variable en Vercel dashboard para producción
    - Documentar formato esperado del webhook
    - _Requirements: 10.2, 10.6_
  
  - [~] 10.2 Probar integración con N8N webhook
    - Enviar mensaje de texto libre desde el chat
    - Verificar que el mensaje llega a N8N con formato correcto
    - Verificar que la respuesta de N8N se muestra en el chat
    - Probar con diferentes tipos de consultas
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [~] 10.3 Probar fallback a respuestas locales
    - Desactivar N8N_CHAT_WEBHOOK temporalmente
    - Enviar mensajes de texto libre
    - Verificar que LocalResponseService responde correctamente
    - Verificar que el usuario no nota el cambio (sin mensajes de error)
    - Reactivar N8N_CHAT_WEBHOOK
    - _Requirements: 10.5, 10.7, 15.2_

- [ ] 11. Testing de responsividad y compatibilidad
  - [~] 11.1 Probar en dispositivos móviles
    - Abrir chat en viewport móvil (< 768px)
    - Verificar que el panel ocupa fullscreen
    - Verificar que la animación slide-up funciona correctamente
    - Probar scroll en área de mensajes
    - Probar input y envío de mensajes
    - _Requirements: 2.1, 2.2_
  
  - [~] 11.2 Probar en desktop
    - Abrir chat en viewport desktop (> 768px)
    - Verificar que el panel es floating (400x600px)
    - Verificar posicionamiento en bottom-right
    - Verificar que no interfiere con contenido de la página
    - _Requirements: 2.1_
  
  - [~] 11.3 Probar en diferentes navegadores
    - Probar en Chrome, Firefox, Safari, Edge
    - Verificar que las animaciones funcionan correctamente
    - Verificar que los estilos se renderizan correctamente
    - Verificar que localStorage funciona en todos los navegadores
    - _Requirements: 13.8_

- [ ] 12. Optimización y pulido final
  - [~] 12.1 Optimizar rendimiento
    - Verificar que el panel abre en < 300ms
    - Verificar que los mensajes se renderizan en < 100ms
    - Verificar que no hay memory leaks después de 50+ mensajes
    - Optimizar carga de imágenes en Service Cards (lazy loading)
    - _Requirements: 13.8_
  
  - [~] 12.2 Revisar accesibilidad
    - Agregar aria-label al botón de chat
    - Agregar roles ARIA apropiados al panel
    - Verificar navegación por teclado (Tab, Enter, Escape)
    - Verificar contraste de colores (WCAG AA)
    - Probar con lector de pantalla
    - _Requirements: 2.8_
  
  - [~] 12.3 Pulir animaciones y transiciones
    - Verificar que todas las animaciones usan cubic-bezier
    - Ajustar timings si es necesario
    - Verificar que el typing indicator tiene delays escalonados
    - Verificar que el badge pulse es suave
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

- [ ] 13. Preparar para deploy en Vercel
  - [~] 13.1 Configurar variables de entorno en Vercel
    - Agregar todas las variables de Supabase en Vercel dashboard
    - Agregar N8N_CHAT_WEBHOOK en Vercel (opcional)
    - Verificar que todas las variables están configuradas correctamente
    - _Requirements: 10.6_
  
  - [~] 13.2 Verificar configuración de vercel.json
    - Verificar que las rutas de API están correctamente configuradas
    - Verificar que los archivos estáticos se sirven correctamente
    - Verificar que el SPA fallback funciona
    - _Requirements: 16.5, 16.6_
  
  - [~] 13.3 Deploy a Vercel y testing en producción
    - Hacer commit de todos los cambios
    - Push a repositorio
    - Verificar que el deploy en Vercel es exitoso
    - Probar chat en URL de producción
    - Verificar que todas las funcionalidades funcionan en producción
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 4.1, 5.1, 7.1, 8.1, 9.1, 10.1_

- [ ] 14. Final checkpoint - Verificación completa del sistema
  - Probar flujo completo desde inicio hasta fin
  - Verificar que el botón de WhatsApp fue reemplazado en ambas páginas
  - Verificar que todas las conversaciones se guardan en Supabase
  - Verificar que la integración con N8N funciona (si está configurada)
  - Verificar que el sistema funciona en mobile y desktop
  - Verificar que todos los mensajes de error son amigables
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- El sistema usa JavaScript vanilla en el frontend (no frameworks)
- El backend usa Express.js con Node.js
- La base de datos es Supabase (PostgreSQL)
- N8N_CHAT_WEBHOOK es opcional - el sistema funciona sin él usando respuestas locales
- Todas las animaciones deben ser suaves y mantener el estilo luxury del spa
- Los colores del chat deben coincidir con la paleta del spa: forest green (#2C4A2E), golden (#C9A961), cream (#FAF8F5)
- Cada tarea referencia los requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental del sistema
