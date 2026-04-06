# 📊 Documentación Completa de Base de Datos - Serenità Spa

## 🗄️ Estructura de Tablas en Supabase

### 1. Tabla: `servicios`
Almacena todos los tratamientos y servicios del spa.

**Columnas:**
- `id` (uuid, PRIMARY KEY) - Identificador único del servicio
- `nombre` (text, NOT NULL) - Nombre del servicio (ej: "Masaje Relajante")
- `descripcion` (text, NULLABLE) - Descripción detallada del tratamiento
- `precio` (numeric, NULLABLE) - Precio en COP
- `duracion_min` (int4, NULLABLE) - Duración del servicio en minutos
- `buffer_min` (int4, NULLABLE) - Tiempo de preparación/limpieza entre citas
- `imagen_url` (text, NULLABLE) - **URL de la imagen del servicio**
- `activo` (bool, NULLABLE) - Si el servicio está disponible para reservar
- `categoria` (text, NULLABLE) - Categoría del servicio (ej: "Facial", "Masaje", "Cuerpo")

**Cómo agregar imágenes:**
1. Ve a Supabase → Table Editor → servicios
2. Haz clic en "Insert row" o edita una fila existente
3. En el campo `imagen_url` pega la URL completa de la imagen
4. Puedes usar:
   - URLs de Unsplash: `https://images.unsplash.com/photo-xxxxx`
   - URLs de tu propio hosting
   - URLs de Supabase Storage (si subes las imágenes allí)

**Ejemplo de datos:**
```json
{
  "nombre": "Masaje Relajante",
  "descripcion": "Masaje de cuerpo completo con aceites esenciales",
  "precio": 150000,
  "duracion_min": 60,
  "buffer_min": 15,
  "imagen_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874",
  "activo": true,
  "categoria": "Masaje"
}
```

---

### 2. Tabla: `clientes`
Almacena información de los clientes del spa.

**Columnas:**
- `id` (uuid, PRIMARY KEY) - Identificador único del cliente
- `nombre` (text, NOT NULL) - Nombre completo del cliente
- `telefono` (text, UNIQUE, NULLABLE) - Número de teléfono (único)
- `email` (text, NULLABLE) - Correo electrónico
- `fecha_registro` (timestamp, NULLABLE) - Fecha de primer registro
- `origen` (text, NULLABLE) - De dónde vino el cliente (web, whatsapp, etc)

**Flujo automático:**
- Cuando un cliente hace una reserva, el sistema:
  1. Busca si ya existe un cliente con ese teléfono
  2. Si existe, usa ese cliente_id
  3. Si no existe, crea un nuevo cliente automáticamente

---

### 3. Tabla: `citas`
Almacena todas las reservas/citas del spa.

**Columnas:**
- `id` (uuid, PRIMARY KEY) - Identificador único de la cita
- `cliente_id` (uuid, FOREIGN KEY → clientes) - Referencia al cliente
- `servicio_id` (uuid, FOREIGN KEY → servicios) - Referencia al servicio
- `fecha` (date, NULLABLE) - Fecha de la cita (YYYY-MM-DD)
- `hora_inicio` (time, NULLABLE) - Hora de inicio (HH:MM)
- `hora_fin` (time, NULLABLE) - Hora de finalización (HH:MM)
- `estado` (text, NULLABLE) - Estado: "pendiente", "confirmada", "completada", "cancelada"
- `origen` (text, NULLABLE) - Origen de la reserva (web, whatsapp, telefono)
- `created_at` (timestamp, NULLABLE) - Fecha de creación del registro
- `notas` (text, NULLABLE) - Notas adicionales del cliente
- `duracion_total` (int4, NULLABLE) - Duración total incluyendo buffer

**Estados de cita:**
- `pendiente` - Recién creada, esperando confirmación
- `confirmada` - Confirmada por el spa
- `completada` - Servicio realizado
- `cancelada` - Cancelada por cliente o spa

---

### 4. Tabla: `testimonios`
Almacena reseñas y testimonios de clientes.

