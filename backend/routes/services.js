// ============================================================
// backend/routes/services.js — Servicios & Testimonios
// ============================================================

const express  = require('express')
const supabase = require('../lib/supabase')

const router = express.Router()

// ——— GET /api/services ————————————————————————————————————
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('servicios')
      .select('*')
      .eq('activo', true)
      .order('nombre')
    
    if (error) return res.status(500).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error cargando servicios' })
  }
})

// ——— GET /api/services/:id ———————————————————————————————
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('id', req.params.id)
    .single()
  
  if (error) return res.status(404).json({ error: 'Servicio no encontrado' })
  res.json(data)
})

// ——— POST /api/services — Crear servicio (admin) —————————
router.post('/', async (req, res) => {
  const { nombre, descripcion, precio, duracion_min, buffer_min, imagen, categoria } = req.body

  if (!nombre || !precio || !duracion_min) {
    return res.status(400).json({ error: 'Campos requeridos: nombre, precio, duracion_min' })
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
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// ——— GET /api/testimonials ———————————————————————————————
// Este endpoint se monta en /api/testimonials desde server.js
router.get('/testimonials', async (req, res) => {
  const { data, error } = await supabase
    .from('testimonios')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Alternativa: si el router se monta directamente en /api/testimonials
// el GET '/' también funciona para esa ruta
const testimonialRouter = express.Router()
testimonialRouter.get('/', async (_, res) => {
  const { data, error } = await supabase
    .from('testimonios')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

module.exports        = router
module.exports.testimonials = testimonialRouter
