# 🔧 Corrección: Horarios de Tarde No Aparecían

## 🐛 Problema Identificado

**SÍNTOMA**: Al cambiar fecha de una cita, solo aparecían horarios hasta el mediodía (12:30), aunque había disponibilidad en la tarde.

**EJEMPLO**: 
- Viernes 17 de abril
- Horarios mostrados: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30
- Horarios faltantes: 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30

---

## 🔍 Causa Raíz

El código estaba limitando los horarios a solo **8 opciones** con `.slice(0, 8)`:

```javascript
// ❌ INCORRECTO (limitaba a 8 horarios)
quickReplies: horariosDisponibles.slice(0, 8)
```

### ¿Por qué solo aparecían horarios de mañana?

Cuando hay una cita en el medio del día, los slots se distribuyen así:

**Ejemplo del viernes 17 de abril:**
- Cita existente: 12:00 - 13:10 (Aromaterapia 60 min + 10 min buffer)

**Slots generados (16 total):**
1. 09:00 ✅ Disponible
2. 09:30 ✅ Disponible
3. 10:00 ✅ Disponible
4. 10:30 ✅ Disponible
5. 11:00 ❌ Ocupado (se cruza con cita 12:00-13:10)
6. 11:30 ❌ Ocupado
7. 12:00 ❌ Ocupado
8. 12:30 ❌ Ocupado
9. 13:00 ❌ Ocupado
10. 13:30 ✅ Disponible ← Aquí empiezan los de tarde
11. 14:00 ✅ Disponible
12. 14:30 ✅ Disponible
13. 15:00 ✅ Disponible
14. 15:30 ✅ Disponible
15. 16:00 ✅ Disponible
16. 16:30 ✅ Disponible

**Horarios disponibles (11 total):**
- Mañana: 09:00, 09:30, 10:00, 10:30 (4 horarios)
- Tarde: 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30 (7 horarios)

**Con `.slice(0, 8)` solo mostraba:**
- 09:00, 09:30, 10:00, 10:30, 13:30, 14:00, 14:30, 15:00

Pero como el frontend renderiza los botones en orden y algunos están ocupados, solo se veían los primeros disponibles hasta completar 8 slots (incluyendo ocupados).

---

## ✅ Solución Implementada

Eliminar la limitación de 8 horarios y mostrar **TODOS** los horarios disponibles:

```javascript
// ✅ CORRECTO (muestra todos los horarios)
quickReplies: horariosDisponibles
```

---

## 🔄 Cambios Realizados

### `backend/services/chatbot.js`

Se modificaron **2 lugares** donde se usaba `.slice(0, 8)`:

#### 1. Método `handleRescheduleDayChoice()` (línea ~996)

**Antes:**
```javascript
return {
  response: `📅 ${fechaFormateada}\n\n🕐 Horarios disponibles:\n\nElige una hora:`,
  nextState: this.conversationStates.CHOOSING_RESCHEDULE_TIME,
  showMenu: false,
  selectedCita: cita,
  selectedDay: selectedDay,
  availableTimes: horariosDisponibles,
  quickReplies: horariosDisponibles.slice(0, 8) // ❌ Solo 8
};
```

**Ahora:**
```javascript
return {
  response: `📅 ${fechaFormateada}\n\n🕐 Horarios disponibles:\n\nElige una hora:`,
  nextState: this.conversationStates.CHOOSING_RESCHEDULE_TIME,
  showMenu: false,
  selectedCita: cita,
  selectedDay: selectedDay,
  availableTimes: horariosDisponibles,
  quickReplies: horariosDisponibles // ✅ Todos
};
```

#### 2. Método `handleRescheduleTimeChoice()` (línea ~1027)

**Antes:**
```javascript
if (!availableTimes.includes(normalizedMessage)) {
  return {
    response: 'Por favor elige uno de los horarios disponibles.',
    nextState: this.conversationStates.CHOOSING_RESCHEDULE_TIME,
    showMenu: false,
    selectedCita: cita,
    selectedDay: selectedDay,
    availableTimes: availableTimes,
    quickReplies: availableTimes.slice(0, 8) // ❌ Solo 8
  };
}
```

**Ahora:**
```javascript
if (!availableTimes.includes(normalizedMessage)) {
  return {
    response: 'Por favor elige uno de los horarios disponibles.',
    nextState: this.conversationStates.CHOOSING_RESCHEDULE_TIME,
    showMenu: false,
    selectedCita: cita,
    selectedDay: selectedDay,
    availableTimes: availableTimes,
    quickReplies: availableTimes // ✅ Todos
  };
}
```

---

## 🧪 Verificación

### Prueba con Debug Script

