#!/usr/bin/env node
/**
 * Execute Migration: Add Documento to Clientes
 * 
 * This script executes the migration to add the documento column
 * to the clientes table in Supabase.
 * 
 * Usage: node database/migrations/execute_documento_migration.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function executeMigration() {
  console.log('🚀 Ejecutando migración: Add Documento to Clientes\n');

  // Check environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ Error: Variables de entorno no configuradas');
    console.log('   Por favor configura SUPABASE_URL y SUPABASE_ANON_KEY\n');
    return false;
  }

  console.log('✓ Variables de entorno encontradas');
  console.log('  SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('  SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY.substring(0, 20) + '...\n');

  try {
    // Create Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Read migration file
    const migrationPath = path.join(__dirname, '002_add_documento_to_clientes.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('✓ Archivo de migración leído correctamente\n');
    console.log('📝 Ejecutando SQL...\n');

    // Execute migration using RPC (Supabase doesn't support direct SQL execution via JS client)
    // We need to use the SQL editor in Supabase Dashboard or use the Management API
    console.log('⚠️  NOTA IMPORTANTE:');
    console.log('   El cliente de Supabase JS no soporta ejecución directa de SQL DDL.');
    console.log('   Por favor ejecuta la migración manualmente:\n');
    console.log('   1. Ve a Supabase Dashboard → SQL Editor');
    console.log('   2. Copia y pega el contenido de:');
    console.log('      database/migrations/002_add_documento_to_clientes.sql');
    console.log('   3. Ejecuta el script');
    console.log('   4. Luego ejecuta este script de verificación:\n');
    console.log('      node database/migrations/verify_documento_migration.js\n');

    return true;

  } catch (error) {
    console.error('❌ Error inesperado:');
    console.error(error);
    return false;
  }
}

// Run migration
executeMigration().then(success => {
  process.exit(success ? 0 : 1);
});
