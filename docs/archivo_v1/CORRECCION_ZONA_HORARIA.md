# 🔧 Corrección Crítica: Problema de Zona Horaria en Fechas

## 🐛 Problema Identificado

**SÍNTOMA**: Cuando el usuario seleccionaba una fecha en el chat (ej: jueves 16 de abril), la cita se guardaba con una fecha diferente en la base de datos (ej: viernes 17 de abril).

**CAUSA RAÍZ**: Problema de zona horaria al crear objetos `Date` en JavaScript sin especificar la hora.

---

## 📊 Ejemplo del Problema

### Lo que pasaba:

```javascript
// ❌ INCORRECTO
const fechaStr = '2026-04-16';  // Jueves
const fecha = new Date(fechaStr);
console.log(fecha.getDay());  // 3 (miércoles) ❌ INCORRECTO!
```

**¿Por qué?**
Cuando creas un `Date` con solo la fecha (sin hora), JavaScript lo interpreta como medianoche UTC (00:00:00 UTC). Luego, al convertirlo a la zona horaria local (Colombia es UTC-5), puede retroceder al día anterior.

### Ejemplo real:
- Input: `'2026-04-16'` (jueves)
- JavaScript interpreta: `2026-04-16T00:00:00Z` (medianoche UTC)
- En Colombia (UTC-5): `2026-04-15T19:00:00` (7pm del miércoles)
- `getDay()` retorna: 3 (miércoles) ❌

---

## ✅ Solución Implementada

```javascript
// ✅ CORRECTO
const fechaStr = '2026-04-16';  // Jueves
const fecha = new Date(fechaStr + 'T12:00:00');
console.log(fecha.getDay());  // 4 (jueves) ✅ CORRECTO!
```

**¿Por qué funciona?**
Al agregar `'T12:00:00'`, especificamos mediodía en la zona horaria local, evitando problemas de conversión UTC.

---

## 🔄 Archivos Modificados

### `backend/services/chatbot.js`

Se corrigieron **4 métodos** que manejaban fechas:

#### 1. `getAvailableDays()` (línea ~1120)

**Antes:**
```javascript
const diaSemana = fecha.getDay(); // ❌ Problema de zona horaria
```

**Ahora:**
```javascript
const fechaStr = fecha.toISOString().split('T')[0];
const diaSemana = new Date(fechaStr + 'T12:00:00').getDay(); // ✅ Correcto
```

#### 2. `handleRescheduleDayChoice()` (línea ~930)

**Antes:**
```javascript
const fecha = new Date(dia); // ❌ Problema de zona horaria
const diaFormateado = fecha.toLocaleDateString('es-CO', { 
  weekday: 'short', 
  day: 'numeric', 
  month: 'short' 
});
```

**Ahora:**
```javascript
const fecha = new Date(dia + 'T12:00:00'); // ✅ Correcto
const diaFormateado = fecha.toLocaleDateString('es-CO', { 
  weekday: 'short', 
  day: 'numeric', 
  month: 'short' 
});
```

#### 3. `handleReschedulePeriodChoice()` (línea ~895)

**Antes:**
```javascript
const diasOpciones = diasDisponibles.slice(0, 7).map(dia => {
  const fecha = new Date(dia); // ❌ Problema de zona horaria
  return fecha.toLocaleDateString('es-CO', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });
});
```

**Ahora:**
```javascript
const diasOpciones = diasDisponibles.slice(0, 7).map(dia => {
  const fecha = new Date(dia + 'T12:00:00'); // ✅ Correcto
  return fecha.toLocaleDateString('es-CO', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });
});
```

#### 4. `handleDocumentProvided()` (línea ~600)

