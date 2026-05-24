// backend/lib/supabase.js
const { createClient } = require('@supabase/supabase-js')

// service_role bypasses RLS — exclusivo del backend, nunca exponer en el frontend
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

module.exports = supabase
