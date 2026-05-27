import express from 'express';
import getSupabaseClient from '../config/supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('servicios')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) return res.status(500).json({ error: error.message });
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error cargando servicios' });
  }
});

router.get('/:id', async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Servicio no encontrado' });
  res.json(data);
});

router.post('/', async (req, res) => {
  const supabase = getSupabaseClient();
  const { nombre, descripcion, precio, duracion_min, buffer_min, imagen, categoria } = req.body;

  if (!nombre || !precio || !duracion_min) {
    return res.status(400).json({ error: 'Campos requeridos: nombre, precio, duracion_min' });
  }

  const { data, error } = await supabase
    .from('servicios')
    .insert({
      nombre,
      descripcion: descripcion ?? '',
      precio: Number(precio),
      duracion_min: Number(duracion_min),
      buffer_min: Number(buffer_min ?? 10),
      imagen: imagen ?? '',
      categoria: categoria ?? '',
      activo: true,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

export default router;
