// ============================================================
// backend/routes/contact.js — Formulario de contacto
// ============================================================

const express  = require('express')
const supabase = require('../lib/supabase')

const router = express.Router()

// POST /api/contact
router.post('/', async (req, res) => {
  const { nombre, email, telefono, mensaje } = req.body

  if (!nombre || (!email && !telefono)) {
    return res.status(400).json({ error: 'Nombre y email o teléfono son requeridos' })
  }

  const { data, error } = await supabase
    .from('contactos')
    .insert({
      nombre,
      email: email ?? '',
      telefono: telefono ?? '',
      mensaje: mensaje ?? '',
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  // 👉 Aquí puedes integrar nodemailer, SendGrid, etc.
  res.json({ message: 'Mensaje recibido. Te contactaremos pronto.' })
})

module.exports = router
