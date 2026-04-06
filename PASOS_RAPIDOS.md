# 🚀 Pasos Rápidos para Configurar Todo

## 1️⃣ Configurar Variables de Entorno (2 minutos)

Abre el archivo `.env` en la raíz y reemplaza con tus datos reales:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ...tu-clave-real...
```

**Dónde encontrar estos datos:**
- Ve a [Supabase Dashboard](https://app.supabase.com)
- Abre tu proyecto
- Settings → API
- Copia "Project URL" y "anon public key"

---

## 2️⃣ Instalar Dependencias (1 minuto)

```bash
npm install
```

---

## 3️⃣ Insertar Datos de Ejemplo en Supabase (3 minutos)

1. Ve a Supabase Dashboard → SQL Editor
2. Haz clic en "New Query"
3. Copia y pega TODO el contenido del archivo `supabase_datos_ejemplo.sql`
4. Haz clic en "Run" (botón verde)
5. Deberías ver: "Servicios insertados: 7" y "Testimonios insertados: 4"

---

## 4️⃣ Iniciar el Servidor (1 minuto)

```bash
npm run dev
```

Abre tu navegador en: `http://localhost:3000`

---

## 5️⃣ Probar que Todo Funciona (2 minutos)

✅ **Página principal:** Deberías ver 4 servicios con imágenes
✅ **Testimonios:** Deberías ver 4 testimonios al final de la página
✅ **Hacer una reserva:**
   1. Haz clic en "Reservar" en cualquier servicio
   2. Selecciona una fecha
   3. Selecciona una hora disponible
   4. Llena el formulario
   5. Confirma la reserva
   6. Deberías ver mensaje de éxito

✅ **Verificar en Supabase:**
   1. Ve a Table Editor → citas
   2. Deberías ver tu reserva
   3. Ve a Table Editor → clientes
   4. Deberías ver tu cliente creado automáticamente

---

## 6️⃣ Agregar Tus Propias Imágenes (cuando quieras)

### Opción A: Usar URLs de internet
1. Ve a Supabase → Table Editor → servicios
2. Haz clic en una fila para editarla
3. En el campo `imagen_url` pega una URL completa
4. Guarda

### Opción B: Subir a Supabase Storage
1. Ve a Supabase → Storage
2. Crea un bucket llamado `servicios-imagenes`
3. Configúralo como público
4. Sube tus imágenes
5. Copia la URL pública
6. Pégala en el campo `imagen_url` de la tabla servicios

**URLs de ejemplo que puedes usar:**
```
https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop
https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop
https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop
```

---

## 📍 Archivos Importantes

- `DOCUMENTACION_BASE_DATOS.md` - Documentación completa y detallada
- `SUPABASE_SETUP.md` - Guía de configuración de Supabase
- `supabase_datos_ejemplo.sql` - Script para insertar datos de prueba
- `.env` - Variables de entorno (NO subir a Git)

---

## 🐛 Si Algo No Funciona

**Error: "Cannot connect to Supabase"**
→ Verifica que las variables en `.env` sean correctas

**Error: "No services found"**
→ Ejecuta el script SQL `supabase_datos_ejemplo.sql`

**Las imágenes no cargan**
→ Verifica que el campo `imagen_url` tenga URLs válidas

**Error al crear reserva**
→ Verifica que tengas al menos 1 servicio activo en la base de datos

---

## 🎨 Paleta de Colores Actual

La página usa estos colores delicados y femeninos:
- Púrpura oscuro: `#522566`
- Púrpura medio: `#7A3A8E`
- Lila: `#AD74C3`
- Lila claro: `#EADFF0`
- Rosa/lila pálido: `#F8EDFB`

---

## 📱 Configurar WhatsApp (Opcional)

En el archivo `.env`:
```env
WHATSAPP_NUMBER=573001234567
```

Reemplaza con tu número real (incluye código de país sin +)

---

## ✅ Checklist Final

- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Datos de ejemplo insertados en Supabase
- [ ] Servidor corriendo en localhost:3000
- [ ] Servicios visibles en la página principal
- [ ] Testimonios visibles
- [ ] Reserva de prueba creada exitosamente
- [ ] Reserva visible en Supabase → citas
- [ ] Cliente creado automáticamente en Supabase → clientes

---

## 🚀 Desplegar a Producción (Vercel)

1. Sube tu código a GitHub
2. Ve a [Vercel](https://vercel.com)
3. Importa tu repositorio
4. En Settings → Environment Variables agrega:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `WHATSAPP_NUMBER`
5. Deploy!

---

¡Listo! Tu spa está configurado y funcionando 🌿✨
