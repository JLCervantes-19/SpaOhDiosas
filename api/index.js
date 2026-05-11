// ============================================================
// api/index.js — Serverless function para Vercel
// Vercel sirve /frontend como estático y /api como funciones
// ============================================================

const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const rateLimit  = require('express-rate-limit')

const servicesRouter = require('../backend/routes/services')
const bookingsRouter = require('../backend/routes/bookings')
const contactRouter  = require('../backend/routes/contact')
const chatRouter     = require('../backend/routes/chat')

const app = express()

app.use(helmet({ contentSecurityPolicy: false }))

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
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH'],
}))
app.use(express.json({ limit: '50kb' }))

app.use('/api/services',     servicesRouter)
app.use('/api/bookings',     bookingLimiter, bookingsRouter)
app.use('/api/contact',      contactRouter)
app.use('/api/chat',         chatLimiter, chatRouter)

// Testimonials endpoint separado
app.get('/api/testimonials', (req, res) => {
  const path = require('path')
  const fs   = require('fs')
  const file = path.join(__dirname, '../data/testimonials.json')
  try {
    res.json(JSON.parse(fs.readFileSync(file, 'utf8')))
  } catch {
    res.json([])
  }
})

// Slots disponibles
app.get('/api/slots', (req, res, next) => {
  req.url = '/'  // redirige al router interno
  bookingsRouter(req, res, next)
})

app.get('/api/health', (_, res) => res.json({ ok: true }))

module.exports = app
