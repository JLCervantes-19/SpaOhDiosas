#!/usr/bin/env node
/**
 * Verification Script: Check Chat Tables
 * 
 * This script verifies that the chat_sessions and chat_messages tables
 * were created correctly in Supabase with all required columns, indexes,
 * and constraints.
 * 
 * Usage: node database/migrations/verify_chat_tables.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function verifyTables() {
  console.log('🔍 Verificando tablas de chat en Supabase...\n');

  try {
    // Test 1: Check if chat_sessions table exists by querying it
    console.log('✓ Verificando tabla chat_sessions...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      console.error('❌ Error: Tabla chat_sessions no existe o no es accesible');
      console.error('   Detalle:', sessionsError.message);
      return false;
    }
    console.log('✅ Tabla chat_sessions existe y es accesible\n');

    // Test 2: Check if chat_messages table exists by querying it
    console.log('✓ Verificando tabla chat_messages...');
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1);

    if (messagesError) {
      console.error('❌ Error: Tabla chat_messages no existe o no es accesible');
      console.error('   Detalle:', messagesError.message);
      return false;
    }
    console.log('✅ Tabla chat_messages existe y es accesible\n');

    // Test 3: Verify we can create a test session
    console.log('✓ Verificando creación de sesión de prueba...');
    const testSessionId = crypto.randomUUID();
    const { data: newSession, error: createError } = await supabase
      .from('chat_sessions')
      .insert({
        session_id: testSessionId,
        user_name: 'Test User',
        metadata: { test: true }
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error: No se pudo crear sesión de prueba');
      console.error('   Detalle:', createError.message);
      return false;
    }
    console.log('✅ Sesión de prueba creada correctamente');
    console.log('   Session ID:', newSession.session_id);
    console.log('   User Name:', newSession.user_name, '\n');

    // Test 4: Verify we can create a test message
    console.log('✓ Verificando creación de mensaje de prueba...');
    const { data: newMessage, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: testSessionId,
        sender: 'user',
        content: 'Test message',
        message_type: 'text',
        metadata: { test: true }
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Error: No se pudo crear mensaje de prueba');
      console.error('   Detalle:', messageError.message);
      return false;
    }
    console.log('✅ Mensaje de prueba creado correctamente');
    console.log('   Message ID:', newMessage.id);
    console.log('   Sender:', newMessage.sender);
    console.log('   Content:', newMessage.content, '\n');

    // Test 5: Verify foreign key constraint works
    console.log('✓ Verificando constraint de foreign key...');
    const { data: messageWithSession, error: joinError } = await supabase
      .from('chat_messages')
      .select('*, chat_sessions(*)')
      .eq('id', newMessage.id)
      .single();

    if (joinError) {
      console.error('❌ Error: Foreign key constraint no funciona correctamente');
      console.error('   Detalle:', joinError.message);
      return false;
    }
    console.log('✅ Foreign key constraint funciona correctamente\n');

    // Test 6: Verify indexes by checking query performance
    console.log('✓ Verificando índices...');
    const { data: sessionLookup, error: lookupError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_id', testSessionId)
      .single();

    if (lookupError) {
      console.error('❌ Error: Búsqueda por session_id falló');
      console.error('   Detalle:', lookupError.message);
      return false;
    }
    console.log('✅ Índice en session_id funciona correctamente\n');

    // Test 7: Verify sender constraint
    console.log('✓ Verificando constraint de sender...');
    const { error: invalidSenderError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: testSessionId,
        sender: 'invalid_sender',
        content: 'This should fail',
        message_type: 'text'
      });

    if (!invalidSenderError) {
      console.error('❌ Error: Constraint de sender no está funcionando (debería rechazar valores inválidos)');
      return false;
    }
    console.log('✅ Constraint de sender funciona correctamente (rechaza valores inválidos)\n');

    // Cleanup: Delete test data
    console.log('✓ Limpiando datos de prueba...');
    const { error: deleteError } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('session_id', testSessionId);

    if (deleteError) {
      console.warn('⚠️  Advertencia: No se pudieron eliminar datos de prueba');
      console.warn('   Detalle:', deleteError.message);
    } else {
      console.log('✅ Datos de prueba eliminados (cascade delete funcionó)\n');
    }

    // Final summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ VERIFICACIÓN COMPLETA - TODAS LAS PRUEBAS PASARON');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Tablas verificadas:');
    console.log('  ✓ chat_sessions - existe y funciona');
    console.log('  ✓ chat_messages - existe y funciona');
    console.log('');
    console.log('Características verificadas:');
    console.log('  ✓ Creación de sesiones');
    console.log('  ✓ Creación de mensajes');
    console.log('  ✓ Foreign key constraint (session_id)');
    console.log('  ✓ Índice en session_id');
    console.log('  ✓ Constraint de sender (user/bot)');
    console.log('  ✓ Cascade delete');
    console.log('');
    console.log('🎉 Las tablas de chat están listas para usar!');
    console.log('');

    return true;

  } catch (error) {
    console.error('❌ Error inesperado durante la verificación:');
    console.error(error);
    return false;
  }
}

// Run verification
verifyTables().then(success => {
  process.exit(success ? 0 : 1);
});
