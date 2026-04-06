# ⚡ ACCIÓN INMEDIATA - Arreglar Estados de Citas

## 🎯 Problema
El sistema está intentando crear citas con estado `'pendiente'` pero la base de datos solo acepta: `confirmada`, `cancelada`, `asistio`, `no_asistio`

## ✅ Solución en 3 Pasos

### Paso 1: Ejecutar SQL en Supabase (2 minutos)

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Abre tu proyecto
3. Ve a **SQL Editor** → **New Query**
4. Copia y pega esto:

```sql
-- Eliminar constraint antiguo
ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_estado_check;
ALTER TABLE citas DROP CONSTRAINT IF EXISTS estado_check;

-- Crear constraint correcto
ALTER TABLE citas 
ADD CONSTRAINT estado_check 
CHECK (estado IN ('confirmada', 'cancelada', 'asistio', 'no_asistio'));

-- Actualizar registros existentes si los hay
UPDATE citas SET estado = 'confirmada' 
WHERE estado NOT IN ('confirmada', 'cancelada', 'asistio', 'no_asistio');

-- Verificar
SELECT 'Estados configurados correctamente ✓' as resultado;
```

5. Haz clic en **Run** (botón verde)
6. Deberías ver: "Estados configurados correctamente ✓"

---

### Paso 2: Reiniciar el Servidor (30 segundos)

En tu terminal:

```bash
# Detener el servidor (Ctrl+C)
# Luego iniciar de nuevo:
npm run dev
```

---

### Paso 3: Probar una Reserva (1 minuto)

1. Abre `http://localhost:3000`
2. Haz clic en "Reservar" en cualquier servicio
3. Selecciona fecha y hora
4. Llena el formulario
5. Confirma la reserva
6. ✅ Debería funcionar sin errores

---

## 🔍 Verificar que Funcionó

Ve a Supabase → Table Editor → citas

Deberías ver tu nueva cita con:
- `estado: confirmada` ✓
- Todos los demás campos llenos

---

## 📊 Estados del Sistema

| Estado | Cuándo se usa |
|--------|---------------|
| `confirmada` | Cuando el cliente hace la reserva (INICIAL) |
| `cancelada` | Cuando se cancela la cita |
| `asistio` | Después de que el cliente recibe el servicio |
| `no_asistio` | Cuando el cliente no se presenta |

---

## 🚨 Si Aún Tienes Problemas

1. Verifica que ejecutaste el SQL correctamente
2. Reinicia el servidor
3. Abre la consola del navegador (F12) y busca errores
4. Dime qué error específico aparece

---

## 📁 Archivos Actualizados

Ya actualicé estos archivos en tu proyecto:
- ✅ `backend/routes/bookings.js` - Usa estado 'confirmada'
- ✅ `fix_estados_citas.sql` - Script SQL para arreglar la base de datos
- ✅ `FLUJO_RESERVAS_COMPLETO.md` - Documentación completa del flujo
- ✅ `queries_utiles.sql` - Queries actualizados con estados correctos

---

¡Ejecuta el SQL y prueba de nuevo! 🚀
