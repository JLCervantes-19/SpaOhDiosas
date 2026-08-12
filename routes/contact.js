import express from 'express';
import getSupabaseClient, { EMPRESA_ID } from '../config/supabase.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { nombre, email, telefono, mensaje } = req.body;
  const supabase = getSupabaseClient();

  if (!nombre || (!email && !telefono)) {
    return res.status(400).json({ error: 'Nombre y email o teléfono son requeridos' });
  }

  const { error } = await supabase
    .from('contactos')
    .insert({ nombre, email: email ?? '', telefono: telefono ?? '', mensaje: mensaje ?? '', empresa_id: EMPRESA_ID })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Mensaje recibido. Te contactaremos pronto.' });
});

export default router;
