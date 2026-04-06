# 🌿 Serenità Spa — Vanilla Stack

Sistema web completo para spa: **HTML + Tailwind + JS Vanilla + Node.js + Express**. Sin frameworks, sin bundlers, listo para producción.

---

## 📁 Estructura

```
/
├── frontend/
│   ├── index.html          ← Landing page principal
│   ├── servicios.html      ← Catálogo completo
│   ├── reservas.html       ← Sistema de agendamiento 4 pasos
│   ├── css/
│   │   └── spa.css         ← Todos los estilos + design tokens
│   └── js/
│       ├── main.js         ← Navbar, WhatsApp, config global
│       ├── animations.js   ← Intersection Observer, parallax, counters
│       ├── services.js     ← Carga y renderiza servicios/testimonios
│       └── bookings.js     ← Lógica completa de agendamiento
│
├── backend/
│   ├── server.js           ← Servidor Express principal
│   └── routes/
│       ├── services.js     ← GET /api/services, testimonials
│       ├── bookings.js     ← GET /api/slots, POST /api/bookings
│       └── contact.js      ← POST /api/contact
│
├── data/
│   ├── services.json       ← Servicios del spa (editable)
│   └── testimonials.json   ← Reseñas de clientes (editable)
│
├── api/
│   └── index.js            ← Serverless function para Vercel
│
├── vercel.json             ← Configuración de deploy
└── package.json
```

---

## 🚀 Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo
npm run dev
# → http://localhost:3000

# Alternativa sin nodemon:
npm start
```

El servidor sirve el frontend estático en `/` y la API en `/api`.

---

## 🎨 Personalización

### 👉 Logo y nombre del spa
Abre `frontend/js/main.js` y cambia `SPA_CONFIG`:
```js
export const SPA_CONFIG = {
  nombre:   'Serenità Spa',     // ← Nombre del spa
  whatsapp: '573001234567',     // ← Número WhatsApp (sin + ni espacios)
  apiBase:  '/api',
}
```

También busca y reemplaza `Serenità Spa` en los archivos `.html`.

### 👉 Colores de marca
Abre `frontend/css/spa.css` y edita las variables en `:root`:
```css
:root {
  --gold:   #C9A961;   /* Color dorado */
  --forest: #2C4A2E;   /* Verde bosque */
  --cream:  #FAF8F5;   /* Fondo crema */
}
```

### 👉 Servicios y precios
Edita `data/services.json`:
```json
{
  "id": "1",
  "nombre": "Nombre del servicio",
  "descripcion": "Descripción atractiva",
  "precio": 150000,
  "duracion_min": 60,
  "buffer_min": 10,
  "imagen": "https://url-de-tu-imagen.jpg",
  "categoria": "Masaje",
  "activo": true
}
```

### 👉 Imágenes
Reemplaza las URLs de Unsplash en `data/services.json` y en las galerías de `index.html` con las imágenes reales del spa.

Puedes usar imágenes locales en `/frontend/assets/` o URLs externas.

### 👉 WhatsApp
En `frontend/js/main.js`:
```js
whatsapp: '573001234567',  // Colombia: 57 + número sin espacios
```

En los archivos HTML, busca `wa.me/573001234567` y reemplaza.

### 👉 Horario del spa
En `backend/routes/bookings.js`:
```js
const SCHEDULE = {
  1: { start: '09:00', end: '18:00' }, // Lunes
  2: { start: '09:00', end: '18:00' }, // Martes
  // ...
  6: { start: '09:00', end: '16:00' }, // Sábado
  // El domingo (0) no aparece = cerrado
}
```

### 👉 Información de contacto
En `frontend/index.html`, busca la sección `#contacto` y actualiza:
- Dirección
- Teléfono
- Horario

---

## 🚀 Deploy en Vercel

### Opción A — Vercel CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Para producción
vercel --prod
```

### Opción B — GitHub + Vercel Dashboard

1. Sube el proyecto a un repositorio de GitHub.
2. Ve a [vercel.com](https://vercel.com) → New Project → Import desde GitHub.
3. Framework Preset: **Other**.
4. Deploy automático.

El `vercel.json` incluido ya configura correctamente el frontend estático y la API serverless.

---

## 🔌 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/services` | Lista todos los servicios activos |
| `GET` | `/api/services/:id` | Obtiene un servicio por ID |
| `POST` | `/api/services` | Crea un servicio (admin) |
| `GET` | `/api/slots?servicio=id&fecha=YYYY-MM-DD` | Horarios disponibles |
| `POST` | `/api/bookings` | Crear una cita |
| `GET` | `/api/bookings/all?fecha=YYYY-MM-DD` | Ver citas (admin) |
| `PATCH` | `/api/bookings/:id/status` | Actualizar estado de cita |
| `GET` | `/api/testimonials` | Lista testimonios |
| `POST` | `/api/contact` | Enviar mensaje de contacto |
| `GET` | `/api/health` | Health check del servidor |

---

## 🔁 Integración n8n (automatizaciones)

En `backend/routes/bookings.js`, descomenta el bloque del webhook:

```js
if (process.env.N8N_WEBHOOK_URL) {
  fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cita, tipo: 'nueva_cita' }),
  })
}
```

Agrega la variable de entorno en Vercel:
```
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/nueva-cita
```

---

## 🗄️ Migración a Supabase/PostgreSQL

El proyecto está diseñado para escalar. Para migrar de JSON a Supabase:

1. Instala el cliente: `npm install @supabase/supabase-js`
2. En cada route, reemplaza `readJSON(FILE)` por queries de Supabase:
```js
// Antes (JSON):
const services = readJSON(SERVICES_FILE)

// Después (Supabase):
const { data: services } = await supabase
  .from('servicios')
  .select('*')
  .eq('activo', true)
```

---

## 📄 Licencia

MIT — Úsalo libremente para tu negocio.
