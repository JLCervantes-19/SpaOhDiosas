# 🚀 INSTRUCCIONES PARA VERCEL

## ✅ SOLUCIÓN AL ERROR DE TZ

El error "The following environment variables can not be configured: TZ" está resuelto.

**Cambios realizados:**
1. ✅ Removida variable `TZ` de `vercel.json`
2. ✅ Removido `process.env.TZ` de `backend/server.js`
3. ✅ Zona horaria manejada en JavaScript con API nativa

---

## 📝 VARIABLES DE ENTORNO EN VERCEL

Solo necesitas configurar estas 2 variables:

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ...tu-key-aqui...
```

### Cómo agregarlas:
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega cada variable:
   - Name: `SUPABASE_URL`
   - Value: Tu URL de Supabase
   - Click "Add"
4. Repite para `SUPABASE_ANON_KEY`

---

## 🚀 DEPLOY AHORA

### Método 1: Desde GitHub
```bash
git add .
git commit -m "Fix: Removida variable TZ para Vercel"
git push
```

Vercel detectará el push y desplegará automáticamente.

### Método 2: Vercel CLI
```bash
vercel --prod
```

---

## ✅ VERIFICACIÓN POST-DEPLOY

### 1. Probar Restricción de 6 PM
- Abre tu sitio en Vercel
- Ve a la página de reservas
- Verifica que el calendario muestre fechas correctas

### 2. Probar Validaciones
- Email sin @ → Debe dar error
- Teléfono corto → Debe dar error
- Email con @ → Debe funcionar

### 3. Crear una Reserva de Prueba
1. Selecciona servicio
2. Elige fecha y hora
3. Completa datos
4. Confirma
5. Verifica en Supabase que llegó con estado `confirmada`

---

## 🔧 SI ALGO FALLA

### Error: "Cannot connect to Supabase"
✅ Verifica que las variables de entorno estén correctas en Vercel

### Error: "Invalid estado"
✅ Ejecuta `fix_estados_citas.sql` en Supabase

### Calendario no respeta 6 PM
✅ Verifica que el código en `frontend/js/bookings.js` tenga:
```javascript
const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
```

---

## 📱 ACTUALIZAR CONTACTO

Antes de lanzar, actualiza estos datos:

**WhatsApp:** Busca `573001234567` y reemplaza con tu número
**Dirección:** Busca `Carrera 1 # 2-3, Riohacha` y actualiza

Archivos a revisar:
- `frontend/index.html`
- `frontend/reservas.html`
- `frontend/js/main.js`

---

## 🎉 ¡LISTO!

Tu spa está listo para producción con:
- ✅ Zona horaria Colombia funcionando
- ✅ Sin errores de variables de entorno
- ✅ Todas las validaciones implementadas
- ✅ Diseño morado/lila femenino
- ✅ Integración con Supabase

**Ahora sí puedes hacer deploy sin problemas.**
