# Spa Oh Diosas — Sitio Web Principal

Sitio web de cara al cliente para el spa Oh Diosas by Tatiana Zuleta. Incluye landing page, catálogo de servicios, sistema de reservas online y chatbot con IA conectado a N8N + Supabase.

**Stack:** Node.js 24 · Express 4 · Supabase · Vanilla JS ES Modules · Vercel Serverless

---

## Multi-tenant — resumen para el desarrollador

Este sistema sirve a **varias empresas** desde una única base de datos Supabase compartida (proyecto `whouejjrpjcvoueyajbu`), aisladas por Row Level Security. Antes de tocar cualquiera de las 3 apps, entender esto:

- **Aislamiento:** las 16 tablas de negocio (`clientes`, `citas`, `servicios`, `empleados`, etc.) tienen una columna `empresa_id`. Las políticas RLS filtran automáticamente por la empresa del usuario autenticado (`current_empresa_id()`) — como desarrollador casi nunca hace falta agregar `.eq('empresa_id', ...)` a mano en admin-dashboard/staff-app, RLS ya lo hace. La única excepción es al **crear** filas nuevas: todo `INSERT` debe incluir `empresa_id` explícitamente, si no la base lo rechaza.
- **Quién es "yo" en cada app:**
  - **SpaOhDiosas (esta app, la landing):** no tiene login. Su empresa la define la variable de entorno `EMPRESA_ID` del despliegue — **un despliegue de Vercel = una empresa**. Todas las consultas del backend (`routes/*.js`) filtran por esa variable.
  - **admin-dashboard y staff-app:** **un solo despliegue sirve a todas las empresas.** No se redespliegan por cada empresa nueva — cada admin/empleada inicia sesión y su propia fila en `admin_users`/`empleados` determina su empresa; RLS hace el resto.
- **`Empresa 0`** (`id = 00000000-0000-0000-0000-000000000000`) son los datos históricos de Oh Diosas, tratados como la primera empresa del sistema.
- Diseño completo (RLS, decisiones, qué falta) en `docs/superpowers/specs/2026-08-11-multitenant-design.md` en la raíz del disco del proyecto (no versionado en este repo).

### Cómo desplegar una empresa nueva (paso a paso)

Solo **esta app (la landing)** necesita un despliegue nuevo por empresa. admin-dashboard y staff-app **no se tocan** — la empresa nueva ya funciona ahí apenas se cree su primer admin.

1. **Crear la empresa en la base de datos** (Supabase → SQL Editor, o vía MCP):
   ```sql
   insert into empresas (nombre, slug) values ('Nombre de la Empresa', 'slug-unico')
   returning id;
   ```
   Guarda el `id` que devuelve — es el `EMPRESA_ID` del paso 3.

2. **Cargar sus datos iniciales** (todavía vacíos para la empresa nueva): al menos una fila en `configuracion` (horario semanal) y sus `servicios`, con el `empresa_id` recién creado. Se puede hacer por SQL directo o, más simple, dándole acceso al admin de esa empresa para que los cargue desde el panel una vez creado (paso 5).

3. **Nuevo proyecto de Vercel, mismo repositorio:**
   - Vercel → **Add New Project** → seleccionar `JLCervantes-19/SpaOhDiosas` (el mismo repo, otro proyecto)
   - Nombre del proyecto: el que corresponda a la empresa (ej. `spa-empresa-b`)
   - Configurar las variables de entorno igual que en el Paso 3 de la sección de despliegue de abajo, **más**:

     | Variable | Valor |
     |----------|-------|
     | `EMPRESA_ID` | el `id` devuelto en el paso 1 |

   - Deploy.

4. **Conectar su dominio propio** en el nuevo proyecto de Vercel (Settings → Domains).

5. **Crear su primer admin** en `admin_users`, con el `empresa_id` de esta empresa — mismo procedimiento que ya usa Oh Diosas (ver `admin-dashboard/INSTRUCCIONES-AGREGAR-ADMIN.md`). Desde ahí, ese admin entra al **mismo** admin-dashboard compartido, ve solo los datos de su empresa, y puede cargar servicios/horario/empleadas por su cuenta.

6. **n8n (el chatbot):** si esta empresa también quiere chatbot, hay que revisar `services/n8n.js` — hoy manda `empresaId` en cada mensaje, así que el workflow de n8n ya sabe filtrar por empresa. No hace falta un workflow nuevo por empresa, es el mismo bot para todas.

