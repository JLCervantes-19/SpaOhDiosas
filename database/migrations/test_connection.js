#!/usr/bin/env node
/**
 * Test Supabase Connection
 * 
 * Simple script to verify that the Supabase connection is working
 * before executing migrations.
 * 
 * Usage: node database/migrations/test_connection.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('🔌 Probando conexión a Supabase...\n');

  // Check environment variables
  if (!process.env.SUPABASE_URL) {
    console.error('❌ Error: SUPABASE_URL no está configurada en .env');
    console.log('   Por favor crea un archivo .env con:');
    console.log('   SUPABASE_URL=https://tu-proyecto.supabase.co');
    console.log('   SUPABASE_ANON_KEY=tu-anon-key\n');
    return false;
  }

  if (!process.env.SUPABASE_ANON_KEY) {
    console.error('❌ Error: SUPABASE_ANON_KEY no está configurada en .env');
    console.log('   Por favor agrega a tu archivo .env:');
    console.log('   SUPABASE_ANON_KEY=tu-anon-key\n');
    return false;
  }

  console.log('✓ Variables de entorno encontradas:');
  console.log('  SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('  SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY.substring(0, 20) + '...\n');

  try {
    // Create Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Try a simple query to test connection
    console.log('✓ Intentando consulta de prueba...');
    const { data, error } = await supabase
      .from('servicios')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Error al conectar con Supabase:');
      console.error('   Código:', error.code);
      console.error('   Mensaje:', error.message);
      console.error('   Detalles:', error.details);
      console.log('\n💡 Verifica que:');
      console.log('   1. Las credenciales en .env son correctas');
      console.log('   2. El proyecto de Supabase está activo');
      console.log('   3. Tienes conexión a internet\n');
      return false;
    }

    console.log('✅ Conexión exitosa a Supabase!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ CONEXIÓN VERIFICADA - LISTO PARA EJECUTAR MIGRACIONES');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Próximos pasos:');
    console.log('  1. Ve a Supabase Dashboard → SQL Editor');
    console.log('  2. Ejecuta el archivo: database/migrations/001_create_chat_tables.sql');
    console.log('  3. Verifica con: node database/migrations/verify_chat_tables.js\n');

    return true;

  } catch (error) {
    console.error('❌ Error inesperado:');
    console.error(error);
    return false;
  }
}

// Run test
testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
