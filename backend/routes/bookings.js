// ============================================================
// backend/routes/bookings.js — Citas y disponibilidad
// ============================================================

const express  = require('express')
const supabase = require('../lib/supabase')

const router = express.Router()

// Horario del spa: Lunes–Viernes 9–18, Sábado 9–16
// 👉 Aquí puedes modificar el horario del spa
const SCHEDULE = {
  1: { start: '09:00', end: '18:00' }, // Lunes
  2: { start: '09:00', end: '18:00' }, // Martes
  3: { start: '09:00', end: '18:00' }, // Miércoles
  4: { start: '09:00', end: '18:00' }, // Jueves
  5: { start: '09:00', end: '18:00' }, // Viernes
  6: { start: '09:00', end: '16:00' }, // Sábado
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(m) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

function intervalosSeCruzan(s1, e1, s2, e2) {
  return timeToMinutes(s1) < timeToMinutes(e2) &&
         timeToMinutes(e1) > timeToMinutes(s2)
}

// ——— GET /api/slots?servicio=id&fecha=YYYY-MM-DD ——————————
router.get('/', async (req, res) => {
  const { servicio, fecha } = req.query
  if (!servicio || !fecha) {
    return res.status(400).json({ error: 'Parámetros requeridos: servicio, fecha' })
  }

  // Obtener servicio
  const { data: svc, error: svcError } = await supabase
    .from('servicios')
    .select('*')
    .eq('id', servicio)
    .single()
  
  if (svcError) return res.status(404).json({ error: 'Servicio no encontrado' })

  const totalMin = svc.duracion_min + (svc.buffer_min ?? 10)

  // Día de la semana
  const date    = new Date(fecha + 'T12:00:00')
  const dia     = date.getDay()
  const horario = SCHEDULE[dia]
  if (!horario) return res.json([]) // Domingo cerrado

  // Citas del día
  const { data: citasDia } = await supabase
    .from('citas')
    .select('hora_inicio, hora_fin')
    .eq('fecha', fecha)
    .neq('estado', 'cancelada')

  // Generar slots de 30 min
  const slots  = []
  let cursor   = timeToMinutes(horario.start)
  const endMin = timeToMinutes(horario.end)

  while (cursor + totalMin <= endMin) {
    const slotStart = minutesToTime(cursor)
    const slotEnd   = minutesToTime(cursor + totalMin)

    const ocupado = (citasDia || []).some(c =>
      intervalosSeCruzan(slotStart, slotEnd, c.hora_inicio, c.hora_fin)
    )

    slots.push({ hora: slotStart, disponible: !ocupado })
    cursor += 30
  }

  res.json(slots)
})

// ——— POST /api/bookings ——————————————————————————————————
router.post('/', async (req, res) => {
  const {
    nombre, telefono, email, servicio_id,
    fecha, hora_inicio, notas, origen,
  } = req.body

  if (!nombre || !telefono || !servicio_id || !fecha || !hora_inicio) {
    return res.status(400).json({
      error: 'Campos requeridos: nombre, telefono, servicio_id, fecha, hora_inicio'
    })
  }

  // Primero, crear o buscar el cliente
  let cliente_id = null
  
  // Buscar si el cliente ya existe por teléfono
  const { data: clienteExistente } = await supabase
    .from('clientes')
    .select('id')
    .eq('telefono', telefono)
    .single()
  
  if (clienteExistente) {
    cliente_id = clienteExistente.id
  } else {
    // Crear nuevo cliente
    const { data: nuevoCliente, error: clienteError } = await supabase
      .from('clientes')
      .insert({
        nombre,
        telefono,
        email: email ?? '',
        origen: origen ?? 'web'
      })
      .select()
      .single()
    
    if (clienteError) return res.status(500).json({ error: 'Error al crear cliente: ' + clienteError.message })
    cliente_id = nuevoCliente.id
  }

  // Validar servicio
  const { data: svc, error: svcError } = await supabase
    .from('servicios')
    .select('*')
    .eq('id', servicio_id)
    .single()
  
  if (svcError) return res.status(404).json({ error: 'Servicio no encontrado' })

  // Calcular hora_fin y duracion_total
  const duracion_total = svc.duracion_min + (svc.buffer_min ?? 10)
  const endMin   = timeToMinutes(hora_inicio) + duracion_total
  const hora_fin = minutesToTime(endMin)

  // Verificar disponibilidad
  const { data: citasDia } = await supabase
    .from('citas')
    .select('hora_inicio, hora_fin')
    .eq('fecha', fecha)
    .neq('estado', 'cancelada')
  
  const ocupado = (citasDia || []).some(c =>
    intervalosSeCruzan(hora_inicio, hora_fin, c.hora_inicio, c.hora_fin)
  )

  if (ocupado) {
    return res.status(409).json({ error: 'El horario ya no está disponible. Por favor elige otro.' })
  }

  // Crear cita
  const { data: cita, error: citaError } = await supabase
    .from('citas')
    .insert({
      cliente_id,
      servicio_id,
      fecha,
      hora_inicio,
      hora_fin,
      duracion_total,
      estado: 'confirmada', // Estado inicial: confirmada
      origen: origen ?? 'web',
      notas: notas ?? '',
    })
    .select()
    .single()

  if (citaError) return res.status(500).json({ error: citaError.message })

  // ——— WEBHOOK n8n (preparado) ————————————————————————————
  // 👉 Descomenta para enviar notificaciones automáticas por WhatsApp
  // if (process.env.N8N_WEBHOOK_URL) {
  //   fetch(process.env.N8N_WEBHOOK_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ 
  //       cita, 
  //       cliente: { nombre, telefono, email }, 
  //       servicio: svc.nombre, 
  //       tipo: 'nueva_cita' 
  //     }),
  //   }).catch(() => {})
  // }

  res.status(201).json({ 
    ...cita, 
    cliente: { nombre, telefono, email },
    servicio: svc.nombre,
    message: 'Reserva creada exitosamente' 
  })
})

// ——— GET /api/bookings (admin) ———————————————————————————
router.get('/all', async (req, res) => {
  const { fecha } = req.query
  
  // Hacer join con clientes y servicios para obtener toda la info
  let query = supabase
    .from('citas')
    .select(`
      *,
      clientes (nombre, telefono, email),
      servicios (nombre, precio)
    `)
    .order('fecha', { ascending: false })
    .order('hora_inicio', { ascending: true })
  
  if (fecha) query = query.eq('fecha', fecha)
  
  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// ——— PATCH /api/bookings/:id/status —————————————————————
// Actualizar estado de una cita
// Estados válidos: 'confirmada', 'cancelada', 'asistio', 'no_asistio'
router.patch('/:id/status', async (req, res) => {
  const { estado } = req.body
  
  // Validar que el estado sea válido
  const estadosValidos = ['confirmada', 'cancelada', 'asistio', 'no_asistio']
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ 
      error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` 
    })
  }
  
  const { data, error } = await supabase
    .from('citas')
    .update({ estado })
    .eq('id', req.params.id)
    .select()
    .single()
  
  if (error) return res.status(404).json({ error: 'Cita no encontrada' })
  res.json(data)
})

module.exports = router
