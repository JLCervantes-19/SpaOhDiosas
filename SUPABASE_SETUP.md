# 🔧 Configuración de Supabase

## 1️⃣ Configurar variables de entorno

El archivo `.env` ya está creado en la raíz del proyecto. Debes reemplazar los valores de ejemplo con tus credenciales reales de Supabase:

```env
# 👉 Copia estos valores desde Supabase → Settings → API
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ...tu-anon-key...

# WhatsApp (opcional)
WHATSAPP_NUMBER=573001234567

# n8n (opcional)
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/nueva-cita
```

### Dónde encontrar tus credenciales:
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Settings → API
3. Copia `Project URL` → pégalo en `SUPABASE_URL`
4. Copia `anon public` key → pégalo en `SUPABASE_ANON_KEY`

## 2️⃣ Instalar dependencias

```bash
npm install
```

Esto instalará:
- `@supabase/supabase-js` - Cliente de Supabase
- `dotenv` - Para cargar variables de entorno

## 3️⃣ Crear tablas en Supabase

Ve a Supabase → SQL Editor y ejecuta este script:

```sql
-- Tabla de servicios
CREATE TABLE servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC NOT NULL,
  duracion_min INTEGER NOT NULL,
  buffer_min INTEGER DEFAULT 10,
  imagen TEXT,
  categoria TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de citas
CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  servicio_id UUID REFERENCES servicios(id),
  servicio_nombre TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  origen TEXT DEFAULT 'web',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de testimonios
CREATE TABLE testimonios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  texto TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  imagen TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de contactos
CREATE TABLE contactos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  mensaje TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_citas_fecha ON citas(fecha);
CREATE INDEX idx_citas_estado ON citas(estado);
CREATE INDEX idx_servicios_activo ON servicios(activo);
```

## 4️⃣ Migrar datos existentes (opcional)

Si tienes datos en `data/services.json` y `data/testimonials.json`, puedes insertarlos manualmente en Supabase o usar el Table Editor.

## 5️⃣ Configurar en Vercel (producción)

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. Settings → Environment Variables
3. Agrega estas variables:

| Variable | Valor |
|----------|-------|
| `SUPABASE_URL` | https://xxx.supabase.co |
| `SUPABASE_ANON_KEY` | eyJ... |

## 6️⃣ Probar localmente

```bash
npm run dev
```

El servidor debería iniciar en `http://localhost:3000` y conectarse a Supabase.

## ✅ Verificación

Prueba estos endpoints:
- `GET http://localhost:3000/api/services` - Debe devolver servicios de Supabase
- `GET http://localhost:3000/api/testimonials` - Debe devolver testimonios
- `POST http://localhost:3000/api/bookings` - Debe crear una cita en Supabase

## 📍 Archivos modificados

```
spa-vanilla/
├── .env                        ← Credenciales (no se sube a Git)
├── backend/
│   ├── lib/
│   │   └── supabase.js         ← Cliente de conexión
│   ├── routes/
│   │   ├── services.js         ← Migrado a Supabase
│   │   ├── bookings.js         ← Migrado a Supabase
│   │   └── contact.js          ← Migrado a Supabase
│   └── server.js               ← Carga dotenv
└── package.json                ← Nuevas dependencias
```

## 🔒 Seguridad

- El archivo `.env` está en `.gitignore` y nunca se sube a Git
- Usa Row Level Security (RLS) en Supabase para proteger tus datos
- La `ANON_KEY` es segura para el frontend, pero configura RLS para operaciones sensibles