**Columnas:**
- `id` (uuid, PRIMARY KEY) - Identificador único
- `nombre` (text, NOT NULL) - Nombre del cliente que deja el testimonio
- `servicio_id` (uuid, FOREIGN KEY → servicios, NULLABLE) - Servicio relacionado
- `rating` (int4, NULLABLE) - Calificación de 1 a 5 estrellas
- `texto` (text, NOT NULL) - Contenido del testimonio
- `activo` (bool, NULLABLE) - Si se muestra en la web
- `created_at` (timestamp, NULLABLE) - Fecha de creación

---

## 🔄 Flujo de Reservas (Frontend → Backend → Supabase)

### Paso 1: Usuario selecciona servicio
**Archivo:** `frontend/reservas.html`
- Usuario ve lista de servicios desde `/api/services`
- Selecciona un servicio del dropdown

### Paso 2: Usuario selecciona fecha
**Archivo:** `frontend/js/bookings.js`
- Sistema genera calendario de próximos 14 días
- Usuario hace clic en una fecha

### Paso 3: Sistema consulta horarios disponibles
**Endpoint:** `GET /api/bookings?servicio={id}&fecha={YYYY-MM-DD}`
**Archivo backend:** `backend/routes/bookings.js`

**Proceso:**
1. Obtiene el servicio de Supabase (duracion_min + buffer_min)
2. Consulta todas las citas del día en Supabase
3. Genera slots de 30 minutos según horario del spa
4. Marca como ocupados los slots que se cruzan con citas existentes
5. Retorna array de slots: `[{ hora: "09:00", disponible: true }, ...]`

### Paso 4: Usuario selecciona hora y llena formulario
- Usuario hace clic en un slot disponible
- Llena: nombre, teléfono, email (opcional), notas (opcional)

### Paso 5: Usuario confirma reserva
**Endpoint:** `POST /api/bookings`
**Archivo backend:** `backend/routes/bookings.js`

**Proceso:**
1. **Validación:** Verifica que todos los campos requeridos estén presentes
2. **Cliente:**
   - Busca en tabla `clientes` si existe un cliente con ese teléfono
   - Si existe: usa ese `cliente_id`
   - Si no existe: crea nuevo cliente y obtiene `cliente_id`
3. **Servicio:** Obtiene datos del servicio desde tabla `servicios`
4. **Disponibilidad:** Verifica nuevamente que el horario siga disponible
5. **Crear cita:** Inserta registro en tabla `citas` con:
   - `cliente_id`
   - `servicio_id`
   - `fecha`, `hora_inicio`, `hora_fin`
   - `duracion_total` (duracion_min + buffer_min)
   - `estado: "pendiente"`
   - `origen: "web"`
   - `notas`
6. **Respuesta:** Retorna la cita creada con mensaje de éxito

### Paso 6: Confirmación al usuario
**Archivo:** `frontend/js/bookings.js`
- Muestra pantalla de éxito con detalles de la reserva
- Opción de agregar a calendario
- Botón para contactar por WhatsApp

---

## 📍 Dónde Ver y Gestionar los Datos

### En Supabase Dashboard:

1. **Ver servicios:**
   - Ve a: Table Editor → servicios
   - Aquí puedes agregar, editar o eliminar servicios
   - Para agregar imagen: edita la fila y pega URL en `imagen_url`

2. **Ver clientes:**
   - Ve a: Table Editor → clientes
   - Lista de todos los clientes registrados
   - Puedes ver teléfono, email, origen

3. **Ver reservas/citas:**
   - Ve a: Table Editor → citas
   - Lista de todas las reservas
   - Puedes cambiar el `estado` manualmente
   - Haz clic en `cliente_id` o `servicio_id` para ver detalles relacionados

4. **Ver testimonios:**
   - Ve a: Table Editor → testimonios
   - Puedes activar/desactivar con el campo `activo`

### Queries SQL útiles:

**Ver citas con información completa:**
```sql
SELECT 
  citas.*,
  clientes.nombre as cliente_nombre,
  clientes.telefono,
  servicios.nombre as servicio_nombre,
  servicios.precio
FROM citas
JOIN clientes ON citas.cliente_id = clientes.id
JOIN servicios ON citas.servicio_id = servicios.id
ORDER BY citas.fecha DESC, citas.hora_inicio DESC;
```

