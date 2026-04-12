// ============================================================
// backend/routes/chat.js — Chat endpoints
// ============================================================

const express = require('express')
const supabase = require('../lib/supabase')
const { v4: uuidv4 } = require('uuid')
const ChatbotService = require('../services/chatbot')

const router = express.Router()

// Initialize Chatbot service (sin N8N)
const chatbot = new ChatbotService()

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
// Processes user message and returns bot response
// USA CHATBOT LOCAL - SIN N8N
// Body: {session_id, user_name?, message, message_type?, step?, user_doc?}
// Returns: {bot_response, data?, quick_replies?, showMenu?}
router.post('/message', async (req, res) => {
  try {
    const { session_id, user_name, message, message_type, step, user_doc } = req.body

    // Validate required fields
    if (!session_id || !message) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos',
        message: 'session_id y message son obligatorios'
      })
    }

    // Save user message to database
    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id,
        sender: 'user',
        content: message,
        message_type: message_type || 'text',
        created_at: new Date().toISOString()
      })

    if (messageError) {
      console.error('Error saving user message:', messageError)
      // Non-critical error, continue processing
    }

    // Procesar mensaje con el chatbot local PRIMERO para obtener el userName
    const context = { 
      userName: user_name,
      tempName: req.body.temp_name,  // Para el flujo de consultar citas
      citas: req.body.citas,  // Para el flujo de gestión de citas
      selectedCita: req.body.selectedCita,  // Para el flujo de cambio de fecha
      availableDays: req.body.availableDays,  // Días disponibles
      selectedDay: req.body.selectedDay,  // Día seleccionado
      availableTimes: req.body.availableTimes  // Horarios disponibles
    };
    const botResponse = await chatbot.processMessage(
      session_id,
      user_name || 'Usuario',
      message,
      step || 'initial',
      context
    );

    // Si el bot retorna un userName o tempName, usarlo para actualizar la sesión
    const finalUserName = botResponse.userName || user_name;
    const tempName = botResponse.tempName;

    // Update last_activity in session con el nombre correcto
    const updateData = { 
      last_activity: new Date().toISOString(),
      ...(finalUserName && { user_name: finalUserName })
    };
    
    // Guardar tempName en metadata si existe
    if (tempName) {
      updateData.metadata = { tempName };
    }

    const { error: sessionError } = await supabase
      .from('chat_sessions')
      .update(updateData)
      .eq('session_id', session_id)

    if (sessionError) {
      console.error('Error updating session:', sessionError)
      // Non-critical error, continue processing
    }

    // Save bot response to database
    const { error: botMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id,
        sender: 'bot',
        content: botResponse.response,
        message_type: 'text',
        created_at: new Date().toISOString(),
        metadata: botResponse.data || {}
      })

    if (botMessageError) {
      console.error('Error saving bot message:', botMessageError)
      // Non-critical error, still return response to user
    }

    // Return bot response con el userName, tempName y quickReplies
    res.status(200).json({
      bot_response: botResponse.response,
      showMenu: botResponse.showMenu || false,
      nextState: botResponse.nextState,
      action: botResponse.action,
      data: botResponse.data,
      userName: botResponse.userName || finalUserName,
      tempName: botResponse.tempName,
      quickReplies: botResponse.quickReplies,
      selectedCita: botResponse.selectedCita,
      availableDays: botResponse.availableDays,
      selectedDay: botResponse.selectedDay,
      availableTimes: botResponse.availableTimes
    })

  } catch (err) {
    console.error('Unexpected error in POST /api/chat/message:', err)
    res.status(500).json({ 
      error: 'Error procesando mensaje',
      message: 'Ocurrió un error inesperado. Por favor intenta de nuevo.'
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
