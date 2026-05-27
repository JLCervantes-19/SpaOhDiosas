import getSupabaseClient from '../config/supabase.js';
import app from '../server.js';

// Calentar el cliente Supabase en el arranque serverless
getSupabaseClient();

export default app;
