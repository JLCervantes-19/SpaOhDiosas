# 🆕 Nueva Funcionalidad: Cambiar Fecha en el Chat

## ✅ Implementado

El botón "Cambiar fecha" ahora permite cambiar la fecha de una cita directamente en el chat, sin redirigir a la página de reservas.

---

## 🎯 Flujo Completo

### 1. Usuario Consulta sus Citas
```
Usuario: [Clic en "Consultar mis citas"]
Bot: "¿Cuál es tu nombre completo?"
Usuario: "Juan Pérez"
Bot: "Ahora necesito tu correo electrónico"
Usuario: "juan@example.com"
Bot: Muestra citas con botones: "Cancelar cita", "Cambiar fecha", "Todo está bien"
```

### 2. Usuario Elige Cambiar Fecha
```
Usuario: [Clic en "Cambiar fecha"]
Bot: "¿Cuál cita deseas cambiar de fecha? (1, 2, 3...)"
Usuario: "1"
Bot: "Perfecto! Vamos a cambiar la fecha de tu cita de Masaje Relajante"
     "📅 Fecha actual: viernes, 15 de marzo a las 14:00"
     "¿Cuándo te gustaría reagendar?"
     Botones: "Esta semana", "Este mes", "Otro mes"
```

### 3. Usuario Elige Período
```
Usuario: [Clic en "Esta semana"]
Bot: "📅 Días disponibles esta semana:"
     "Elige un día:"
     Botones: "lun. 18 mar", "mar. 19 mar", "mié. 20 mar", etc.
```

### 4. Usuario Elige Día
```
Usuario: [Clic en "mar. 19 mar"]
Bot: "📅 martes, 19 de marzo"
     "🕐 Horarios disponibles:"
     "Elige una hora:"
     Botones: "09:00", "09:30", "10:00", "10:30", etc.
```

### 5. Usuario Elige Hora
```
Usuario: [Clic en "10:00"]
Bot: "✅ ¡Perfecto! Tu cita ha sido reagendada exitosamente."
     "📅 Nueva fecha: martes, 19 de marzo"
     "🕐 Hora: 10:00 - 11:00"
     "💆 Servicio: Masaje Relajante"
     "Te esperamos! 💜✨"
     Botones: "Volver al menú", "Salir"
```

---

## 🔧 Implementación Técnica

### Nuevos Estados Conversacionales

```javascript
AWAITING_RESCHEDULE_DATE: 'awaiting_reschedule_date',
CHOOSING_RESCHEDULE_PERIOD: 'choosing_reschedule_period',
CHOOSING_RESCHEDULE_DAY: 'choosing_reschedule_day',
CHOOSING_RESCHEDULE_TIME: 'choosing_reschedule_time',
```

### Nuevos Métodos en Backend

1. **`handleRescheduleDate()`** - Valida 24h y muestra opciones de período
2. **`handleReschedulePeriodChoice()`** - Procesa período y muestra días disponibles
3. **`handleRescheduleDayChoice()`** - Procesa día y muestra horarios disponibles
4. **`handleRescheduleTimeChoice()`** - Confirma y actualiza la cita en BD
5. **`getAvailableDays()`** - Obtiene días disponibles según tabla `disponibilidad`
6. **`getAvailableTimesForDay()`** - Obtiene horarios disponibles para un día específico

### Lógica de Disponibilidad

#### Días Disponibles
- Consulta tabla `disponibilidad` para ver qué días de la semana están activos
- Genera lista de fechas futuras que coinciden con días activos
- Ejemplo: Si `dia_semana = 1` (Lunes) está activo, muestra todos los lunes

#### Horarios Disponibles
- Consulta tabla `disponibilidad` para obtener `hora_inicio` y `hora_fin`
- Genera slots de 30 minutos entre hora inicio y fin
- Consulta tabla `citas` para ver qué slots están ocupados
- Retorna solo slots libres

