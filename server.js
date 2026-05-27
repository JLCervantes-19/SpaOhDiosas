import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import servicesRouter  from './routes/services.js';
import bookingsRouter  from './routes/bookings.js';
import contactRouter   from './routes/contact.js';
import chatRouter      from './routes/chat.js';
import getSupabaseClient from './config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app  = express();
const PORT = process.env.PORT ?? 3000;

// ── Compresión ──────────────────────────────────────────────
app.use(compression());

// ── Seguridad — headers HTTP ────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ── Rate limiting ───────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta en 15 minutos.' },
});
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 20,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Límite de mensajes alcanzado. Intenta en 1 hora.' },
});
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Demasiados intentos de reserva. Intenta en 15 minutos.' },
});

app.use(generalLimiter);

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL ?? '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(express.static(join(__dirname, 'frontend')));

// ── Rutas API ───────────────────────────────────────────────
app.use('/api/services',  servicesRouter);
app.use('/api/bookings',  bookingLimiter, bookingsRouter);
app.use('/api/contact',   contactRouter);
app.use('/api/chat',      chatLimiter, chatRouter);
app.use('/api/slots',     bookingsRouter);

function cachePublic(res, seconds = 300) {
  res.set('Cache-Control', `public, max-age=${seconds}, s-maxage=${seconds * 2}`);
}

app.get('/api/testimonials', async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('testimonios')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  cachePublic(res);
  res.json(data || []);
});

app.get('/api/config', async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('configuracion')
    .select('*')
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  cachePublic(res, 600);
  res.json(data || {});
});

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── SPA Fallback ────────────────────────────────────────────
app.get('*', (_, res) => {
  res.sendFile(join(__dirname, 'frontend', 'index.html'));
});

// ── Error handler ───────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Error no controlado:', err.stack);
  res.status(err.status || 500).json({
    ok: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;

// Arranque local únicamente
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Serenita Spa API corriendo en http://localhost:${PORT}`);
  });
}
