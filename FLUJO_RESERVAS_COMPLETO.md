# 🔥 FLUJO COMPLETO DE RESERVAS - Sistema de Citas

## 📊 Tabla Principal: `citas`

Esta es la tabla MÁS IMPORTANTE del sistema. Todo gira alrededor de ella:
- Automatización con n8n
- Métricas e informes
- Cálculo de ingresos
- Gestión de clientes

---

## 🎯 Estados de las Citas

Las citas pueden tener 4 estados:

| Estado | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| `confirmada` | Cita confirmada y activa | Cuando el cliente hace la reserva (estado inicial) |
| `cancelada` | Cita cancelada | Cuando el cliente o el spa cancela |
| `asistio` | Cliente asistió a la cita | Después de que el cliente recibe el servicio |
| `no_asistio` | Cliente no asistió | Cuando el cliente no se presenta |

---

## 🔄 Flujo Completo del Sistema

### 1️⃣ Usuario Entra a la Web
```
Usuario → http://tudominio.com
```

### 2️⃣ Selecciona Servicio
```
Frontend → GET /api/services
Backend → Supabase (tabla: servicios)
Frontend ← Lista de servicios activos
```

### 3️⃣ Escoge Fecha y Hora
```
Frontend → GET /api/bookings?servicio={id}&fecha={YYYY-MM-DD}
Backend → Consulta citas del día en Supabase
Backend → Calcula slots disponibles
Frontend ← Lista de horarios disponibles
```

### 4️⃣ Llena Formulario y Confirma
```
Frontend → POST /api/bookings
{
  nombre, telefono, email,
  servicio_id, fecha, hora_inicio, notas
}
```

### 5️⃣ Backend Procesa la Reserva
```
1. Busca/crea cliente en tabla 'clientes'
2. Valida servicio en tabla 'servicios'
3. Verifica disponibilidad
4. Crea registro en tabla 'citas' con estado: 'confirmada'
5. Envía webhook a n8n (si está configurado)
```

### 6️⃣ n8n Envía Confirmación por WhatsApp
```
n8n recibe webhook →
n8n envía mensaje WhatsApp al cliente →
"¡Hola {nombre}! Tu cita para {servicio} 
el {fecha} a las {hora} está confirmada ✓"
```

### 7️⃣ Gestión de la Cita

**Opción A: Cliente Cancela**
```
PATCH /api/bookings/{id}/status
{ estado: 'cancelada' }
→ n8n envía mensaje de cancelación
```

**Opción B: Cliente Asiste**
```
PATCH /api/bookings/{id}/status
{ estado: 'asistio' }
→ Se registra en métricas
→ Se cuenta en ingresos
```

**Opción C: Cliente No Asiste**
```
PATCH /api/bookings/{id}/status
{ estado: 'no_asistio' }
→ Se registra para seguimiento
```

---

## 🔧 Configuración del Constraint

Ejecuta este SQL en Supabase para configurar los estados correctos:

```sql
-- Eliminar constraint antiguo
ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_estado_check;
ALTER TABLE citas DROP CONSTRAINT IF EXISTS estado_check;

-- Crear constraint con estados correctos
ALTER TABLE citas 
ADD CONSTRAINT estado_check 
CHECK (estado IN ('confirmada', 'cancelada', 'asistio', 'no_asistio'));
```

---

## 📡 Configuración de n8n Webhook

### 1. En n8n, crea un workflow con:
- Trigger: Webhook
- URL: `https://tu-n8n.com/webhook/nueva-cita`

### 2. En tu `.env` agrega:
```env
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/nueva-cita
```

### 3. En `backend/routes/bookings.js` descomenta:
```javascript
if (process.env.N8N_WEBHOOK_URL) {
  fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      cita, 
      cliente: { nombre, telefono, email }, 
      servicio: svc.nombre, 
      tipo: 'nueva_cita' 
    }),
  }).catch(() => {})
}
```

### 4. n8n recibe este JSON:
```json
{
  "cita": {
    "id": "uuid",
    "fecha": "2026-04-10",
    "hora_inicio": "10:00",
    "hora_fin": "11:00",
    "estado": "confirmada"
  },
  "cliente": {
    "nombre": "María González",
    "telefono": "3001234567",
    "email": "maria@email.com"
  },
  "servicio": "Masaje Relajante",
  "tipo": "nueva_cita"
}
```