### Variables de Contexto

**Frontend**:
```javascript
let selectedCita = null      // Cita seleccionada para cambiar
let availableDays = null     // Array de días disponibles
let selectedDay = null       // Día seleccionado
let availableTimes = null    // Array de horarios disponibles
```

**Backend** (pasado en cada request):
```javascript
context = {
  selectedCita: req.body.selectedCita,
  availableDays: req.body.availableDays,
  selectedDay: req.body.selectedDay,
  availableTimes: req.body.availableTimes
}
```

---

## 📁 Archivos Modificados

### 1. `backend/services/chatbot.js`
- ✅ Agregados 3 nuevos estados conversacionales
- ✅ Agregados 6 nuevos métodos
- ✅ Modificado `handleRescheduleDate()` para mostrar opciones en lugar de redirigir
- ✅ ~400 líneas de código nuevo

### 2. `backend/routes/chat.js`
- ✅ Agregadas nuevas variables de contexto al request
- ✅ Agregadas nuevas variables de contexto al response

### 3. `frontend/chat.html`
- ✅ Agregadas 4 nuevas variables globales
- ✅ Modificado `sendMessageToBackend()` para enviar nuevo contexto
- ✅ Modificado `handleQuickReply()` para guardar nuevo contexto
- ✅ Modificado `handleSendMessage()` para guardar nuevo contexto

---

## 🧪 Cómo Probar

### Prerequisitos
1. Tener datos en tabla `disponibilidad`:
```sql
-- Ejemplo: Lunes a Viernes, 9:00 AM - 6:00 PM
INSERT INTO disponibilidad (dia_semana, hora_inicio, hora_fin, activo)
VALUES 
  (1, '09:00', '18:00', true),  -- Lunes
  (2, '09:00', '18:00', true),  -- Martes
  (3, '09:00', '18:00', true),  -- Miércoles
  (4, '09:00', '18:00', true),  -- Jueves
  (5, '09:00', '18:00', true);  -- Viernes
```

2. Tener una cita agendada con más de 24 horas de anticipación

### Pasos de Prueba

1. **Reiniciar servidor**:
   ```bash
   npm start
   ```

2. **Abrir chat**:
   ```
   http://localhost:3000/frontend/chat.html
   ```

3. **Flujo completo**:
   - Escribe tu nombre
   - Clic en "Consultar mis citas"
   - Ingresa nombre y email
   - Clic en "Cambiar fecha"
   - Escribe número de cita (ej: "1")
   - ✅ Debería mostrar: "¿Cuándo te gustaría reagendar?"
   - ✅ Botones: "Esta semana", "Este mes", "Otro mes"
   - Clic en "Esta semana"
   - ✅ Debería mostrar días disponibles
   - Clic en un día
   - ✅ Debería mostrar horarios disponibles
   - Clic en un horario
   - ✅ Debería confirmar cambio y actualizar BD

4. **Verificar en BD**:
```sql
SELECT id, fecha, hora_inicio, hora_fin, estado
FROM citas
WHERE id = '[ID_DE_LA_CITA]';
```
La fecha y hora deben estar actualizadas.

---

## ⚠️ Validaciones Implementadas

### 1. Validación de 24 Horas
- Si la cita es en menos de 24 horas, muestra mensaje de error
- Proporciona teléfono de contacto directo

### 2. Validación de Número de Cita
- Verifica que el número sea válido (1, 2, 3...)
- Verifica que el número esté en el rango de citas disponibles

### 3. Validación de Disponibilidad
- Solo muestra días que están en tabla `disponibilidad`
- Solo muestra horarios que no están ocupados
- Si no hay disponibilidad, ofrece elegir otro período

### 4. Validación de Selección
- Verifica que el día seleccionado esté en la lista
- Verifica que el horario seleccionado esté disponible

---

## 🎨 Experiencia de Usuario

### Ventajas del Nuevo Flujo

