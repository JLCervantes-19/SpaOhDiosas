# ⏰ Configuración de Zona Horaria - Colombia

## 🎯 Problema
Las fechas y horas se guardan en UTC (hora universal) en lugar de hora de Colombia (COT - Colombia Time, UTC-5).

## ✅ Solución Implementada

### 1. Backend (Node.js)
Configurado en `backend/server.js`:
```javascript
process.env.TZ = 'America/Bogota'
```

Esto hace que todas las fechas en Node.js usen hora de Colombia.

### 2. Supabase (PostgreSQL)
Ejecuta el script `configurar_zona_horaria.sql` en Supabase SQL Editor.

Esto configura:
- Zona horaria de la base de datos
- Columnas `created_at` con tipo `timestamptz` (timestamp with timezone)
- Valores por defecto con hora de Colombia

### 3. Vercel (Producción)
Configurado en `vercel.json`:
```json
{
  "env": {
    "TZ": "America/Bogota"
  }
}
```

Esto asegura que en producción también use hora de Colombia.

---

## 📋 Pasos para Configurar

### Paso 1: Ejecutar SQL en Supabase (5 minutos)

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. SQL Editor → New Query
3. Copia y pega el contenido de `configurar_zona_horaria.sql`
4. Haz clic en "Run"
5. Deberías ver: "Zona horaria configurada correctamente ✓"

### Paso 2: Reiniciar Servidor Local

```bash
# Detener servidor (Ctrl+C)
npm run dev
```

### Paso 3: Probar

Crea una reserva y verifica en Supabase que `created_at` tenga la hora correcta de Colombia.

---

## 🔍 Verificar que Funciona

### En Supabase:
```sql
-- Ver zona horaria actual
SHOW timezone;
-- Debería mostrar: America/Bogota

-- Ver hora actual
SELECT NOW();
-- Debería mostrar hora de Colombia (UTC-5)
```

### En tu aplicación:
```javascript
console.log(new Date().toString())
// Debería mostrar: ... GMT-0500 (Colombia Standard Time)
```

---

## 🌍 Zonas Horarias de Colombia

Colombia usa **COT (Colombia Time)**:
- **UTC-5** todo el año
- **NO tiene horario de verano** (daylight saving time)
- Misma zona que: Perú, Ecuador, Panamá (parte)

---

## 📊 Cómo se Guardan las Fechas

### Antes (Problema):
```
Usuario crea cita a las 10:00 AM (Colombia)
→ Se guarda: 2026-04-05 15:00:00 (UTC)
→ Se muestra: 10:00 AM (correcto, pero confuso)
```

### Después (Solución):
```
Usuario crea cita a las 10:00 AM (Colombia)
→ Se guarda: 2026-04-05 10:00:00-05 (Colombia)
→ Se muestra: 10:00 AM (correcto y claro)
```

---

## 🚀 Para Vercel (Producción)

### Opción 1: Variables de Entorno (Recomendado)
Ya está configurado en `vercel.json`, pero también puedes agregarlo en:

1. Vercel Dashboard → Tu Proyecto
2. Settings → Environment Variables
3. Agregar:
   - Name: `TZ`
   - Value: `America/Bogota`
   - Environments: Production, Preview, Development

### Opción 2: Verificar en Vercel
Después de desplegar, verifica con:
```javascript
// En tu API
app.get('/api/test-timezone', (req, res) => {
  res.json({
    timezone: process.env.TZ,
    date: new Date().toString(),
    iso: new Date().toISOString()
  })
})
```

---

## 🐛 Solución de Problemas

### Problema: Las fechas siguen en UTC
**Solución:**
1. Verifica que ejecutaste el SQL en Supabase
2. Reinicia el servidor Node.js
3. Limpia caché del navegador

### Problema: En Vercel las fechas están mal
**Solución:**
1. Verifica que `vercel.json` tenga `"TZ": "America/Bogota"`
2. Re-despliega el proyecto
3. Verifica variables de entorno en Vercel Dashboard

### Problema: Supabase muestra hora diferente
**Solución:**
```sql
-- Ejecuta esto en Supabase
SET timezone = 'America/Bogota';
SELECT NOW();
```

---

## 📝 Archivos Modificados

- ✅ `backend/server.js` - Configurado TZ
- ✅ `vercel.json` - Agregado env TZ
- ✅ `configurar_zona_horaria.sql` - Script para Supabase

---

## 🎯 Checklist

- [ ] Ejecutar `configurar_zona_horaria.sql` en Supabase
- [ ] Verificar con `SHOW timezone;` en Supabase
- [ ] Reiniciar servidor local
- [ ] Crear una cita de prueba
- [ ] Verificar en Supabase que `created_at` tenga hora correcta
- [ ] Desplegar a Vercel
- [ ] Verificar en producción que las fechas sean correctas

---

¡Listo! Ahora todas las fechas y horas estarán en hora de Colombia 🇨🇴⏰
