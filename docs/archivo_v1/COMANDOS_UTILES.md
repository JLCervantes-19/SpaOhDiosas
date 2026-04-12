# 🛠️ Comandos Útiles - Gestión de Citas

## 🚀 Iniciar Servidor

```bash
# Modo normal
npm start

# Modo desarrollo (con auto-reload)
npm run dev

# Modo Vercel local
npm run vercel
```

---

## 🗄️ Queries SQL Útiles

### Ver Todas las Citas de un Cliente

```sql
-- Por email
SELECT 
  c.id,
  c.fecha,
  c.hora_inicio,
  c.hora_fin,
  c.estado,
  s.nombre as servicio,
  cl.nombre as cliente,
  cl.email
FROM citas c
JOIN clientes cl ON c.cliente_id = cl.id
JOIN servicios s ON c.servicio_id = s.id
WHERE cl.email = 'tu_email@example.com'
ORDER BY c.fecha DESC, c.hora_inicio DESC;
```

```sql
-- Por nombre
SELECT 
  c.id,
  c.fecha,
  c.hora_inicio,
  c.hora_fin,
  c.estado,
  s.nombre as servicio,
  cl.nombre as cliente
FROM citas c
JOIN clientes cl ON c.cliente_id = cl.id
JOIN servicios s ON c.servicio_id = s.id
WHERE cl.nombre ILIKE '%JHAN%'
ORDER BY c.fecha DESC;
```

### Ver Solo Citas Futuras

```sql
SELECT 
  c.id,
  c.fecha,
  c.hora_inicio,
  c.estado,
  s.nombre as servicio
FROM citas c
JOIN clientes cl ON c.cliente_id = cl.id
JOIN servicios s ON c.servicio_id = s.id
WHERE cl.email = 'tu_email@example.com'
  AND c.fecha >= CURRENT_DATE
ORDER BY c.fecha ASC, c.hora_inicio ASC;
```

### Ver Citas Canceladas

```sql
SELECT 
  c.id,
  c.fecha,
  c.hora_inicio,
  c.estado,
  s.nombre as servicio,
  cl.nombre as cliente
FROM citas c
JOIN clientes cl ON c.cliente_id = cl.id
JOIN servicios s ON c.servicio_id = s.id
WHERE c.estado = 'cancelada'
ORDER BY c.fecha DESC
LIMIT 20;
```

### Crear Cita de Prueba (Futuro - Con 24h)

```sql
-- Primero obtén IDs necesarios
SELECT id, nombre, email FROM clientes WHERE email = 'tu_email@example.com';
SELECT id, nombre FROM servicios WHERE activo = true LIMIT 1;

-- Crear cita 3 días en el futuro
INSERT INTO citas (
  id, 
  cliente_id, 
  servicio_id, 
  fecha, 
  hora_inicio, 
  hora_fin, 
  estado, 
  origen, 
  created_at
)
VALUES (
  gen_random_uuid(),
  '[TU_CLIENTE_ID]',
  '[UN_SERVICIO_ID]',
  CURRENT_DATE + INTERVAL '3 days',
  '14:00:00',
  '15:30:00',
  'confirmada',
  'web',
  NOW()
);
```

### Crear Cita de Prueba (< 24h para Probar Validación)

```sql
-- Crear cita 12 horas en el futuro
INSERT INTO citas (
  id, 
  cliente_id, 
  servicio_id, 
  fecha, 
  hora_inicio, 
  hora_fin, 
  estado, 
  origen, 
  created_at
)
VALUES (
  gen_random_uuid(),
  '[TU_CLIENTE_ID]',
  '[UN_SERVICIO_ID]',
  CURRENT_DATE,
  (CURRENT_TIME + INTERVAL '12 hours')::time,
  (CURRENT_TIME + INTERVAL '13.5 hours')::time,
  'confirmada',
  'web',
  NOW()
);
```

### Restaurar Cita Cancelada (Para Re-probar)

```sql
UPDATE citas
SET estado = 'confirmada'
WHERE id = '[ID_DE_LA_CITA]';
```

### Ver Sesiones de Chat Recientes

```sql
SELECT 
  session_id,
  user_name,
  started_at,
  last_activity,
  metadata
FROM chat_sessions
ORDER BY started_at DESC
LIMIT 10;
```

### Ver Mensajes de una Sesión

```sql
SELECT 
  sender,
  content,
  message_type,
  created_at
FROM chat_messages
WHERE session_id = '[TU_SESSION_ID]'
ORDER BY created_at ASC;
```

### Limpiar Sesiones Antiguas (Opcional)

```sql
-- Ver cuántas sesiones hay
SELECT COUNT(*) FROM chat_sessions;

-- Eliminar sesiones de más de 7 días
DELETE FROM chat_sessions
WHERE started_at < NOW() - INTERVAL '7 days';

-- Los mensajes se eliminan automáticamente por CASCADE
```

### Ver Clientes con Emails en Mayúsculas (Para Verificar)

```sql
SELECT id, nombre, email
FROM clientes
WHERE email != LOWER(email);
```

### Convertir Emails Existentes a Minúsculas

```sql
UPDATE clientes
SET email = LOWER(email)
WHERE email != LOWER(email);
```

---

## 🧪 Comandos de Testing

### Verificar Conexión a Supabase

```bash
# Crear archivo test_connection.js
node database/migrations/test_connection.js
```

### Verificar Tablas de Chat

```bash
node database/migrations/verify_chat_tables.js
```

### Verificar Campo Documento

```bash
node database/migrations/verify_documento_migration.js
```

