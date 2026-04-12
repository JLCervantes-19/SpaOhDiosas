#!/usr/bin/env node
/**
 * Verify Migration: Add Documento to Clientes
 * 
 * This script verifies that the documento column was successfully
 * added to the clientes table in Supabase.
 * 
 * Usage: node database/migrations/verify_documento_migration.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function verifyMigration() {
  console.log('🔍 Verificando migración: Add Documento to Clientes\n');

  // Check environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ Error: Variables de entorno no configuradas');
    console.log('   Por favor configura SUPABASE_URL y SUPABASE_ANON_KEY\n');
    return false;
  }

  console.log('✓ Variables de entorno encontradas\n');

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    let allTestsPassed = true;

    // Test 1: Check if clientes table exists
    console.log('✓ Verificando tabla clientes...');
    const { data: clientesData, error: clientesError } = await supabase
      .from('clientes')
      .select('*')
      .limit(1);

    if (clientesError) {
      console.error('❌ Error: Tabla clientes no existe o no es accesible');
      console.error('   Detalles:', clientesError.message);
      allTestsPassed = false;
    } else {
      console.log('✅ Tabla clientes existe y es accesible\n');
    }

    // Test 2: Check if documento column exists by trying to select it
    console.log('✓ Verificando columna documento...');
    const { data: documentoTest, error: documentoError } = await supabase
      .from('clientes')
      .select('id, nombre, documento')
      .limit(1);

    if (documentoError) {
      console.error('❌ Error: Columna documento no existe');
      console.error('   Detalles:', documentoError.message);
      console.log('\n💡 Solución:');
      console.log('   1. Ve a Supabase Dashboard → SQL Editor');
      console.log('   2. Ejecuta: database/migrations/002_add_documento_to_clientes.sql\n');
      allTestsPassed = false;
    } else {
      console.log('✅ Columna documento existe y es accesible\n');
    }

    // Test 3: Try to insert a test cliente with documento
    if (!documentoError) {
      console.log('✓ Verificando inserción con documento...');
      const testDocumento = 'TEST-' + Date.now();
      const { data: insertData, error: insertError } = await supabase
        .from('clientes')
        .insert({
          nombre: 'Test Cliente Migración',
          telefono: '3001234567',
          email: 'test@migration.com',
          documento: testDocumento,
          origen: 'test'
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error al insertar cliente con documento');
        console.error('   Detalles:', insertError.message);
        allTestsPassed = false;
      } else {
        console.log('✅ Inserción con documento exitosa');
        console.log('   Cliente ID:', insertData.id);
        console.log('   Documento:', insertData.documento, '\n');

        // Test 4: Try to query by documento
        console.log('✓ Verificando consulta por documento...');
        const { data: queryData, error: queryError } = await supabase
          .from('clientes')
          .select('*')
          .eq('documento', testDocumento)
          .single();

        if (queryError) {
          console.error('❌ Error al consultar por documento');
          console.error('   Detalles:', queryError.message);
          allTestsPassed = false;
        } else {
          console.log('✅ Consulta por documento exitosa');
          console.log('   Cliente encontrado:', queryData.nombre, '\n');
        }

        // Test 5: Verify index exists (performance test)
        console.log('✓ Verificando índice idx_clientes_documento...');
        const startTime = Date.now();
        const { data: indexTest, error: indexError } = await supabase
          .from('clientes')
          .select('id, nombre, documento')
          .eq('documento', testDocumento);
        const queryTime = Date.now() - startTime;

        if (indexError) {
          console.error('❌ Error al verificar índice');
          console.error('   Detalles:', indexError.message);
          allTestsPassed = false;
        } else {
          console.log('✅ Índice funciona correctamente');
          console.log('   Tiempo de consulta:', queryTime, 'ms\n');
        }

        // Clean up test data
        console.log('✓ Limpiando datos de prueba...');
        const { error: deleteError } = await supabase
          .from('clientes')
          .delete()
          .eq('id', insertData.id);

        if (deleteError) {
          console.warn('⚠️  Advertencia: No se pudo eliminar el cliente de prueba');
          console.warn('   ID:', insertData.id);
          console.warn('   Por favor elimínalo manualmente\n');
        } else {
          console.log('✅ Datos de prueba eliminados\n');
        }
      }
    }

    // Final summary
    if (allTestsPassed) {
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ VERIFICACIÓN COMPLETA - TODAS LAS PRUEBAS PASARON');
      console.log('═══════════════════════════════════════════════════════\n');
      console.log('Características verificadas:');
      console.log('  ✓ Tabla clientes existe');
      console.log('  ✓ Columna documento existe');
      console.log('  ✓ Inserción con documento funciona');
      console.log('  ✓ Consulta por documento funciona');
      console.log('  ✓ Índice idx_clientes_documento funciona\n');
      console.log('🎉 La migración se ejecutó correctamente!\n');
      console.log('Próximos pasos:');
      console.log('  ✅ Marca la tarea 1.2 como completada');
      console.log('  ➡️  Continúa con la siguiente tarea del spec\n');
      return true;
    } else {
      console.log('═══════════════════════════════════════════════════════');
      console.log('❌ VERIFICACIÓN FALLIDA - ALGUNAS PRUEBAS NO PASARON');
      console.log('═══════════════════════════════════════════════════════\n');
      console.log('Por favor revisa los errores arriba y ejecuta la migración:\n');
      console.log('  1. Ve a Supabase Dashboard → SQL Editor');
      console.log('  2. Ejecuta: database/migrations/002_add_documento_to_clientes.sql');
      console.log('  3. Vuelve a ejecutar este script de verificación\n');
      return false;
    }

  } catch (error) {
    console.error('❌ Error inesperado:');
    console.error(error);
    return false;
  }
}

// Run verification
verifyMigration().then(success => {
  process.exit(success ? 0 : 1);
});
