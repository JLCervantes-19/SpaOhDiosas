# ⏰ Configuración de Zona Horaria - Colombia

## 🎯 Problema
Las fechas y horas deben usar la zona horaria de Colombia (COT - Colombia Time, UTC-5).

## ✅ Solución Implementada (Compatible con Vercel)

### 1. Frontend (JavaScript)
**Archivo:** `frontend/js/bookings.js`

Usamos la API nativa de JavaScript para manejar la zona horaria:

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

**Ventajas:**
- ✅ Funciona en Vercel sin configuración especial
- ✅ No requiere variables de entorno
- ✅ Usa la API estándar de JavaScript (Intl)
- ✅ Compatible con todos los navegadores modernos

### 2. Supabase (PostgreSQL)
Ejecuta el script `configurar_zona_horaria.sql` en Supabase SQL Editor:

```sql
-- Configurar zona horaria de la base de datos
ALTER DATABASE postgres SET timezone TO 'America/Bogota';

-- Verificar configuración
SHOW timezone;
-- Debe mostrar: America/Bogota
```

Esto configura:
- Zona horaria de la base de datos
- Columnas `created_at` con tipo `timestamptz` (timestamp with timezone)
- Valores por defecto con hora de Colombia

### 3. Vercel (Producción)
**No requiere configuración especial.**

La zona horaria se maneja en el código JavaScript del frontend, por lo que funciona automáticamente en Vercel.

## 🧪 Verificación

### Probar Localmente
```bash
npm start
# Abre http://localhost:3000/reservas.html
# Verifica que el calendario respete la hora de Colombia
```

### Probar en Vercel
1. Despliega a Vercel
2. Abre la página de reservas
3. Verifica el comportamiento:
   - Antes de 6 PM Colombia: Muestra desde mañana
   - Después de 6 PM Colombia: Muestra desde pasado mañana

### Verificar en Supabase
1. Crea una cita desde la web
2. Ve a Supabase → Table Editor → citas
3. Verifica que `created_at` muestre hora de Colombia

## 📋 Ejemplo de Comportamiento

**Escenario 1: Son las 5:00 PM en Colombia**
```javascript
const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
// colombiaTime.getHours() = 17
// startDay = 1
// Calendario muestra: Mañana, Pasado mañana, etc.
```

**Escenario 2: Son las 7:00 PM en Colombia**
```javascript
const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
// colombiaTime.getHours() = 19
// startDay = 2
// Calendario muestra: Pasado mañana, día siguiente, etc.
```

## ❌ Lo que NO se necesita

- ❌ Variable de entorno `TZ` en Vercel (no está permitida)
- ❌ Librería moment-timezone
- ❌ Configuración especial en el servidor
- ❌ `process.env.TZ` en Node.js

## ✅ Resumen

La zona horaria de Colombia se maneja de forma nativa en JavaScript usando:
```javascript
new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
```

Esta solución:
- Funciona en cualquier plataforma (Vercel, Netlify, etc.)
- No requiere configuración de servidor
- Es precisa y confiable
- Compatible con todos los navegadores modernos
