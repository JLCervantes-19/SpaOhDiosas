// ============================================================
// api/index.js — Serverless function para Vercel
// Vercel sirve /frontend como estático y /api como funciones
// ============================================================

const express  = require('express')
const cors     = require('cors')

const servicesRouter = require('../backend/routes/services')
const bookingsRouter = require('../backend/routes/bookings')
const contactRouter  = require('../backend/routes/contact')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/services',     servicesRouter)
app.use('/api/bookings',     bookingsRouter)
app.use('/api/contact',      contactRouter)

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
