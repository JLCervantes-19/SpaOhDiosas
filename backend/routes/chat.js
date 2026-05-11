// ============================================================
// backend/routes/chat.js — Chat endpoints
// ============================================================

const express = require('express')
const supabase = require('../lib/supabase')
const { v4: uuidv4 } = require('uuid')
const N8NService = require('../services/n8n')

const router = express.Router()
const n8n = new N8NService()

// ——— POST /api/chat/session ———————————————————————————————
// Creates a new chat session in Supabase
// Returns: {session_id, started_at}
router.post('/session', async (req, res) => {
  try {
    const sessionId = uuidv4()
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        session_id: sessionId,
        started_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      })
      .select('session_id, started_at')
      .single()
    
    if (error) {
      console.error('Error creating chat session:', error)
      return res.status(500).json({ error: 'Error creando sesión de chat' })
    }
    
    res.status(201).json(data)
  } catch (err) {
    console.error('Unexpected error in POST /api/chat/session:', err)
    res.status(500).json({ error: 'Error inesperado creando sesión' })
  }
})

// ——— POST /api/chat/message ————————————————————————————————
// Recibe mensaje del usuario, lo reenvía a N8N y retorna la respuesta
// Body: {session_id, user_name?, message}
// Returns: {bot_response, quickReplies?}
router.post('/message', async (req, res) => {
  try {
    const { session_id, user_name, message } = req.body

    if (!session_id || !message) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        message: 'session_id y message son obligatorios'
      })
    }

    if (typeof message !== 'string' || message.length > 1000) {
      return res.status(400).json({
        error: 'Mensaje inválido',
        message: 'El mensaje no puede superar los 1000 caracteres'
      })
    }

    if (!n8n.isConfigured()) {
      return res.status(503).json({
        bot_response: 'El chatbot no está disponible en este momento. Contáctanos por WhatsApp.',
        error: 'N8N_NOT_CONFIGURED'
      })
    }

    // Enviar a N8N
    const n8nResponse = await n8n.sendMessage(session_id, user_name, message)

    // Actualizar actividad de la sesión (no crítico)
    supabase.from('chat_sessions')
      .update({ last_activity: new Date().toISOString(), ...(user_name && { user_name }) })
      .eq('session_id', session_id)
      .then(({ error }) => { if (error) console.error('Error updating session:', error) })

    res.status(200).json({
      bot_response: n8nResponse.response,
      quickReplies: n8nResponse.quickReplies || [],
      data: n8nResponse.data || {}
    })

  } catch (err) {
    console.error('Unexpected error in POST /api/chat/message:', err)
    res.status(500).json({
      error: 'Error procesando mensaje',
      bot_response: 'Ocurrió un error inesperado. Por favor intenta de nuevo.'
    })
  }
})

// ——— GET /api/chat/services ————————————————————————————————
// Returns list of active services from Supabase
// Requirements: 14.4, 5.1, 5.2
// Returns: Array<Service>
router.get('/services', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('servicios')
      .select('*')
      .eq('activo', true)
    
    if (error) {
      console.error('Error fetching services:', error)
      return res.status(500).json({ 
        error: 'Error consultando servicios',
        message: 'No se pudieron cargar los servicios'
      })
    }
    
    res.status(200).json(data || [])
  } catch (err) {
    console.error('Unexpected error in GET /api/chat/services:', err)
    res.status(500).json({ 
      error: 'Error inesperado',
      message: 'Ocurrió un error al consultar los servicios'
    })
  }
})

// ——— POST /api/chat/appointments ———————————————————————————
// Returns appointments for a client by documento
// Requirements: 14.5, 14.6, 7.2, 7.3, 7.4, 7.5, 7.6
// Body: {documento}
// Returns: {appointments: Array<Appointment>}
router.post('/appointments', async (req, res) => {
  try {
    const { documento } = req.body

    // Validate required field
    if (!documento) {
      return res.status(400).json({ 
        error: 'Campo requerido faltante',
        message: 'El documento es obligatorio'
      })
    }

    // Search for client by documento
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id')
      .eq('documento', documento)
      .single()

    if (clienteError || !cliente) {
      console.log('No client found for documento:', documento)
      return res.status(200).json({ 
        appointments: [],
        message: 'No se encontraron citas para este documento'
      })
    }

    // Search for appointments with service details
    const { data: appointments, error: appointmentsError } = await supabase
      .from('citas')
      .select(`
        id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        notas,
        duracion_total,
        servicios (
          nombre,
          descripcion,
          precio,
          duracion_min
        )
      `)
      .eq('cliente_id', cliente.id)
      .order('fecha', { ascending: false })
      .order('hora_inicio', { ascending: false })

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return res.status(500).json({ 
        error: 'Error consultando citas',
        message: 'No se pudieron cargar las citas'
      })
    }

    // Format appointments with service information
    const formattedAppointments = (appointments || []).map(apt => ({
      id: apt.id,
      fecha: apt.fecha,
      hora_inicio: apt.hora_inicio,
      hora_fin: apt.hora_fin,
      estado: apt.estado,
      notas: apt.notas,
      duracion_total: apt.duracion_total,
      servicio_nombre: apt.servicios?.nombre || 'Servicio no disponible',
      servicio_descripcion: apt.servicios?.descripcion,
      servicio_precio: apt.servicios?.precio,
      servicio_duracion: apt.servicios?.duracion_min
    }))

    res.status(200).json({ 
      appointments: formattedAppointments
    })

  } catch (err) {
    console.error('Unexpected error in POST /api/chat/appointments:', err)
    res.status(500).json({ 
      error: 'Error inesperado',
      message: 'Ocurrió un error al consultar las citas'
    })
  }
})

module.exports = router