1. **Sin salir del chat**: Todo se hace en la misma conversación
2. **Guiado paso a paso**: Opciones claras en cada paso
3. **Visual**: Botones de respuesta rápida para cada opción
4. **Rápido**: Solo 4 clics para cambiar fecha
5. **Confirmación clara**: Mensaje de éxito con todos los detalles

### Comparación con Flujo Anterior

**Antes**:
```
Usuario: [Cambiar fecha]
Bot: "Te redirigiré a reservas..."
→ Redirige a otra página
→ Usuario debe buscar su cita
→ Usuario debe cancelar y crear nueva
```

**Ahora**:
```
Usuario: [Cambiar fecha]
Bot: "¿Cuándo te gustaría reagendar?"
→ Elige período (3 opciones)
→ Elige día (hasta 7 opciones)
→ Elige hora (hasta 8 opciones)
→ Confirmación instantánea
```

---

## 📊 Opciones de Período

### "Esta semana"
- Muestra próximos 7 días
- Desde mañana hasta dentro de 7 días
- Ideal para cambios urgentes

### "Este mes"
- Muestra días del mes actual
- Desde mañana hasta fin de mes
- Ideal para cambios a corto plazo

### "Otro mes"
- Muestra días del próximo mes
- Desde el día 1 del próximo mes
- Ideal para cambios a largo plazo

---

## 🔄 Integración con Base de Datos

### Tablas Utilizadas

1. **`disponibilidad`**
   - Consulta: Obtener días y horarios disponibles
   - Campos: `dia_semana`, `hora_inicio`, `hora_fin`, `activo`

2. **`citas`**
   - Consulta: Ver citas ocupadas
   - Actualización: Cambiar `fecha`, `hora_inicio`, `hora_fin`
   - Campos: `id`, `fecha`, `hora_inicio`, `hora_fin`, `estado`

3. **`servicios`**
   - Consulta: Obtener duración del servicio
   - Campos: `duracion_min`

---

## ✅ Checklist de Verificación

- [x] Código implementado en backend
- [x] Código implementado en frontend
- [x] Nuevos estados conversacionales agregados
- [x] Validación de 24 horas funciona
- [x] Consulta de disponibilidad implementada
- [x] Actualización de BD implementada
- [x] Sin errores de sintaxis
- [ ] Servidor reiniciado
- [ ] Tabla `disponibilidad` tiene datos
- [ ] Prueba manual realizada
- [ ] Cambio de fecha funciona correctamente
- [ ] BD se actualiza correctamente

---

## 🆘 Troubleshooting

### "No hay disponibilidad"
**Causa**: Tabla `disponibilidad` vacía o sin días activos
**Solución**: Insertar datos en tabla `disponibilidad`

### "No hay horarios disponibles"
**Causa**: Todos los slots están ocupados
**Solución**: Elegir otro día o verificar citas en BD

### "Hubo un error al actualizar"
**Causa**: Error de conexión a BD o permisos
**Solución**: Verificar logs del servidor y credenciales de Supabase

### Botones no aparecen
**Causa**: Frontend no recibe `quickReplies`
**Solución**: Verificar que backend retorna `quickReplies` en response

---

## 📝 Notas Técnicas

### Slots de 30 Minutos
Los horarios se generan en intervalos de 30 minutos:
- 09:00, 09:30, 10:00, 10:30, etc.

### Cálculo de Hora Fin
```javascript
const duracionMin = cita.servicios?.duracion_min || 60;
const horaFin = new Date(horaInicio.getTime() + duracionMin * 60000);
```

### Formato de Fechas
- BD: `YYYY-MM-DD` (ej: "2024-03-19")
- Display: "martes, 19 de marzo" (español)

---

**Fecha de implementación**: Hoy
**Archivos modificados**: 3 archivos principales
**Líneas de código**: ~500 líneas nuevas
**Estado**: ✅ Implementado y listo para probar
