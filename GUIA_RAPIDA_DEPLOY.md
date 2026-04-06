# 🚀 GUÍA RÁPIDA DE DEPLOY A VERCEL

## ⚡ PASOS RÁPIDOS (5 minutos)

### 1. Configurar Supabase (2 min)
```sql
-- Ejecuta estos 2 scripts en Supabase SQL Editor:
-- 1. fix_estados_citas.sql
-- 2. configurar_zona_horaria.sql
```

### 2. Subir a GitHub (1 min)
```bash
git init
git add .
git commit -m "Spa listo para producción"
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

### 3. Deploy en Vercel (2 min)
1. Ve a [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Selecciona tu repo de GitHub
4. Agrega estas variables de entorno:

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ...tu-key...
TZ=America/Bogota
```

5. Click "Deploy"

---

## ✅ VERIFICACIÓN POST-DEPLOY

### Test 1: Restricción de 6 PM
- Abre la página de reservas
- Verifica que el calendario muestre fechas correctas

### Test 2: Validaciones
- Prueba email sin @ → Debe dar error
- Prueba teléfono corto → Debe dar error

### Test 3: Reserva Completa
1. Selecciona servicio
2. Elige fecha y hora
3. Completa datos
4. Confirma
5. Verifica en Supabase que llegó con estado `confirmada`

---

## 🔧 SI ALGO FALLA

### Error: "Cannot connect to Supabase"
- Verifica que las variables de entorno estén correctas
- Revisa que SUPABASE_URL y SUPABASE_ANON_KEY sean correctos

### Error: "Invalid estado"
- Ejecuta `fix_estados_citas.sql` en Supabase

### Hora incorrecta en created_at
- Ejecuta `configurar_zona_horaria.sql` en Supabase
- Verifica que TZ=America/Bogota esté en Vercel

---

## 📱 ACTUALIZAR CONTACTO

Busca y reemplaza en todos los archivos:
- `573001234567` → Tu número WhatsApp real
- `Carrera 1 # 2-3, Riohacha` → Tu dirección real

---

## 🎉 ¡LISTO!

Tu spa está en producción con:
✅ Validaciones de email y teléfono
✅ Restricción de calendario 6 PM
✅ Zona horaria Colombia
✅ Diseño morado/lila femenino
✅ Integración con Supabase

**URL de tu sitio:** `https://tu-proyecto.vercel.app`
