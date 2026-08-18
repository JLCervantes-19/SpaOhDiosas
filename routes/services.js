import express from 'express';
import { timingSafeEqual } from 'crypto';
import getSupabaseClient, { EMPRESA_ID } from '../config/supabase.js';

const router = express.Router();

// Igual que en bookings.js: la creación de servicios es solo para admin.
// Solo por header (no query string, que queda expuesto en logs/referrer) y
// comparación timing-safe (evita filtrar el token por diferencia de tiempo).
function requireAdmin(req, res, next) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return res.status(403).json({ error: 'Admin no configurado' });
  const provided = req.headers['x-admin-token'] || '';
  const a = Buffer.from(provided);
  const b = Buffer.from(adminToken);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  next();
}

router.get('/categories', async (req, res) => {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre, color, orden')
      .eq('activo', true)
      .eq('empresa_id', EMPRESA_ID)
      .order('orden');

    if (error) return res.status(500).json({ error: error.message });
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Error cargando categorías' });
  }
});

router.get('/', async (req, res) => {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('servicios')
      .select('*, categorias(id, nombre, color)')
      .eq('activo', true)
      .eq('empresa_id', EMPRESA_ID)
      .order('nombre');

    if (error) return res.status(500).json({ error: error.message });

    const normalized = (data || []).map(s => ({
      ...s,
      categoria_nombre: s.categorias?.nombre ?? s.categoria ?? null,
      categoria_color:  s.categorias?.color  ?? null,
    }));

    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.json(normalized);
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
    .eq('empresa_id', EMPRESA_ID)
    .single();

  if (error) return res.status(404).json({ error: 'Servicio no encontrado' });
  res.json(data);
});

router.post('/', requireAdmin, async (req, res) => {
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
      empresa_id: EMPRESA_ID,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

export default router;
