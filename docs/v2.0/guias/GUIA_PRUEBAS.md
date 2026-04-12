# 🧪 Guía de Pruebas - Versión 2.0

## 📋 Checklist de Pruebas

### ✅ Pruebas Funcionales

- [ ] Consultar citas funciona correctamente
- [ ] Cambiar fecha funciona correctamente
- [ ] Cancelar cita funciona correctamente
- [ ] Domingos no aparecen en opciones
- [ ] Horarios de tarde aparecen
- [ ] Fechas se guardan correctamente
- [ ] Buffer se calcula correctamente

---

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Configura las variables:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
PORT=3000
```

### 3. Iniciar Servidor

```bash
npm start
```

El servidor estará en `http://localhost:3000`

---

## 🧪 Pruebas Manuales

### Prueba 1: Consultar Citas

**Objetivo**: Verificar que el botón "Consultar mis citas" funciona correctamente.

**Pasos**:
1. Abre el chat
2. Clic en "Consultar mis citas"
3. Ingresa nombre: `jhan`
4. Ingresa email: `jhanleiderc@gmail.com`

**Resultado Esperado**:
- ✅ Bot pide nombre y email (NO redirige a reservas)
- ✅ Bot muestra las citas del cliente
- ✅ Opciones: "Cancelar cita", "Cambiar fecha", "Todo está bien"

**Resultado Incorrecto**:
- ❌ Redirige a página de reservas
- ❌ No encuentra las citas
- ❌ Error en la consulta

---

### Prueba 2: Cambiar Fecha - Flujo Completo

**Objetivo**: Verificar que el cambio de fecha funciona de principio a fin.

**Pasos**:
1. Consulta tus citas (ver Prueba 1)
2. Clic en "Cambiar fecha"
3. Escribe `1` (número de cita)
4. Clic en "Esta semana"
5. Selecciona un día (ej: "jue., 16 abr.")
6. Selecciona una hora (ej: "14:00")

**Resultado Esperado**:
- ✅ Bot muestra períodos disponibles
- ✅ Bot muestra días disponibles (sin domingos)
- ✅ Bot muestra horarios disponibles (mañana Y tarde)
- ✅ Bot confirma el cambio
- ✅ Fecha guardada en BD coincide con selección

**Verificar en BD**:
```sql
SELECT fecha, hora_inicio, hora_fin, duracion_total
FROM citas
WHERE id = 'id-de-la-cita';
```

**Resultado Incorrecto**:
- ❌ No muestra días disponibles
- ❌ Aparecen domingos
- ❌ Solo aparecen horarios de mañana
- ❌ Fecha guardada no coincide con selección

---

### Prueba 3: Domingos Excluidos

**Objetivo**: Verificar que los domingos NO aparecen en las opciones.

**Pasos**:
1. Inicia flujo de cambio de fecha
2. Selecciona "Esta semana"
3. Observa los días disponibles

**Resultado Esperado**:
- ✅ Aparecen: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado
- ✅ NO aparece: Domingo

**Verificar**:
```
Días disponibles esta semana:
[lun., 13 abr.] [mar., 14 abr.] [mié., 15 abr.] 
[jue., 16 abr.] [vie., 17 abr.] [sáb., 18 abr.]
```

**Resultado Incorrecto**:
- ❌ Aparece domingo en las opciones

---

### Prueba 4: Horarios de Tarde

**Objetivo**: Verificar que aparecen horarios de mañana Y tarde.

**Pasos**:
1. Inicia flujo de cambio de fecha
2. Selecciona un día (ej: viernes 17 de abril)
3. Observa los horarios disponibles

**Resultado Esperado**:
- ✅ Horarios de mañana: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30
- ✅ Horarios de tarde: 12:00, 12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30

**Nota**: Si hay una cita al mediodía, algunos horarios estarán ocupados pero los de tarde deben aparecer.

**Resultado Incorrecto**:
- ❌ Solo aparecen horarios hasta 12:30
- ❌ No aparecen horarios de tarde

---

### Prueba 5: Zona Horaria Correcta