Con esto la empresa nueva queda funcionando de punta a punta sin tocar código.

---

## Estructura del proyecto

```
SpaOhDiosas/
├── api/
│   └── index.js              # Punto de entrada serverless (Vercel)
├── config/
│   └── supabase.js           # Cliente Supabase singleton (server-side)
├── routes/
│   ├── bookings.js           # GET /api/slots, POST /api/bookings
│   ├── chat.js               # POST /api/chat/session, /message, /appointments
│   ├── services.js           # GET /api/services
│   └── contact.js            # POST /api/contact
├── services/
│   └── n8n.js                # Integración con N8N webhook
├── frontend/
│   ├── index.html            # Landing page
│   ├── reservas.html         # Reservas online
│   ├── servicios.html        # Catálogo de servicios
│   ├── chat.html             # Página del chatbot
│   ├── css/                  # Estilos
│   ├── js/                   # JavaScript cliente (main, bookings, chat)
│   ├── icons/                # Iconos PWA
│   └── manifest.json         # Config PWA
├── database/
│   ├── schema.sql            # Schema completo de la BD
│   └── migration_asignacion.sql
├── server.js                 # Express app (dev local + Vercel)
├── vercel.json               # Routing y headers de seguridad
└── package.json              # Node 24, "type": "module"
```

---

## Despliegue manual en Vercel

### Paso 1 — Tener listo el repositorio en GitHub

El repositorio ya existe: `JLCervantes-19/SpaOhDiosas`

Si necesitas hacer push de cambios:

```bash
cd "/ruta/a/SpaOhDiosas"
git add .
git commit -m "deploy: descripcion del cambio"
git push origin main
```

---

### Paso 2 — Importar el proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta `jhan-cervantes-projects`
2. Clic en **Add New Project**
3. Busca y selecciona el repositorio `JLCervantes-19/SpaOhDiosas`
4. Configura los ajustes de construcción:

| Ajuste | Valor |
|--------|-------|
| **Framework Preset** | `Other` |
| **Root Directory** | `./` (dejar como está) |
| **Build Command** | `npm install` |
| **Output Directory** | *(dejar vacío)* |
| **Install Command** | `npm install` |
| **Node.js Version** | `24.x` |

> Vercel detecta automáticamente `api/index.js` como función serverless. El `vercel.json` ya tiene configurado el routing completo.

---

### Paso 3 — Configurar las variables de entorno

En la sección **Environment Variables** del formulario de importación (o en Settings → Environment Variables del proyecto), agrega todas las siguientes variables. Selecciona los entornos **Production**, **Preview** y **Development** para cada una.

#### Variables obligatorias

| Variable | Descripcion | Valor |
|----------|-------------|-------|
| `SUPABASE_URL` | URL del proyecto Supabase | `https://whouejjrpjcvoueyajbu.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Clave de servicio (solo backend, nunca expuesta al cliente) | Ver abajo |
| `N8N_CHAT_WEBHOOK` | Webhook del chatbot N8N | `https://n8n-spa-6y2d.onrender.com/webhook/chatweb` |
| `ADMIN_TOKEN` | Token secreto para endpoints de administracion | Cualquier cadena segura (ej: genera con `openssl rand -hex 32`) |
| `EMPRESA_ID` | Multi-tenant: qué empresa es este despliegue (ver sección "Multi-tenant" arriba) | `id` de la fila en `empresas`. Si se omite, cae en Empresa 0 |

#### Donde encontrar `SUPABASE_SERVICE_KEY`

