# Appointments Endpoint Documentation

## Overview

The `/api/chat/appointments` endpoint allows users to query their appointments by providing their document number (documento). This endpoint is part of the chat system and enables clients to check their scheduled appointments with service details.

## Endpoint Details

**URL:** `POST /api/chat/appointments`

**Method:** POST

**Content-Type:** application/json

## Request

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| documento | string | Yes | Client's document number (ID card, passport, etc.) |

### Example Request

```json
{
  "documento": "123456789"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3000/api/chat/appointments \
  -H "Content-Type: application/json" \
  -d '{"documento": "123456789"}'
```

## Response

### Success Response (200 OK)

Returns an object with an array of appointments and their associated service details.

```json
{
  "appointments": [
    {
      "id": "uuid-1",
      "fecha": "2024-02-15",
      "hora_inicio": "10:00",
      "hora_fin": "11:00",
      "estado": "confirmada",
      "notas": "Primera cita",
      "duracion_total": 60,
      "servicio_nombre": "Masaje Relajante",
      "servicio_descripcion": "Masaje de cuerpo completo con aceites esenciales",
      "servicio_precio": 150000,
      "servicio_duracion": 60
    },
    {
      "id": "uuid-2",
      "fecha": "2024-02-10",
      "hora_inicio": "14:00",
      "hora_fin": "15:00",
      "estado": "completada",
      "notas": null,
      "duracion_total": 60,
      "servicio_nombre": "Facial Hidratante",
      "servicio_descripcion": "Tratamiento facial profundo",
      "servicio_precio": 120000,
      "servicio_duracion": 45
    }
  ]
}
```

### No Client Found (200 OK)

When no client exists with the provided documento:

```json
{
  "appointments": [],
  "message": "No se encontraron citas para este documento"
}
```

### No Appointments Found (200 OK)

When the client exists but has no appointments:

```json
{
  "appointments": []
}
```

### Error Responses

#### 400 Bad Request - Missing documento

```json
{
  "error": "Campo requerido faltante",
  "message": "El documento es obligatorio"
}
```

#### 500 Internal Server Error - Database Error

```json
{
  "error": "Error consultando citas",
  "message": "No se pudieron cargar las citas"
}
```

#### 500 Internal Server Error - Unexpected Error

```json
{
  "error": "Error inesperado",
  "message": "Ocurrió un error al consultar las citas"
}
```

## Response Fields

### Appointment Object

| Field | Type | Description |
|-------|------|-------------|
| id | string (uuid) | Unique appointment identifier |
| fecha | string (YYYY-MM-DD) | Appointment date |
| hora_inicio | string (HH:MM) | Start time |
| hora_fin | string (HH:MM) | End time |
| estado | string | Status: 'pendiente', 'confirmada', 'completada', 'cancelada' |
| notas | string \| null | Client notes |
| duracion_total | number | Total duration in minutes (including buffer) |
| servicio_nombre | string | Service name |
| servicio_descripcion | string \| null | Service description |
| servicio_precio | number \| null | Service price in COP |
| servicio_duracion | number \| null | Service duration in minutes |

## Implementation Details

### Database Queries

1. **Client Lookup:**
   - Searches `clientes` table by `documento` field
   - Uses `.single()` to get exactly one result

2. **Appointments Query:**
   - Queries `citas` table filtered by `cliente_id`
   - Performs JOIN with `servicios` table to get service details
   - Orders by `fecha` DESC and `hora_inicio` DESC (most recent first)

### Error Handling

- **Missing documento:** Returns 400 with validation error
- **Client not found:** Returns 200 with empty array and message
- **Database errors:** Returns 500 with appropriate error message
- **Missing service data:** Gracefully handles with fallback text "Servicio no disponible"

### Security Considerations

- No authentication required (public endpoint)
- Only returns appointments for the specific documento provided
- No sensitive client information exposed beyond appointments
- Input validation on required fields

## Testing

### Unit Tests

Run unit tests with:
```bash
npm test -- backend/routes/chat.test.js
```

Tests cover:
- Missing documento validation
- Client not found scenario
- Successful appointments retrieval
- Missing service data handling
- Empty appointments array
- Database error handling
- Unexpected error handling
- Correct ordering of results

### Manual Testing

Use the test script:
```bash
node backend/routes/test-appointments-endpoint.js
```

Or test with curl:
```bash
# Test with non-existent documento
curl -X POST http://localhost:3000/api/chat/appointments \
  -H "Content-Type: application/json" \
  -d '{"documento": "999999999"}'

# Test with missing documento
curl -X POST http://localhost:3000/api/chat/appointments \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Requirements Satisfied

This endpoint satisfies the following requirements from the spec:

- **14.5:** POST /api/chat/appointments endpoint accepts documento parameter
- **14.6:** Endpoint queries Supabase for cliente by documento and returns associated citas
- **7.2:** Searches cliente in clientes table by documento field
- **7.3:** If cliente exists, searches citas in citas table
- **7.4:** Performs JOIN with servicios table to get service details
- **7.5:** Returns array of citas with service information
- **7.6:** Handles case when no cliente or citas are found

## Frontend Integration

The frontend chat system can call this endpoint when a user selects "Consultar mis citas":

```javascript
async function getAppointments(documento) {
  const response = await fetch('/api/chat/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ documento })
  })
  
  const data = await response.json()
  
  if (data.appointments && data.appointments.length > 0) {
    // Display appointment cards
    displayAppointmentCards(data.appointments)
  } else {
    // Show "no appointments found" message
    showNoAppointmentsMessage()
  }
}
```

## Database Schema Requirements

### clientes table

Must have a `documento` column:
```sql
ALTER TABLE clientes ADD COLUMN documento TEXT;
CREATE INDEX idx_clientes_documento ON clientes(documento);
```

### citas table

Must have foreign key to clientes and servicios:
```sql
-- Already exists in schema
cliente_id UUID REFERENCES clientes(id)
servicio_id UUID REFERENCES servicios(id)
```

## Status Codes Reference

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Appointments found or empty array returned |
| 400 | Bad Request | Missing required documento field |
| 500 | Server Error | Database error or unexpected error |

## Notes

- Appointments are ordered by date and time (most recent first)
- The endpoint returns 200 even when no appointments are found (with empty array)
- Service information is included via JOIN, so deleted services will show as null
- The `servicio_nombre` field defaults to "Servicio no disponible" if service is missing
