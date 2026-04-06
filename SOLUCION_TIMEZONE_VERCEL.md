# 🕐 SOLUCIÓN: Zona Horaria en Vercel

## ❌ Problema
Vercel no permite configurar la variable de entorno `TZ` directamente.

## ✅ Solución Implementada

### Cómo Funciona
En lugar de usar `process.env.TZ`, usamos la API nativa de JavaScript para manejar zonas horarias:

```javascript
// ❌ NO funciona en Vercel
process.env.TZ = 'America/Bogota'

// ✅ SÍ funciona en Vercel
const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
```

### Implementación en el Código

**Archivo:** `frontend/js/bookings.js`

```javascript
function getAvailableDates() {
  const dates = []
  const now = new Date()
  
  // Convertir a hora de Colombia usando la API de Intl
  const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
  const currentHour = colombiaTime.getHours()
  
  // Si son más de las 18:00 (6 PM), empezar desde 2 días adelante
  const startDay = currentHour >= 18 ? 2 : 1
  
  for (let i = startDay; dates.length < 15; i++) {
    const d = new Date(colombiaTime)
    d.setDate(colombiaTime.getDate() + i)
    if (d.getDay() !== 0) dates.push(d)
  }
  return dates
}
```

### Ventajas de Esta Solución

1. ✅ **Funciona en Vercel** - No requiere variables de entorno especiales
2. ✅ **Funciona en cualquier servidor** - Compatible con cualquier plataforma
3. ✅ **Preciso** - Usa la API nativa de JavaScript para zonas horarias
4. ✅ **No requiere librerías** - No necesita moment-timezone ni otras dependencias

### Cómo Vercel Maneja las Fechas

**En el servidor (Vercel):**
- Vercel usa UTC por defecto
- Nuestro código convierte UTC → Colombia en el frontend

**En Supabase:**
- Ejecuta `configurar_zona_horaria.sql` para que las fechas se guarden en hora Colombia
- Los timestamps se almacenan con timezone

### Variables de Entorno Necesarias en Vercel

Solo necesitas estas 2 variables:

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ...tu-key...
```

**NO agregues:**
- ❌ `TZ` (Vercel no lo permite)
- ❌ `TIMEZONE` (No es necesario)

### Verificación

Para verificar que funciona correctamente:

1. **Prueba local:**
```bash
npm start
# Abre http://localhost:3000/reservas.html
# Verifica que el calendario muestre fechas correctas según la hora
```

2. **Prueba en Vercel:**
- Despliega a Vercel
- Abre la página de reservas
- Verifica que después de las 6 PM Colombia, el calendario empiece desde día+2

### Ejemplo de Comportamiento

**Hora actual en Colombia: 5:00 PM (17:00)**
```javascript
const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
// colombiaTime.getHours() = 17
// startDay = 1 (mañana)
// Calendario muestra: Mañana, Pasado mañana, etc.
```

**Hora actual en Colombia: 7:00 PM (19:00)**
```javascript
const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
// colombiaTime.getHours() = 19
// startDay = 2 (pasado mañana)
// Calendario muestra: Pasado mañana, día siguiente, etc.
```

### Supabase Timezone

Para que las fechas se guarden correctamente en Supabase, ejecuta:

```sql
-- En Supabase SQL Editor
ALTER DATABASE postgres SET timezone TO 'America/Bogota';

-- Verifica que funcionó
SHOW timezone;
-- Debe mostrar: America/Bogota
```

## 🎉 Resultado

Con esta solución:
- ✅ El calendario respeta la hora de Colombia
- ✅ La restricción de 6 PM funciona correctamente
- ✅ No hay errores de variables de entorno en Vercel
- ✅ Las fechas se guardan correctamente en Supabase
