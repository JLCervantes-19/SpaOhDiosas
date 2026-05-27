import { createClient } from '@supabase/supabase-js';

let cachedClient = null;

export function getSupabaseClient() {
  if (cachedClient) return cachedClient;
  // Acepta SUPABASE_SERVICE_ROLE_KEY (nuevo estándar) o SUPABASE_SERVICE_KEY (legacy)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  cachedClient = createClient(process.env.SUPABASE_URL, serviceKey);
  return cachedClient;
}

export default getSupabaseClient;
