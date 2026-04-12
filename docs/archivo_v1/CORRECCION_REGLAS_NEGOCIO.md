# 🔧 Corrección: Reglas de Negocio del Chat

## 🐛 Problema Identificado

El chatbot NO estaba respetando las mismas reglas de negocio que el sistema de reservas:

### Problemas Encontrados:

1. **❌ Usaba tabla `disponibilidad`** que no existe/no se usa
2. **❌ No respetaba horarios reales** del spa
3. **❌ No excluía domingos** (el spa está cerrado)
4. **❌ No calculaba buffer** correctamente
5. **❌ Horarios de tarde no aparecían** correctamente
6. **❌ No usaba la misma lógica** que `bookings.js`

---

## ✅ Solución Implementada

### Ahora el Chat USA LAS MISMAS REGLAS que el Sistema de Reservas

El chatbot ahora replica EXACTAMENTE la lógica de `backend/routes/bookings.js`:

#### 1. Horarios del Spa (Hardcodeados)

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

**Horarios**:
- **Lunes a Viernes**: 9:00 AM - 6:00 PM
- **Sábado**: 9:00 AM - 4:00 PM
- **Domingo**: CERRADO (no aparece en opciones)

#### 2. Slots de 30 Minutos

```javascript
// Genera slots cada 30 minutos
cursor += 30; // 09:00, 09:30, 10:00, 10:30, etc.
```

**Horarios de Mañana**: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30
**Horarios de Tarde**: 12:00, 12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30

#### 3. Duración Total = Duración + Buffer

```javascript
const totalMin = duracionServicio + bufferMin;
// Ejemplo: 60 min servicio + 10 min buffer = 70 min total
```

**Por qué el buffer**:
- Tiempo de limpieza entre clientes
- Tiempo de preparación
- Evita citas pegadas

#### 4. Verificación de Disponibilidad

```javascript
// Misma función que bookings.js
const intervalosSeCruzan = (s1, e1, s2, e2) => {
  return timeToMinutes(s1) < timeToMinutes(e2) &&
         timeToMinutes(e1) > timeToMinutes(s2);
};
```

**Verifica**:
- Si el slot se cruza con citas existentes
- Considera duración + buffer
- Excluye citas canceladas

#### 5. Consulta de Citas Ocupadas

```javascript
const { data: citasDia } = await supabase
  .from('citas')
  .select('hora_inicio, hora_fin')
  .eq('fecha', fecha)
  .neq('estado', 'cancelada'); // Excluye canceladas
```

**Estados considerados ocupados**:
- `confirmada`
- `pendiente`
- `asistio`
- `no_asistio`

**Estado NO considerado ocupado**:
- `cancelada`

---

## 🔄 Métodos Corregidos

### 1. `getAvailableDays()`

**Antes**:
```javascript
// ❌ Consultaba tabla disponibilidad (no existe)
const { data: disponibilidad } = await supabase
  .from('disponibilidad')
  .select('dia_semana, hora_inicio, hora_fin')
  .eq('activo', true);
```

**Ahora**:
```javascript
// ✅ Usa SCHEDULE hardcodeado (igual que bookings.js)
const SCHEDULE = {
  1: { start: '09:00', end: '18:00' }, // Lunes
  // ...
};

// Solo agrega días que están en SCHEDULE
if (SCHEDULE[diaSemana]) {
  diasDisponibles.push(fecha);
}
```

### 2. `getAvailableTimesForDay()`

**Antes**:
```javascript
// ❌ Consultaba tabla disponibilidad
// ❌ No usaba buffer
// ❌ Lógica diferente a bookings.js
```

**Ahora**:
```javascript
// ✅ Usa SCHEDULE hardcodeado
// ✅ Usa buffer del servicio
// ✅ Misma lógica que bookings.js

const totalMin = duracionServicio + bufferMin;
const SCHEDULE = { /* ... */ };

// Genera slots de 30 min
while (cursor + totalMin <= endMin) {
  const slotStart = minutesToTime(cursor);
  const slotEnd = minutesToTime(cursor + totalMin);
  
  // Verifica si está ocupado
  const ocupado = citasDia.some(c =>
    intervalosSeCruzan(slotStart, slotEnd, c.hora_inicio, c.hora_fin)
  );
  
  if (!ocupado) {
    horariosDisponibles.push(slotStart);
  }
  
  cursor += 30;
}
```

### 3. `handleRescheduleTimeChoice()`

**Antes**:
```javascript
// ❌ Solo usaba duracion_min
const horaFin = new Date(horaInicio.getTime() + duracionMin * 60000);
```

**Ahora**:
```javascript
// ✅ Usa duracion_min + buffer_min (igual que bookings.js)
const duracionTotal = duracionMin + bufferMin;
const endMin = timeToMinutes(normalizedMessage) + duracionTotal;
const horaFinStr = minutesToTime(endMin);

// ✅ Actualiza duracion_total en BD
await supabase
  .from('citas')
  .update({
    fecha: selectedDay,
    hora_inicio: normalizedMessage,
    hora_fin: horaFinStr,
    duracion_total: duracionTotal // ← NUEVO
  })
  .eq('id', cita.id);
```

### 4. `checkAppointmentsByNameAndEmail()`

**Antes**:
```javascript
// ❌ No obtenía buffer_min
servicios (
  nombre,
  duracion_min,
  precio
)
```

**Ahora**:
```javascript
// ✅ Obtiene buffer_min
servicios (
  nombre,
  duracion_min,
  buffer_min, // ← NUEVO
  precio
)
```