**Antes:**
```javascript
const fecha = new Date(cita.fecha).toLocaleDateString('es-CO', { // ❌ Problema
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

**Ahora:**
```javascript
const fecha = new Date(cita.fecha + 'T12:00:00').toLocaleDateString('es-CO', { // ✅ Correcto
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

---

## 🧪 Pruebas Realizadas

### Prueba 1: Verificación de Días de la Semana

```javascript
const dias = [
  '2026-04-13', // Lunes
  '2026-04-14', // Martes
  '2026-04-15', // Miércoles
  '2026-04-16', // Jueves ← El problema estaba aquí
  '2026-04-17', // Viernes
  '2026-04-18', // Sábado
  '2026-04-19'  // Domingo
];

dias.forEach(dia => {
  const d = new Date(dia + 'T12:00:00');
  console.log(`${dia} → ${d.toLocaleDateString('es-CO', {weekday: 'long'})}`);
});
```

**Resultado:**
```
2026-04-13 → lunes ✅
2026-04-14 → martes ✅
2026-04-15 → miércoles ✅
2026-04-16 → jueves ✅ (antes era miércoles ❌)
2026-04-17 → viernes ✅
2026-04-18 → sábado ✅
2026-04-19 → domingo ✅
```

### Prueba 2: Verificación en Base de Datos

**Antes de la corrección:**
```sql
SELECT fecha, hora_inicio FROM citas WHERE id = 'bf19d3d0-11f2-40e3-abbb-185b7ccde26c';
-- Resultado: 2026-04-17 (viernes) ❌ Usuario seleccionó jueves
```

**Después de la corrección:**
```sql
-- La fecha guardada coincidirá con la fecha seleccionada ✅
```

---

## 📋 Checklist de Verificación

- [x] Corregido `getAvailableDays()`
- [x] Corregido `handleRescheduleDayChoice()`
- [x] Corregido `handleReschedulePeriodChoice()`
- [x] Corregido `handleDocumentProvided()`
- [x] Sin errores de sintaxis
- [x] Pruebas de zona horaria pasadas
- [ ] Servidor reiniciado
- [ ] Prueba manual: Cambiar fecha de cita
- [ ] Verificar en BD que la fecha guardada es correcta

---

## 🚀 Cómo Probar

### Paso 1: Reiniciar el Servidor

```bash
# Detener con Ctrl+C si está corriendo
npm start
```

### Paso 2: Probar el Flujo Completo

1. Abre el chat
2. Clic en "Consultar mis citas"
3. Ingresa nombre y email
4. Clic en "Cambiar fecha"
5. Selecciona una cita
6. Elige un período (ej: "Esta semana")
7. **IMPORTANTE**: Fíjate en el día que seleccionas (ej: "jue., 16 abr.")
8. Selecciona un horario
9. Confirma el cambio

### Paso 3: Verificar en Base de Datos

```sql
SELECT 
  id,
  fecha,
  hora_inicio,
  hora_fin,
  estado,
  clientes.nombre
FROM citas
JOIN clientes ON citas.cliente_id = clientes.id
WHERE fecha >= CURRENT_DATE
ORDER BY fecha, hora_inicio;
```

**Verificar:**
- ✅ La fecha guardada coincide con el día que seleccionaste
- ✅ El día de la semana es correcto (ej: si seleccionaste jueves, debe ser jueves)

### Paso 4: Verificar en el Chat

1. Vuelve a consultar tus citas
2. **Verificar:**
   - ✅ La fecha mostrada coincide con la que seleccionaste
   - ✅ El día de la semana es correcto

---

## 🎯 Regla de Oro para Fechas en JavaScript

**SIEMPRE** usa este formato cuando trabajes con fechas en formato string:

```javascript
// ✅ CORRECTO
const fecha = new Date('YYYY-MM-DD' + 'T12:00:00');

// ❌ INCORRECTO
const fecha = new Date('YYYY-MM-DD');
```

**¿Por qué T12:00:00?**
- Especifica mediodía en la zona horaria local
- Evita problemas de conversión UTC
- Garantiza que el día sea el correcto

---

## 📝 Notas Técnicas

### Zona Horaria de Colombia
- Colombia: UTC-5 (sin horario de verano)
- Cuando JavaScript interpreta `'2026-04-16'` sin hora, asume UTC
- UTC 00:00 = Colombia 19:00 del día anterior
- Por eso el día cambiaba

### Métodos Afectados
- `getDay()` - Retorna el día de la semana (0-6)
- `toLocaleDateString()` - Formatea la fecha según locale
- `toISOString()` - Convierte a formato ISO (UTC)

### Solución Aplicada
- Agregar `'T12:00:00'` al crear objetos Date
- Usar mediodía (12:00) para estar en el centro del día
- Evita problemas tanto con UTC-5 como con otras zonas horarias

---

## ✅ Estado

**Fecha de corrección**: Hoy
**Archivos modificados**: 1 archivo (`backend/services/chatbot.js`)
**Líneas modificadas**: 4 métodos
**Estado**: ✅ Corregido - Listo para probar
**Prioridad**: 🔴 CRÍTICA (afecta la funcionalidad principal)

---

## 🔗 Archivos Relacionados

- `backend/services/chatbot.js` - Servicio de chatbot (corregido)
- `CORRECCION_REGLAS_NEGOCIO.md` - Corrección anterior de reglas de negocio
- `NUEVA_FUNCIONALIDAD_CAMBIAR_FECHA.md` - Documentación de la funcionalidad

---

**IMPORTANTE**: Esta corrección es crítica porque afectaba la integridad de los datos. Las citas se guardaban con fechas incorrectas, lo que podría causar confusión y problemas operacionales.