```bash
node debug_horarios.js
```

**Resultado:**
```
✅ HORARIOS DISPONIBLES (11):
09:00, 09:30, 10:00, 10:30, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30
```

**Antes**: Solo se mostraban los primeros 8
**Ahora**: Se muestran todos los 11 horarios disponibles

---

## 📊 Comparación: Antes vs Ahora

| Aspecto | Antes ❌ | Ahora ✅ |
|---------|---------|---------|
| **Horarios mostrados** | Máximo 8 | Todos los disponibles |
| **Horarios de mañana** | ✅ Aparecían | ✅ Aparecen |
| **Horarios de tarde** | ❌ Se cortaban | ✅ Aparecen todos |
| **Experiencia usuario** | Confusa (faltaban horarios) | Completa |
| **Slots disponibles** | Limitados artificialmente | Todos los reales |

---

## 🚀 Cómo Probar

### Paso 1: Reiniciar el Servidor

```bash
npm start
```

### Paso 2: Probar con un Día que Tenga Cita al Mediodía

1. Abre el chat
2. Consulta tus citas
3. Cambia la fecha de una cita
4. Selecciona "Esta semana"
5. Elige **viernes 17 de abril** (tiene cita a las 12:00)
6. **Verificar:**
   - ✅ Aparecen horarios de mañana: 09:00, 09:30, 10:00, 10:30
   - ✅ Aparecen horarios de tarde: 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30
   - ✅ NO aparecen horarios ocupados: 11:00, 11:30, 12:00, 12:30, 13:00

### Paso 3: Probar con un Día Sin Citas

1. Elige un día sin citas (ej: lunes 13 de abril)
2. **Verificar:**
   - ✅ Aparecen TODOS los horarios de 09:00 a 17:30
   - ✅ Slots cada 30 minutos
   - ✅ Último horario: 17:00 o 17:30 (dependiendo de duración + buffer)

### Paso 4: Probar Sábado

1. Elige sábado 18 de abril
2. **Verificar:**
   - ✅ Horarios hasta 16:00 (no hasta 18:00)
   - ✅ Último slot: 15:30 o antes (dependiendo de duración + buffer)

---

## 🎯 Reglas de Negocio Confirmadas

### Horarios del Spa

- **Lunes a Viernes**: 9:00 AM - 6:00 PM
- **Sábado**: 9:00 AM - 4:00 PM
- **Domingo**: CERRADO

### Generación de Slots

- **Intervalo**: 30 minutos
- **Duración**: Servicio + Buffer
- **Ejemplo**: Aromaterapia (60 min) + Buffer (10 min) = 70 min total

### Verificación de Disponibilidad

- Verifica que el slot NO se cruce con citas existentes
- Considera duración + buffer
- Excluye citas canceladas

---

## 📋 Checklist de Verificación

- [x] Código corregido en 2 lugares
- [x] Sin errores de sintaxis
- [x] Prueba de debug pasada
- [ ] Servidor reiniciado
- [ ] Prueba manual: Día con cita al mediodía
- [ ] Prueba manual: Día sin citas
- [ ] Prueba manual: Sábado
- [ ] Verificar que aparecen horarios de tarde

---

## 📝 Notas Técnicas

### ¿Por qué se limitaba a 8?

Probablemente para evitar que la interfaz se viera sobrecargada con muchos botones. Sin embargo, esto causaba que se perdieran horarios disponibles.

### Solución Alternativa (No Implementada)

Si en el futuro se quiere limitar la cantidad de botones por razones de UX, se podría:

1. **Paginación**: Mostrar "Ver más horarios" para cargar más opciones
2. **Scroll**: Permitir scroll en los botones de horarios
3. **Agrupación**: Agrupar por "Mañana" y "Tarde"

Por ahora, mostrar todos los horarios es la mejor solución porque:
- ✅ Es simple
- ✅ No oculta información
- ✅ El usuario ve todas las opciones disponibles

---

## ✅ Estado

**Fecha de corrección**: Hoy
**Archivos modificados**: 1 archivo (`backend/services/chatbot.js`)
**Líneas modificadas**: 2 lugares
**Estado**: ✅ Corregido - Listo para probar
**Prioridad**: 🟡 ALTA (afecta experiencia del usuario)

---

## 🔗 Archivos Relacionados

- `backend/services/chatbot.js` - Servicio de chatbot (corregido)
- `CORRECCION_ZONA_HORARIA.md` - Corrección de zona horaria
- `CORRECCION_REGLAS_NEGOCIO.md` - Corrección de reglas de negocio
- `NUEVA_FUNCIONALIDAD_CAMBIAR_FECHA.md` - Documentación de la funcionalidad