---

## 📊 Comparación: Antes vs Ahora

| Aspecto | Antes ❌ | Ahora ✅ |
|---------|---------|---------|
| **Fuente de horarios** | Tabla `disponibilidad` | `SCHEDULE` hardcodeado |
| **Domingos** | Podían aparecer | CERRADO (no aparece) |
| **Horarios Lunes-Viernes** | Incorrectos | 9:00 - 18:00 |
| **Horarios Sábado** | Incorrectos | 9:00 - 16:00 |
| **Slots** | Variable | 30 minutos (fijo) |
| **Buffer** | No se usaba | duracion + buffer |
| **Verificación ocupado** | Lógica diferente | Misma que bookings.js |
| **Citas canceladas** | Podían bloquear | Se excluyen |
| **Duración total en BD** | No se guardaba | Se guarda correctamente |

---

## 🧪 Cómo Probar

### Paso 1: Reiniciar Servidor

```bash
# Detener con Ctrl+C
npm start
```

### Paso 2: Probar Días Disponibles

1. Abre chat y consulta citas
2. Clic en "Cambiar fecha"
3. Elige "Esta semana"
4. ✅ **NO debe aparecer Domingo**
5. ✅ **Solo Lunes a Sábado**

### Paso 3: Probar Horarios de Mañana

1. Elige un día (ej: Martes)
2. ✅ Debe mostrar: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30

### Paso 4: Probar Horarios de Tarde

1. Si hay disponibilidad
2. ✅ Debe mostrar: 12:00, 12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30

### Paso 5: Probar Sábado

1. Elige Sábado
2. ✅ Horarios hasta 16:00 (no hasta 18:00)
3. ✅ Último slot: 15:30 o antes (dependiendo de duración + buffer)

### Paso 6: Verificar Buffer

1. Agenda una cita a las 10:00 (servicio de 60 min)
2. Intenta agendar otra a las 10:30
3. ✅ **NO debe estar disponible** (buffer de 10 min)
4. ✅ Próximo slot disponible: 11:00 o 11:30

### Paso 7: Verificar en BD

```sql
SELECT 
  fecha,
  hora_inicio,
  hora_fin,
  duracion_total,
  estado
FROM citas
WHERE fecha >= CURRENT_DATE
ORDER BY fecha, hora_inicio;
```

**Verificar**:
- ✅ `duracion_total` = duracion_min + buffer_min
- ✅ `hora_fin` - `hora_inicio` = `duracion_total`
- ✅ No hay citas en Domingo

---

## 🎯 Reglas de Negocio Implementadas

### 1. Horarios de Atención

- **Lunes a Viernes**: 9:00 AM - 6:00 PM
- **Sábado**: 9:00 AM - 4:00 PM
- **Domingo**: CERRADO

### 2. Slots de Tiempo

- Intervalos de **30 minutos**
- Ejemplo: 09:00, 09:30, 10:00, 10:30...

### 3. Duración de Citas

- **Duración total** = Duración servicio + Buffer
- Ejemplo: 60 min + 10 min = 70 min total

### 4. Buffer Entre Citas

- **Mínimo 10 minutos** entre citas
- Para limpieza y preparación
- Se suma a la duración del servicio

### 5. Verificación de Disponibilidad

- Verifica que el slot NO se cruce con citas existentes
- Considera duración + buffer
- Excluye citas canceladas

### 6. Estados de Citas

- **Ocupan slot**: confirmada, pendiente, asistio, no_asistio
- **NO ocupan slot**: cancelada

---

## 📁 Archivos Modificados

1. **`backend/services/chatbot.js`**
   - ✅ `getAvailableDays()` - Usa SCHEDULE hardcodeado
   - ✅ `getAvailableTimesForDay()` - Misma lógica que bookings.js
   - ✅ `handleRescheduleTimeChoice()` - Calcula buffer correctamente
   - ✅ `checkAppointmentsByNameAndEmail()` - Obtiene buffer_min

2. **`setup_disponibilidad.sql`**
   - ❌ ELIMINADO (no se usa)

---

## ⚠️ Importante

### NO Usar Tabla `disponibilidad`

El sistema **NO usa** la tabla `disponibilidad`. Los horarios están **hardcodeados** en:
- `backend/routes/bookings.js` (sistema de reservas)
- `backend/services/chatbot.js` (chatbot)

### Para Cambiar Horarios

Si necesitas cambiar los horarios del spa, debes modificar el objeto `SCHEDULE` en **AMBOS archivos**:

```javascript
// En bookings.js Y chatbot.js
const SCHEDULE = {
  1: { start: '09:00', end: '18:00' }, // Lunes
  2: { start: '09:00', end: '18:00' }, // Martes
  // ...
};
```

---

## ✅ Checklist de Verificación

- [x] Chat usa SCHEDULE hardcodeado
- [x] Domingos NO aparecen
- [x] Horarios Lunes-Viernes: 9:00-18:00
- [x] Horarios Sábado: 9:00-16:00
- [x] Slots de 30 minutos
- [x] Buffer se calcula correctamente
- [x] Duración total se guarda en BD
- [x] Misma lógica que bookings.js
- [x] Sin errores de sintaxis
- [ ] Servidor reiniciado
- [ ] Pruebas manuales realizadas
- [ ] Horarios de tarde aparecen
- [ ] Buffer funciona correctamente

---

**Fecha de corrección**: Hoy
**Archivos modificados**: 1 archivo principal
**Archivos eliminados**: 1 archivo obsoleto
**Estado**: ✅ Corregido - Listo para probar