**Ver citas de hoy:**
```sql
SELECT * FROM citas 
WHERE fecha = CURRENT_DATE 
ORDER BY hora_inicio;
```

**Ver servicios más reservados:**
```sql
SELECT 
  servicios.nombre,
  COUNT(citas.id) as total_reservas
FROM servicios
LEFT JOIN citas ON servicios.id = citas.servicio_id
GROUP BY servicios.id, servicios.nombre
ORDER BY total_reservas DESC;
```

---

## 🔧 Configuración de Imágenes

### Opción 1: Usar Unsplash (Recomendado para pruebas)
```
https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop
```

### Opción 2: Usar Supabase Storage
1. Ve a Storage en Supabase
2. Crea un bucket llamado `servicios-imagenes`
3. Configura como público
4. Sube tus imágenes
5. Copia la URL pública y pégala en `imagen_url`

### Opción 3: Usar tu propio hosting
- Sube imágenes a tu servidor
- Usa URLs completas: `https://tudominio.com/imagenes/servicio1.jpg`

**Formato recomendado de imágenes:**
- Tamaño: 600x400px mínimo
- Formato: JPG o WebP
- Peso: Menos de 200KB

---

## 🚀 Endpoints de la API

### Servicios
- `GET /api/services` - Lista todos los servicios activos
- `GET /api/services/:id` - Obtiene un servicio específico
- `POST /api/services` - Crea un nuevo servicio (admin)

### Reservas/Citas
- `GET /api/bookings?servicio={id}&fecha={YYYY-MM-DD}` - Obtiene slots disponibles
- `POST /api/bookings` - Crea una nueva reserva
- `GET /api/bookings/all` - Lista todas las citas (admin)
- `GET /api/bookings/all?fecha={YYYY-MM-DD}` - Citas de una fecha específica
- `PATCH /api/bookings/:id/status` - Actualiza estado de una cita

### Testimonios
- `GET /api/testimonials` - Lista todos los testimonios activos

### Contacto
- `POST /api/contact` - Envía mensaje de contacto

---

## 🔐 Variables de Entorno

**Archivo:** `.env` (raíz del proyecto)

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ...tu-anon-key...
WHATSAPP_NUMBER=573001234567
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/nueva-cita
```

**Para Vercel (producción):**
- Ve a Vercel Dashboard → Settings → Environment Variables
- Agrega las mismas variables

---

## 📝 Checklist de Configuración

- [ ] Tablas creadas en Supabase (servicios, clientes, citas, testimonios)
- [ ] Variables de entorno configuradas en `.env`
- [ ] Dependencias instaladas (`npm install`)
- [ ] Al menos 1 servicio agregado en tabla `servicios`
- [ ] Campo `imagen_url` llenado con URLs de imágenes
- [ ] Servicios marcados como `activo: true`
- [ ] Servidor corriendo (`npm run dev`)
- [ ] Probar crear una reserva desde el frontend
- [ ] Verificar que la cita aparece en tabla `citas` de Supabase
- [ ] Verificar que el cliente aparece en tabla `clientes`

---

## 🐛 Solución de Problemas

**Problema:** Las tarjetas de servicios muestran "undefined"
- **Causa:** Falta agregar servicios en Supabase o campo `activo` está en `false`
- **Solución:** Ve a Table Editor → servicios y agrega servicios con `activo: true`

**Problema:** Las imágenes no cargan
- **Causa:** Campo `imagen_url` vacío o URL inválida
- **Solución:** Agrega URLs válidas en el campo `imagen_url`

**Problema:** Error al crear reserva
- **Causa:** Faltan foreign keys o estructura de tabla incorrecta
- **Solución:** Verifica que las tablas tengan las relaciones correctas

**Problema:** No se conecta a Supabase
- **Causa:** Variables de entorno incorrectas
- **Solución:** Verifica `.env` y reinicia el servidor

---

## 📞 Soporte

Para más información sobre Supabase:
- Documentación: https://supabase.com/docs
- Dashboard: https://app.supabase.com