**Objetivo**: Verificar que las fechas se guardan con el día correcto.

**Pasos**:
1. Cambia una cita a **jueves 16 de abril**
2. Confirma el cambio
3. Verifica en BD

**Verificar en BD**:
```sql
SELECT 
  fecha,
  EXTRACT(DOW FROM fecha) as dia_semana,
  hora_inicio
FROM citas
WHERE id = 'id-de-la-cita';
```

**Resultado Esperado**:
- ✅ `fecha` = `2026-04-16`
- ✅ `dia_semana` = `4` (jueves)

**Resultado Incorrecto**:
- ❌ `fecha` = `2026-04-17` (viernes)
- ❌ `dia_semana` = `5` (viernes)

---

### Prueba 6: Buffer Calculado

**Objetivo**: Verificar que el buffer se calcula correctamente.

**Pasos**:
1. Cambia una cita de Aromaterapia (60 min) a las 14:00
2. Verifica en BD

**Verificar en BD**:
```sql
SELECT 
  hora_inicio,
  hora_fin,
  duracion_total,
  servicios.duracion_min,
  servicios.buffer_min
FROM citas
JOIN servicios ON citas.servicio_id = servicios.id
WHERE id = 'id-de-la-cita';
```

**Resultado Esperado**:
- ✅ `hora_inicio` = `14:00:00`
- ✅ `hora_fin` = `15:10:00`
- ✅ `duracion_total` = `70` (60 + 10)

**Cálculo**:
```
duracion_total = duracion_min + buffer_min
70 = 60 + 10 ✅
```

**Resultado Incorrecto**:
- ❌ `hora_fin` = `15:00:00` (sin buffer)
- ❌ `duracion_total` = `60` (sin buffer)

---

### Prueba 7: Horarios de Sábado

**Objetivo**: Verificar que el sábado tiene horarios hasta las 16:00.

**Pasos**:
1. Inicia flujo de cambio de fecha
2. Selecciona sábado 18 de abril
3. Observa los horarios disponibles

**Resultado Esperado**:
- ✅ Último horario: 15:30 o antes (dependiendo de duración + buffer)
- ✅ NO aparecen horarios después de 16:00

**Ejemplo**:
```
Horarios disponibles:
09:00, 09:30, 10:00, 10:30, 11:00, 11:30,
12:00, 12:30, 13:00, 13:30, 14:00, 14:30,
15:00, 15:30
```

**Resultado Incorrecto**:
- ❌ Aparecen horarios después de 16:00 (16:30, 17:00, 17:30)

---

### Prueba 8: Validación de 24 Horas

**Objetivo**: Verificar que no se pueden hacer cambios con menos de 24 horas.

**Pasos**:
1. Crea una cita para mañana a las 10:00
2. Intenta cambiar la fecha hoy

**Resultado Esperado**:
- ✅ Bot muestra: "⚠️ Los cambios de fecha deben hacerse con al menos 24 horas de anticipación"
- ✅ Bot sugiere contactar directamente: "📞 +57 300 123 4567"

**Resultado Incorrecto**:
- ❌ Permite cambiar la fecha
- ❌ No valida las 24 horas

---

### Prueba 9: Cancelar Cita

**Objetivo**: Verificar que la cancelación funciona correctamente.

**Pasos**:
1. Consulta tus citas
2. Clic en "Cancelar cita"
3. Escribe `1` (número de cita)

**Resultado Esperado**:
- ✅ Bot confirma: "✅ Tu cita ha sido cancelada exitosamente"
- ✅ Estado en BD cambia a `cancelada`

**Verificar en BD**:
```sql
SELECT estado FROM citas WHERE id = 'id-de-la-cita';
```

**Resultado Esperado**: `estado` = `cancelada`

**Resultado Incorrecto**:
- ❌ Estado no cambia
- ❌ Error al cancelar

---

## 🔍 Pruebas de Integración

### Prueba 10: Disponibilidad en Tiempo Real

**Objetivo**: Verificar que los horarios ocupados no aparecen.