---

## 🌐 Comandos de Deploy

### Deploy a Vercel

```bash
# Deploy a producción
vercel --prod

# Deploy a preview
vercel

# Ver logs de producción
vercel logs

# Ver variables de entorno
vercel env ls
```

### Configurar Variables en Vercel

```bash
# Agregar variable
vercel env add SUPABASE_URL

# Agregar variable desde archivo
vercel env add SUPABASE_ANON_KEY < .env
```

---

## 🔍 Debugging

### Ver Logs del Servidor en Tiempo Real

```bash
# Si usas npm start
# Los logs aparecen automáticamente en la terminal

# Si está en Vercel
vercel logs --follow
```

### Limpiar localStorage del Navegador

```javascript
// En consola del navegador (F12)
localStorage.clear();
location.reload();
```

### Ver Variables de Sesión en Frontend

```javascript
// En consola del navegador (F12)
console.log('Session ID:', localStorage.getItem('chat_session_id'));
console.log('User Name:', localStorage.getItem('chat_user_name'));
console.log('Current Step:', currentStep);
console.log('Current Citas:', currentCitas);
```

### Forzar Estado del Chat

```javascript
// En consola del navegador (F12)
currentStep = 'managing_appointments';
console.log('Estado cambiado a:', currentStep);
```

---

## 📊 Análisis de Datos

### Estadísticas de Citas

```sql
-- Citas por estado
SELECT estado, COUNT(*) as total
FROM citas
GROUP BY estado
ORDER BY total DESC;

-- Citas por mes
SELECT 
  DATE_TRUNC('month', fecha) as mes,
  COUNT(*) as total_citas
FROM citas
GROUP BY mes
ORDER BY mes DESC;

-- Servicios más populares
SELECT 
  s.nombre,
  COUNT(c.id) as total_citas
FROM servicios s
LEFT JOIN citas c ON s.id = c.servicio_id
GROUP BY s.nombre
ORDER BY total_citas DESC;
```

### Estadísticas de Chat

```sql
-- Sesiones por día
SELECT 
  DATE(started_at) as dia,
  COUNT(*) as total_sesiones
FROM chat_sessions
GROUP BY dia
ORDER BY dia DESC
LIMIT 30;

-- Mensajes por sesión (promedio)
SELECT 
  AVG(mensaje_count) as promedio_mensajes
FROM (
  SELECT 
    session_id,
    COUNT(*) as mensaje_count
  FROM chat_messages
  GROUP BY session_id
) as subquery;
```

---

## 🔧 Mantenimiento

### Backup de Base de Datos

```bash
# Desde Supabase Dashboard
# Settings → Database → Backups
# O usar pg_dump si tienes acceso directo
```

### Limpiar Datos de Prueba

```sql
-- Eliminar citas de prueba
DELETE FROM citas
WHERE origen = 'test' OR notas LIKE '%prueba%';

-- Eliminar sesiones de chat antiguas
DELETE FROM chat_sessions
WHERE started_at < NOW() - INTERVAL '30 days';
```

### Verificar Integridad de Datos

```sql
-- Citas sin cliente (no debería haber)
SELECT * FROM citas WHERE cliente_id IS NULL;

-- Citas sin servicio (no debería haber)
SELECT * FROM citas WHERE servicio_id IS NULL;

-- Clientes sin email (no debería haber)
SELECT * FROM clientes WHERE email IS NULL OR email = '';
```

---

## 🎯 Comandos Rápidos para Pruebas

### Setup Completo de Prueba

```bash
# 1. Iniciar servidor
npm start

# 2. En otra terminal, abrir navegador
open http://localhost:3000/frontend/chat.html

# 3. Ver logs en tiempo real
tail -f logs/server.log  # Si tienes logging configurado
```

### Reset Completo para Nueva Prueba

```sql
-- En Supabase
-- 1. Restaurar citas canceladas
UPDATE citas SET estado = 'confirmada' WHERE estado = 'cancelada';

-- 2. Limpiar sesiones de chat
DELETE FROM chat_sessions WHERE started_at > NOW() - INTERVAL '1 hour';
```

```javascript
// En navegador
localStorage.clear();
location.reload();
```

---

## 📝 Notas Importantes

### Zona Horaria
- Las fechas en BD están en UTC
- El frontend muestra en hora local del navegador
- La validación de 24h usa hora del servidor

### Formato de Fechas
- BD: `YYYY-MM-DD` (ej: 2024-03-15)
- Frontend: Formato español (ej: "viernes, 15 de marzo de 2024")

### Estados de Citas
- `confirmada` - Cita activa
- `cancelada` - Cita cancelada por usuario
- `pendiente` - Cita pendiente de confirmación
- `completada` - Cita ya realizada

---

## 🆘 Comandos de Emergencia

### Si el Servidor No Inicia

```bash
# Verificar puerto en uso
lsof -i :3000

# Matar proceso en puerto 3000
kill -9 $(lsof -t -i:3000)

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Si Supabase No Conecta

```bash
# Verificar variables de entorno
cat .env | grep SUPABASE

# Test de conexión
node -e "require('dotenv').config(); console.log(process.env.SUPABASE_URL);"
```

### Si el Chat No Responde

```javascript
// En consola del navegador
// Ver estado actual
console.log({
  sessionId,
  userName,
  currentStep,
  currentCitas
});

// Reset manual
sessionId = null;
userName = null;
currentStep = 'initial';
localStorage.clear();
location.reload();
```

---

**Tip**: Guarda este archivo como referencia rápida durante el desarrollo y testing.
