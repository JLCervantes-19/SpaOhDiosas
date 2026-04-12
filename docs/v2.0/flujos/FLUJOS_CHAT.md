# 🔄 Flujos Conversacionales del Chatbot

## 📋 Índice de Flujos

1. [Flujo Principal](#flujo-principal)
2. [Consultar Citas](#consultar-citas)
3. [Cambiar Fecha de Cita](#cambiar-fecha-de-cita)
4. [Cancelar Cita](#cancelar-cita)
5. [Agendar Cita](#agendar-cita)

---

## Flujo Principal

```
Usuario → Chat
    ↓
¿Tiene nombre guardado?
    ├─ SÍ → Menú Principal
    └─ NO → Pedir nombre → Menú Principal

Menú Principal:
├─ Ver servicios
├─ Agendar cita → Redirigir a reservas
├─ Consultar mis citas → [Flujo Consultar Citas]
├─ Horarios y ubicación
└─ Certificados de regalo
```

---

## Consultar Citas

### Flujo Completo

```
1. Usuario: "Consultar mis citas"
   ↓
2. Bot: "¿Cuál es tu nombre completo?"
   ↓
3. Usuario: [nombre]
   ↓
4. Bot: "Ahora necesito tu correo electrónico"
   ↓
5. Usuario: [email]
   ↓
6. Bot busca en BD:
   ├─ Cliente NO encontrado → "No encontré tu perfil"
   └─ Cliente encontrado → Buscar citas
       ├─ Sin citas → "No tienes citas registradas"
       └─ Con citas → Mostrar citas
           ├─ Citas futuras → [Flujo Gestión de Citas]
           └─ Solo citas pasadas → "No tienes citas próximas"
```

### Estados Conversacionales

```javascript
AWAITING_APPOINTMENT_NAME → AWAITING_APPOINTMENT_EMAIL → MANAGING_APPOINTMENTS
```

### Ejemplo de Respuesta

```
🌿 Hola JHAN LEIDER CERVANTES! 👋

📅 Tus citas próximas:

1. ✅ Aromaterapia & Relajación
   📅 viernes, 17 de abril de 2026
   🕐 13:00 - 14:10
   Estado: confirmada
   📝 No tengo alergias

¿Necesitas modificar alguna de estas citas? Puedo ayudarte a:
• Cancelar una cita
• Cambiar la fecha de una cita

O si todo está bien, ¡nos vemos pronto! 💜

[Cancelar cita] [Cambiar fecha] [Todo está bien]
```

---

## Cambiar Fecha de Cita

### Flujo Completo

```
1. Usuario: "Cambiar fecha"
   ↓
2. Bot: "¿Cuál cita deseas cambiar? (1, 2, 3...)"
   ↓
3. Usuario: [número]
   ↓
4. Bot valida:
   ├─ < 24 horas → "Cambios deben hacerse con 24h anticipación"
   └─ ≥ 24 horas → "¿Cuándo te gustaría reagendar?"
       ↓
5. Usuario selecciona período:
   ├─ Esta semana (próximos 7 días)
   ├─ Este mes (próximos 30 días)
   └─ Otro mes (mes siguiente)
   ↓
6. Bot muestra días disponibles (excluye domingos)
   ↓
7. Usuario selecciona día
   ↓
8. Bot muestra horarios disponibles
   ├─ Verifica disponibilidad
   ├─ Considera duración + buffer
   └─ Excluye horarios ocupados
   ↓
9. Usuario selecciona hora
   ↓
10. Bot actualiza en BD y confirma
```

### Estados Conversacionales

```javascript
MANAGING_APPOINTMENTS
    ↓
AWAITING_RESCHEDULE_DATE
    ↓
CHOOSING_RESCHEDULE_PERIOD
    ↓
CHOOSING_RESCHEDULE_DAY
    ↓
CHOOSING_RESCHEDULE_TIME
    ↓
MAIN_MENU
```

### Ejemplo de Interacción

```
👤 Cambiar fecha

🌿 ¿Cuál cita deseas cambiar de fecha? (1, 2, 3...)

👤 1

🌿 Perfecto! Vamos a cambiar la fecha de tu cita de Aromaterapia & Relajación
📅 Fecha actual: viernes, 17 de abril a las 13:00
¿Cuándo te gustaría reagendar?

[Esta semana] [Este mes] [Otro mes]

👤 Esta semana

🌿 📅 Días disponibles esta semana:
Elige un día:

[lun., 13 abr.] [mar., 14 abr.] [mié., 15 abr.] 
[jue., 16 abr.] [vie., 17 abr.] [sáb., 18 abr.]

👤 jue., 16 abr.

🌿 📅 jueves, 16 de abril
🕐 Horarios disponibles:
Elige una hora:

[09:00] [09:30] [10:00] [10:30] [11:00] [11:30]
[12:00] [12:30] [13:00] [13:30] [14:00] [14:30]
[15:00] [15:30] [16:00] [16:30] [17:00] [17:30]

👤 14:00

🌿 ✅ ¡Perfecto! Tu cita ha sido reagendada exitosamente.

📅 Nueva fecha: jueves, 16 de abril
🕐 Hora: 14:00 - 15:10
💆 Servicio: Aromaterapia & Relajación

Te esperamos! 💜✨
```

### Lógica de Disponibilidad

```javascript
// 1. Obtener días disponibles
getAvailableDays(fechaInicio, fechaFin) {
  // Excluir domingos
  if (SCHEDULE[diaSemana]) {
    diasDisponibles.push(fechaStr);
  }
}

// 2. Obtener horarios disponibles
getAvailableTimesForDay(fecha, duracionServicio, bufferMin) {
  // Duración total = servicio + buffer
  const totalMin = duracionServicio + bufferMin;
  
  // Generar slots de 30 min
  while (cursor + totalMin <= endMin) {
    const slotStart = minutesToTime(cursor);
    const slotEnd = minutesToTime(cursor + totalMin);
    
    // Verificar si está ocupado
    const ocupado = citasDia.some(c =>
      intervalosSeCruzan(slotStart, slotEnd, c.hora_inicio, c.hora_fin)
    );
    
    if (!ocupado) {
      horariosDisponibles.push(slotStart);
    }
    
    cursor += 30;
  }
}
```

---

## Cancelar Cita

### Flujo Completo

```
1. Usuario: "Cancelar cita"
   ↓
2. Bot: "¿Cuál cita deseas cancelar? (1, 2, 3...)"
   ↓
3. Usuario: [número]
   ↓
4. Bot valida:
   ├─ < 24 horas → "Cancelaciones deben hacerse con 24h anticipación"
   └─ ≥ 24 horas → Cancelar en BD
       ↓
5. Bot confirma: "Tu cita ha sido cancelada exitosamente"
```

### Estados Conversacionales

```javascript
MANAGING_APPOINTMENTS → AWAITING_CANCEL_CONFIRMATION → MAIN_MENU
```

### Validación de 24 Horas

```javascript
const fechaCita = new Date(cita.fecha + 'T' + cita.hora_inicio);
const ahora = new Date();
const horasAnticipacion = (fechaCita - ahora) / (1000 * 60 * 60);

if (horasAnticipacion < 24) {
  // No permitir cancelación
  return "⚠️ Las cancelaciones deben hacerse con al menos 24 horas de anticipación";
}
```

---

## Agendar Cita

### Flujo

```
1. Usuario: "Agendar cita"
   ↓
2. Bot: "Te redirigiré a la página de reservas en 3 segundos..."
   ↓
3. Redirigir a: /reservas.html
```

**Nota**: El agendamiento se hace en la página de reservas, no en el chat.

---

## 🎯 Reglas de Negocio

### Horarios del Spa

```javascript
const SCHEDULE = {
  1: { start: '09:00', end: '18:00' }, // Lunes
  2: { start: '09:00', end: '18:00' }, // Martes
  3: { start: '09:00', end: '18:00' }, // Miércoles
  4: { start: '09:00', end: '18:00' }, // Jueves
  5: { start: '09:00', end: '18:00' }, // Viernes
  6: { start: '09:00', end: '16:00' }, // Sábado
  // 0 (Domingo) NO está = CERRADO
};
```

### Slots de Tiempo

- **Intervalo**: 30 minutos
- **Horarios**: 09:00, 09:30, 10:00, ..., 17:30 (Lun-Vie)
- **Horarios**: 09:00, 09:30, 10:00, ..., 15:30 (Sáb)

### Duración de Citas

```javascript
duracionTotal = duracionServicio + bufferMin
// Ejemplo: 60 min + 10 min = 70 min
```

### Validaciones

- **Cambios/Cancelaciones**: Mínimo 24 horas de anticipación
- **Disponibilidad**: Verifica cruces con citas existentes
- **Estados**: Excluye citas canceladas

---

## 📊 Diagrama de Estados

```
INITIAL
    ↓
AWAITING_NAME
    ↓
MAIN_MENU ←─────────────────┐
    ├─ VIEWING_SERVICES      │
    ├─ AWAITING_APPOINTMENT_NAME
    │       ↓                 │
    │   AWAITING_APPOINTMENT_EMAIL
    │       ↓                 │
    │   MANAGING_APPOINTMENTS │
    │       ├─ AWAITING_CANCEL_CONFIRMATION
    │       │       ↓         │
    │       │   [Cancelar] ──┘
    │       │                 │
    │       └─ AWAITING_RESCHEDULE_DATE
    │               ↓         │
    │           CHOOSING_RESCHEDULE_PERIOD
    │               ↓         │
    │           CHOOSING_RESCHEDULE_DAY
    │               ↓         │
    │           CHOOSING_RESCHEDULE_TIME
    │               ↓         │
    │           [Confirmar] ─┘
    │
    └─ [Otros flujos] ────────┘
```

---

## 🔍 Detección de Intenciones

### Patrones

```javascript
const intentPatterns = {
  greeting: /^(hola|buenos días|buenas tardes|buenas noches)/i,
  services: /ver servicios|servicios|tratamientos/i,
  appointments: /consultar.*citas|mis citas|ver.*citas/i,
  booking: /agendar.*cita|reservar|turno/i,
  schedule: /horario|hora|abierto|cerrado/i,
  location: /ubicación|dirección|donde|dónde/i,
  pricing: /precio|costo|valor|cuanto/i,
  gift: /certificado|regalo|gift/i,
  help: /ayuda|help|menu|menú/i,
  thanks: /gracias|thank you/i,
  bye: /adios|adiós|chao|hasta luego/i,
};
```

### Prioridad

```javascript
// IMPORTANTE: appointments debe ir ANTES de booking
const priorityIntents = ['appointments', 'booking'];
```

---

**Versión**: 2.0  
**Fecha**: Abril 2026  
**Estado**: ✅ Documentado