1. Ve a [supabase.com](https://supabase.com) → tu proyecto `BD_Spa's_Startup`
2. Settings → API
3. Copia el valor de **service_role** (en la seccion "Project API keys")
4. **IMPORTANTE:** Esta clave tiene acceso total a la BD. Nunca va en el frontend ni en el repositorio.

#### Variables opcionales

| Variable | Descripcion | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto local (solo dev) | `3000` |

---

### Paso 4 — Hacer deploy

1. Clic en **Deploy**
2. Vercel instala dependencias y despliega la funcion serverless
3. Al terminar, obtienes una URL como `https://spa-oh-diosas-xxxx.vercel.app`

**Para promover a produccion** (si usas un dominio personalizado), ve a Deployments → el deployment mas reciente → **Promote to Production**.

---

### Paso 5 — Verificar que funciona

Abre la URL desplegada y prueba estos endpoints:

```
GET  /api/health             → {"status":"ok","app":"SpaOhDiosas"}
GET  /api/services           → lista de servicios desde Supabase
GET  /api/slots?servicioId=1&fecha=2026-06-01  → horarios disponibles
```

Si el health check responde pero `/api/services` falla, revisa que `SUPABASE_URL` y `SUPABASE_SERVICE_KEY` esten correctos en las variables de entorno.

---

### Paso 6 — Actualizar variables de entorno (si ya existe el proyecto)

Si el proyecto ya existe en Vercel y solo quieres actualizar variables:

1. Ve a [vercel.com](https://vercel.com) → tu proyecto `spa-oh-diosas`
2. Settings → Environment Variables
3. Edita o agrega la variable
4. Ve a Deployments → **Redeploy** el ultimo deployment para que tome efecto

---

## Deploy via CLI (alternativa)

```bash
# Instalar CLI si no lo tienes
npm install -g vercel

# Desde la carpeta del proyecto
cd "/ruta/a/SpaOhDiosas"

# Vincular al proyecto existente
vercel link --scope jhan-cervantes-projects --project spa-oh-diosas

# Agregar variables de entorno (una por una)
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_KEY production
vercel env add N8N_CHAT_WEBHOOK production
vercel env add ADMIN_TOKEN production

# Deploy a produccion
vercel --prod
```

---

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Crear archivo .env (nunca lo subas a GitHub)
cp .env.example .env
# Editar .env con tus valores reales

# Iniciar servidor
npm start
# → http://localhost:3000
```

Contenido del `.env` para desarrollo:

```env
SUPABASE_URL=https://whouejjrpjcvoueyajbu.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key_aqui
N8N_CHAT_WEBHOOK=https://n8n-spa-6y2d.onrender.com/webhook/chatweb
ADMIN_TOKEN=cualquier-token-secreto-local
EMPRESA_ID=00000000-0000-0000-0000-000000000000
PORT=3000
```

---

## Variables de entorno — resumen rapido

| Variable | Obligatoria | Expuesta al cliente | Donde va |
|----------|-------------|---------------------|----------|
| `SUPABASE_URL` | Si | No | Solo servidor |
| `SUPABASE_SERVICE_KEY` | Si | **NUNCA** | Solo servidor |
| `N8N_CHAT_WEBHOOK` | Si | No | Solo servidor |
| `ADMIN_TOKEN` | Si | No | Solo servidor |
| `EMPRESA_ID` | No (cae en Empresa 0) | No | Solo servidor |

---

## Endpoints de la API

| Metodo | Ruta | Descripcion | Autenticacion |
|--------|------|-------------|---------------|
| GET | `/api/health` | Estado del servidor | Publica |
| GET | `/api/services` | Lista de servicios | Publica |
| GET | `/api/testimonials` | Testimonios aprobados | Publica |
| GET | `/api/config` | Config publica del negocio | Publica |
| GET | `/api/slots` | Horarios disponibles | Publica |
| POST | `/api/bookings` | Crear reserva | Publica |
| GET | `/api/bookings/all` | Todas las citas | `x-admin-token` |
| PATCH | `/api/bookings/:id/status` | Cambiar estado de cita | `x-admin-token` |
| POST | `/api/chat/session` | Iniciar sesion de chat | Publica |
| POST | `/api/chat/message` | Enviar mensaje al chatbot | Publica |
| GET | `/api/chat/services` | Servicios para el chat | Publica |
| POST | `/api/chat/appointments` | Citas via chat | Publica |
| POST | `/api/contact` | Formulario de contacto | Publica |

---

## Reglas de negocio

- Horarios: Lun-Vie 9:00-18:00, Sab 9:00-16:00, Dom CERRADO
- Slots: intervalos de 30 minutos, buffer de 10 min entre citas
- Asignacion automatica de empleada (menor carga del dia)
- Validacion de disponibilidad en tiempo real antes de confirmar reserva
- Rate limiting: 100 req/15min general, 20/1h chat, 10/15min reservas

---

## Seguridad

- `SUPABASE_SERVICE_KEY` solo en servidor, nunca en frontend
- Headers en `vercel.json`: CSP, X-Frame-Options, X-XSS-Protection, Referrer-Policy
- Rate limiting por IP en todos los endpoints
- Endpoint admin protegido por `x-admin-token` header
