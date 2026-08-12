import express from 'express';
import { randomUUID } from 'crypto';
import getSupabaseClient, { EMPRESA_ID } from '../config/supabase.js';
import N8NService from '../services/n8n.js';

const router = express.Router();
const n8n = new N8NService();

// POST /api/chat/session
router.post('/session', async (req, res) => {
  const supabase = getSupabaseClient();
  try {
    const sessionId = randomUUID();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ session_id: sessionId, started_at: now, last_activity: now, empresa_id: EMPRESA_ID })
      .select('session_id, started_at')
      .single();

    if (error) return res.status(500).json({ error: 'Error creando sesión de chat' });
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: 'Error inesperado creando sesión' });
  }
});

// POST /api/chat/message
router.post('/message', async (req, res) => {
  const supabase = getSupabaseClient();
  try {
    const { session_id, user_name, message, messageType = 'text', action = null } = req.body;

    if (!session_id || !message) {
      return res.status(400).json({ error: 'session_id y message son obligatorios' });
    }
    if (typeof message !== 'string' || message.length > 1000) {
      return res.status(400).json({ error: 'El mensaje no puede superar los 1000 caracteres' });
    }
    if (!n8n.isConfigured()) {
      return res.status(503).json({
        bot_response: 'El chatbot no está disponible en este momento. Contáctanos por WhatsApp.',
        error: 'N8N_NOT_CONFIGURED',
      });
    }

    const n8nResponse = await n8n.sendMessage(session_id, user_name, message, messageType, action);

    supabase.from('chat_sessions')
      .update({ last_activity: new Date().toISOString(), ...(user_name && { user_name }) })
      .eq('session_id', session_id)
      .eq('empresa_id', EMPRESA_ID)
      .then(({ error }) => { if (error) console.error('Error updating session:', error); });

    res.status(200).json({
      bot_response: n8nResponse.response,
      bot_messages: n8nResponse.messages || [],
      quickReplies: n8nResponse.quickReplies || [],
      redirect: n8nResponse.redirect || null,
      data: n8nResponse.data || {},
    });
  } catch (err) {
    console.error('Error in POST /api/chat/message:', err);
    res.status(500).json({
      error: 'Error procesando mensaje',
      bot_response: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
    });
  }
});

// GET /api/chat/services
router.get('/services', async (req, res) => {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('servicios')
      .select('*')
      .eq('activo', true)
      .eq('empresa_id', EMPRESA_ID);

    if (error) return res.status(500).json({ error: 'Error consultando servicios' });
    res.status(200).json(data || []);
  } catch {
    res.status(500).json({ error: 'Error inesperado' });
  }
});

// POST /api/chat/appointments
router.post('/appointments', async (req, res) => {
  const supabase = getSupabaseClient();
  try {
    const { documento } = req.body;
    if (!documento) return res.status(400).json({ error: 'El documento es obligatorio' });

    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id')
      .eq('documento', documento)
      .eq('empresa_id', EMPRESA_ID)
      .single();

    if (clienteError || !cliente) {
      return res.status(200).json({ appointments: [], message: 'No se encontraron citas para este documento' });
    }

    const { data: appointments, error: appointmentsError } = await supabase
      .from('citas')
      .select(`id, fecha, hora_inicio, hora_fin, estado, notas, duracion_total,
        servicios(nombre, descripcion, precio, duracion_min)`)
      .eq('cliente_id', cliente.id)
      .eq('empresa_id', EMPRESA_ID)
      .order('fecha', { ascending: false })
      .order('hora_inicio', { ascending: false });

    if (appointmentsError) return res.status(500).json({ error: 'Error consultando citas' });

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
      servicio_duracion: apt.servicios?.duracion_min,
    }));

    res.status(200).json({ appointments: formattedAppointments });
  } catch {
    res.status(500).json({ error: 'Error inesperado' });
  }
});

export default router;