### 5. n8n envía WhatsApp:
```
Nodo WhatsApp:
- Número: {{$json.cliente.telefono}}
- Mensaje: 
  ¡Hola {{$json.cliente.nombre}}! 
  
  Tu cita está confirmada ✓
  
  📅 Fecha: {{$json.cita.fecha}}
  🕐 Hora: {{$json.cita.hora_inicio}}
  💆 Servicio: {{$json.servicio}}
  
  Te esperamos en Serenità Spa 🌿
```

---

## 📊 Endpoints de la API

### Crear Reserva
```http
POST /api/bookings
Content-Type: application/json

{
  "nombre": "María González",
  "telefono": "3001234567",
  "email": "maria@email.com",
  "servicio_id": "uuid-del-servicio",
  "fecha": "2026-04-10",
  "hora_inicio": "10:00",
  "notas": "Primera vez",
  "origen": "web"
}

Response 201:
{
  "id": "uuid-de-la-cita",
  "estado": "confirmada",
  "message": "Reserva creada exitosamente"
}
```

### Actualizar Estado
```http
PATCH /api/bookings/{id}/status
Content-Type: application/json

{
  "estado": "asistio"
}

Response 200:
{
  "id": "uuid",
  "estado": "asistio",
  ...
}
```

### Ver Citas (Admin)
```http
GET /api/bookings/all
GET /api/bookings/all?fecha=2026-04-10

Response 200:
[
  {
    "id": "uuid",
    "fecha": "2026-04-10",
    "hora_inicio": "10:00",
    "estado": "confirmada",
    "clientes": {
      "nombre": "María González",
      "telefono": "3001234567"
    },
    "servicios": {
      "nombre": "Masaje Relajante",
      "precio": 150000
    }
  }
]
```

---

## 📈 Queries Útiles

### Ver citas de hoy
```sql
SELECT 
  citas.*,
  clientes.nombre,
  clientes.telefono,
  servicios.nombre as servicio
FROM citas
JOIN clientes ON citas.cliente_id = clientes.id
JOIN servicios ON citas.servicio_id = servicios.id
WHERE fecha = CURRENT_DATE
ORDER BY hora_inicio;
```

### Ingresos del mes (solo asistencias)
```sql
SELECT 
  SUM(servicios.precio) as ingresos_totales,
  COUNT(*) as total_citas
FROM citas
JOIN servicios ON citas.servicio_id = servicios.id
WHERE fecha >= DATE_TRUNC('month', CURRENT_DATE)
  AND estado = 'asistio';
```

### Tasa de asistencia
```sql
SELECT 
  COUNT(CASE WHEN estado = 'asistio' THEN 1 END) as asistieron,
  COUNT(CASE WHEN estado = 'no_asistio' THEN 1 END) as no_asistieron,
  COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as canceladas,
  ROUND(
    COUNT(CASE WHEN estado = 'asistio' THEN 1 END) * 100.0 / 
    NULLIF(COUNT(*), 0), 
    2
  ) as tasa_asistencia
FROM citas
WHERE fecha >= CURRENT_DATE - INTERVAL '30 days';
```

### Clientes que no asistieron (para seguimiento)
```sql
SELECT 
  clientes.nombre,
  clientes.telefono,
  citas.fecha,
  servicios.nombre as servicio
FROM citas
JOIN clientes ON citas.cliente_id = clientes.id
JOIN servicios ON citas.servicio_id = servicios.id
WHERE estado = 'no_asistio'
  AND fecha >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY fecha DESC;
```

---

## 🎯 Checklist de Configuración

- [ ] Ejecutar `fix_estados_citas.sql` en Supabase
- [ ] Verificar que el constraint permite: confirmada, cancelada, asistio, no_asistio
- [ ] Configurar N8N_WEBHOOK_URL en `.env` (opcional)
- [ ] Descomentar código de webhook en `bookings.js` (opcional)
- [ ] Crear workflow en n8n para WhatsApp (opcional)
- [ ] Probar crear una reserva desde la web
- [ ] Verificar que la cita se crea con estado 'confirmada'
- [ ] Probar actualizar estado a 'asistio'

---

## 🚀 Próximos Pasos

1. **Ejecuta el script SQL** `fix_estados_citas.sql` en Supabase
2. **Reinicia el servidor** para que tome los cambios
3. **Prueba hacer una reserva** desde la web
4. **Verifica en Supabase** que la cita se creó con estado 'confirmada'

¡Listo! Tu sistema de reservas está completamente configurado 🌿✨