**Pasos**:
1. Crea una cita para viernes 17 de abril a las 12:00 (Aromaterapia 60 min + 10 min buffer)
2. Intenta cambiar otra cita al mismo día
3. Observa los horarios disponibles

**Resultado Esperado**:
- ✅ NO aparecen: 11:00, 11:30, 12:00, 12:30, 13:00 (ocupados por la cita)
- ✅ SÍ aparecen: 09:00, 09:30, 10:00, 10:30 (antes de la cita)
- ✅ SÍ aparecen: 13:30, 14:00, 14:30... (después de la cita)

**Lógica**:
```
Cita: 12:00 - 13:10 (70 min)

Slots que se cruzan:
- 11:00 - 12:10 ❌ (se cruza)
- 11:30 - 12:40 ❌ (se cruza)
- 12:00 - 13:10 ❌ (se cruza)
- 12:30 - 13:40 ❌ (se cruza)
- 13:00 - 14:10 ❌ (se cruza)

Slots disponibles:
- 10:30 - 11:40 ✅ (no se cruza)
- 13:30 - 14:40 ✅ (no se cruza)
```

**Resultado Incorrecto**:
- ❌ Aparecen horarios ocupados
- ❌ No se verifica disponibilidad

---

## 📊 Queries Útiles para Pruebas

### Ver Todas las Citas

```sql
SELECT 
  c.id,
  c.fecha,
  c.hora_inicio,
  c.hora_fin,
  c.duracion_total,
  c.estado,
  cl.nombre as cliente,
  s.nombre as servicio,
  s.duracion_min,
  s.buffer_min
FROM citas c
JOIN clientes cl ON c.cliente_id = cl.id
JOIN servicios s ON c.servicio_id = s.id
WHERE c.fecha >= CURRENT_DATE
ORDER BY c.fecha, c.hora_inicio;
```

### Ver Citas de un Cliente

```sql
SELECT 
  fecha,
  hora_inicio,
  hora_fin,
  estado,
  servicios.nombre
FROM citas
JOIN servicios ON citas.servicio_id = servicios.id
WHERE cliente_id = (
  SELECT id FROM clientes WHERE email = 'jhanleiderc@gmail.com'
)
ORDER BY fecha DESC;
```

### Verificar Día de la Semana

```sql
SELECT 
  fecha,
  EXTRACT(DOW FROM fecha) as dia_semana,
  CASE EXTRACT(DOW FROM fecha)
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Lunes'
    WHEN 2 THEN 'Martes'
    WHEN 3 THEN 'Miércoles'
    WHEN 4 THEN 'Jueves'
    WHEN 5 THEN 'Viernes'
    WHEN 6 THEN 'Sábado'
  END as nombre_dia
FROM citas
WHERE fecha >= CURRENT_DATE;
```

---

## 🐛 Problemas Comunes

### Problema 1: Servidor no inicia

**Síntoma**: Error al ejecutar `npm start`

**Solución**:
```bash
# Verificar que las dependencias estén instaladas
npm install

# Verificar que el puerto 3000 esté libre
lsof -i :3000
kill -9 [PID]

# Verificar variables de entorno
cat .env
```

### Problema 2: No encuentra citas

**Síntoma**: Bot dice "No encontré tu perfil"

**Solución**:
- Verificar que el email esté en minúsculas
- Verificar que el cliente exista en BD
- Verificar conexión a Supabase

### Problema 3: Horarios no aparecen

**Síntoma**: Bot dice "No hay horarios disponibles"

**Solución**:
- Verificar que el día no sea domingo
- Verificar que haya slots disponibles
- Verificar que el servicio tenga duración y buffer

---

## ✅ Checklist Final

### Antes de Producción

- [ ] Todas las pruebas manuales pasadas
- [ ] Queries de verificación ejecutadas
- [ ] Sin errores en consola
- [ ] Variables de entorno configuradas
- [ ] Documentación actualizada
- [ ] Código commiteado a Git
- [ ] Deploy a Vercel exitoso

---

**Versión**: 2.0  
**Fecha**: Abril 2026  
**Estado**: ✅ Listo para pruebas
