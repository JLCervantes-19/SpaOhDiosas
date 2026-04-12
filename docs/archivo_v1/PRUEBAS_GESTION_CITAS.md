# Plan de Pruebas - Gestión de Citas

## Funcionalidades Implementadas

### 1. Consultar Citas
- ✅ Pide nombre completo
- ✅ Pide correo electrónico
- ✅ Busca por nombre O email (lógica OR)
- ✅ Muestra citas futuras con opciones de gestión
- ✅ Muestra mensaje apropiado si no hay citas

### 2. Gestión de Citas (Nuevo)
- ✅ Botones de acción rápida: "Cancelar cita", "Cambiar fecha", "Todo está bien"
- ✅ Validación de 24 horas de anticipación
- ✅ Cancelación de citas
- ✅ Cambio de fecha (redirige a reservas)
- ✅ Opción "Salir" para cerrar chat
- ✅ Mensajes de despedida cálidos

## Casos de Prueba

### Caso 1: Consultar Citas Exitosamente
**Pasos:**
1. Abrir chat en `frontend/chat.html`
2. Ingresar nombre cuando se solicite
3. Seleccionar "Consultar mis citas" del menú
4. Ingresar nombre completo
5. Ingresar correo electrónico

**Resultado Esperado:**
- Muestra lista de citas futuras
- Muestra botones: "Cancelar cita", "Cambiar fecha", "Todo está bien"

### Caso 2: Cancelar Cita (Con 24h de Anticipación)
**Prerequisito:** Tener una cita agendada con más de 24 horas de anticipación

**Pasos:**
1. Seguir Caso 1 hasta ver las citas
2. Hacer clic en "Cancelar cita"
3. Escribir el número de la cita (ej: "1")

**Resultado Esperado:**
- Mensaje de confirmación de cancelación
- Estado de la cita cambia a "cancelada" en la base de datos
- Mensaje de despedida cálido
- Botones: "Agendar nueva cita", "Volver al menú", "Salir"

### Caso 3: Cancelar Cita (Sin 24h de Anticipación)
**Prerequisito:** Tener una cita agendada con menos de 24 horas de anticipación

**Pasos:**
1. Seguir Caso 1 hasta ver las citas
2. Hacer clic en "Cancelar cita"
3. Escribir el número de la cita

**Resultado Esperado:**
- Mensaje de error indicando que se requieren 24 horas de anticipación
- Muestra número de teléfono para contacto directo
- Botones: "Volver al menú", "Salir"

### Caso 4: Cambiar Fecha de Cita (Con 24h de Anticipación)
**Prerequisito:** Tener una cita agendada con más de 24 horas de anticipación

**Pasos:**
1. Seguir Caso 1 hasta ver las citas
2. Hacer clic en "Cambiar fecha"
3. Escribir el número de la cita

**Resultado Esperado:**
- Mensaje indicando redirección al sistema de reservas
- Redirige a `/reservas.html` después de 3 segundos

### Caso 5: Cambiar Fecha (Sin 24h de Anticipación)
**Prerequisito:** Tener una cita agendada con menos de 24 horas de anticipación

**Pasos:**
1. Seguir Caso 1 hasta ver las citas
2. Hacer clic en "Cambiar fecha"
3. Escribir el número de la cita

**Resultado Esperado:**
- Mensaje de error indicando que se requieren 24 horas de anticipación
- Muestra número de teléfono para contacto directo
- Botones: "Volver al menú", "Salir"

### Caso 6: Todo Está Bien
**Pasos:**
1. Seguir Caso 1 hasta ver las citas
2. Hacer clic en "Todo está bien"

**Resultado Esperado:**
- Mensaje de confirmación amigable
- Mensaje de despedida con información de contacto
- Botones: "Volver al menú", "Salir"

### Caso 7: Opción Salir
**Pasos:**
1. En cualquier punto donde aparezca el botón "Salir", hacer clic
2. Observar comportamiento

**Resultado Esperado:**
- Mensaje de despedida cálido
- Limpia localStorage (session_id, user_name)
- Redirige a `/index.html` después de 2 segundos

### Caso 8: No Tiene Citas
**Pasos:**
1. Consultar citas con nombre/email que no tiene citas registradas

**Resultado Esperado:**
- Mensaje indicando que no tiene citas
- Ofrece agendar una cita
- Botones: "Sí, agendar", "No, gracias"

## Verificaciones en Base de Datos

### Después de Cancelar una Cita:
```sql
SELECT id, fecha, hora_inicio, estado 
FROM citas 
WHERE id = '[ID_DE_LA_CITA]';
```
**Esperado:** `estado = 'cancelada'`

### Verificar Citas de un Cliente:
```sql
SELECT c.id, c.fecha, c.hora_inicio, c.estado, s.nombre as servicio
FROM citas c
JOIN clientes cl ON c.cliente_id = cl.id
JOIN servicios s ON c.servicio_id = s.id
WHERE cl.nombre ILIKE '%[NOMBRE]%' OR cl.email = '[EMAIL]'
ORDER BY c.fecha DESC;
```

## Checklist de Funcionalidades

- [ ] Consultar citas pide nombre y email
- [ ] Búsqueda funciona por nombre O email
- [ ] Muestra citas futuras correctamente
- [ ] Botones de acción rápida aparecen
- [ ] Validación de 24 horas funciona para cancelación
- [ ] Validación de 24 horas funciona para cambio de fecha
- [ ] Cancelación actualiza estado en BD
- [ ] Cambio de fecha redirige a reservas
- [ ] Mensajes de despedida son cálidos y profesionales
- [ ] Opción "Salir" limpia sesión y redirige
- [ ] Manejo de errores es amigable
- [ ] Emails se guardan en minúsculas

## Notas de Implementación

### Archivos Modificados:
- `backend/services/chatbot.js` - Lógica de gestión de citas
- `backend/routes/chat.js` - Pasa contexto de citas y quickReplies
- `frontend/chat.html` - Maneja quick replies y opción "Salir"

### Estados Conversacionales Nuevos:
- `AWAITING_APPOINTMENT_NAME` - Esperando nombre para consultar citas
- `AWAITING_APPOINTMENT_EMAIL` - Esperando email para consultar citas
- `MANAGING_APPOINTMENTS` - Gestionando citas (cancelar/cambiar)
- `AWAITING_CANCEL_CONFIRMATION` - Esperando confirmación de cancelación
- `AWAITING_RESCHEDULE_DATE` - Esperando fecha para cambio

### Variables de Contexto:
- `tempName` - Nombre temporal durante flujo de consulta
- `currentCitas` - Array de citas actuales del usuario
- `quickReplies` - Botones de acción rápida
