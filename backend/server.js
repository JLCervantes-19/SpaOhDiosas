// ============================================================
// backend/server.js — Servidor Express principal
// ============================================================

require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const path       = require('path')
const helmet     = require('helmet')
const rateLimit  = require('express-rate-limit')

const servicesRouter  = require('./routes/services')
const bookingsRouter  = require('./routes/bookings')
const contactRouter   = require('./routes/contact')
const chatRouter      = require('./routes/chat')

const app  = express()
const PORT = process.env.PORT ?? 3000

// ——— SEGURIDAD — HEADERS HTTP ————————————————————————————
app.use(helmet({ contentSecurityPolicy: false }))

// ——— SEGURIDAD — RATE LIMITING ———————————————————————————
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta en 15 minutos.' }
})
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Límite de mensajes alcanzado. Intenta en 1 hora.' }
})
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de reserva. Intenta en 15 minutos.' }
})

app.use(generalLimiter)

// ——— MIDDLEWARE ——————————————————————————————————————————
app.use(cors({
  origin: process.env.FRONTEND_URL ?? '*',
  methods: ['GET', 'POST', 'PATCH'],
}))
app.use(express.json({ limit: '50kb' }))
app.use(express.urlencoded({ extended: true, limit: '50kb' }))

// Servir archivos estáticos del frontend
// 👉 En producción (Vercel) el frontend se sirve estáticamente
app.use(express.static(path.join(__dirname, '../frontend')))

// ——— ROUTES ——————————————————————————————————————————————
app.use('/api/services',      servicesRouter)
app.use('/api/bookings',      bookingLimiter, bookingsRouter)
app.use('/api/contact',       contactRouter)
app.use('/api/chat',          chatLimiter, chatRouter)
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
