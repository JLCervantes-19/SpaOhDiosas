// ============================================================
// backend/server.js — Servidor Express principal
// ============================================================

require('dotenv').config()

// Configurar zona horaria de Colombia para toda la aplicación
process.env.TZ = 'America/Bogota'

const express  = require('express')
const cors     = require('cors')
const path     = require('path')

const servicesRouter  = require('./routes/services')
const bookingsRouter  = require('./routes/bookings')
const contactRouter   = require('./routes/contact')

const app  = express()
const PORT = process.env.PORT ?? 3000

// ——— MIDDLEWARE ——————————————————————————————————————————
app.use(cors({
  origin: process.env.FRONTEND_URL ?? '*',
  methods: ['GET', 'POST', 'PATCH'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Servir archivos estáticos del frontend
// 👉 En producción (Vercel) el frontend se sirve estáticamente
app.use(express.static(path.join(__dirname, '../frontend')))

// ——— ROUTES ——————————————————————————————————————————————
app.use('/api/services',      servicesRouter)
app.use('/api/bookings',      bookingsRouter)
app.use('/api/contact',       contactRouter)
app.use('/api/slots',         bookingsRouter)   // re-usa el router (tiene /slots)

// Testimonials - endpoint separado
app.get('/api/testimonials', async (req, res) => {
  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  
  const { data, error } = await supabase
    .from('testimonios')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false })
  
  if (error) return res.status(500).json({ error: error.message })
  res.json(data || [])
})

// ——— HEALTH CHECK ————————————————————————————————————————
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ——— SPA FALLBACK ————————————————————————————————————————
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

// ——— START ———————————————————————————————————————————————
app.listen(PORT, () => {
  console.log(`\n🌿 Serenità Spa Server corriendo en http://localhost:${PORT}`)
  console.log(`   API disponible en http://localhost:${PORT}/api`)
  console.log(`   Frontend en      http://localhost:${PORT}\n`)
})

module.exports = app
