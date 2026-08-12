import { createClient } from '@supabase/supabase-js';

let cachedClient = null;

export function getSupabaseClient() {
  if (cachedClient) return cachedClient;
  // Acepta SUPABASE_SERVICE_ROLE_KEY (nuevo estándar) o SUPABASE_SERVICE_KEY (legacy)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  cachedClient = createClient(process.env.SUPABASE_URL, serviceKey);
  return cachedClient;
}

// Multi-tenant: cada despliegue de esta landing sirve a UNA empresa,
// identificada por esta variable de entorno (Vercel → Settings →
// Environment Variables, distinta por proyecto/dominio). Si no está
// configurada, cae en Empresa 0 (los datos de prueba/demo existentes)
// para no romper el despliegue actual mientras se migra.
export const EMPRESA_ID = process.env.EMPRESA_ID || '00000000-0000-0000-0000-000000000000';

export default getSupabaseClient;
