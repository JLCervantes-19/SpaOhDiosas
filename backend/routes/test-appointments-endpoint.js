// ============================================================
// Manual test script for appointments endpoint
// Run with: node backend/routes/test-appointments-endpoint.js
// ============================================================

const supabase = require('../lib/supabase')

async function testAppointmentsEndpoint() {
  console.log('🧪 Testing appointments endpoint logic...\n')

  // Test 1: Search for a client by documento
  console.log('Test 1: Searching for client by documento...')
  const testDocumento = '123456789'
  
  const { data: cliente, error: clienteError } = await supabase
    .from('clientes')
    .select('id, nombre, documento')
    .eq('documento', testDocumento)
    .single()

  if (clienteError || !cliente) {
    console.log('❌ No client found for documento:', testDocumento)
    console.log('   This is expected if no test data exists.\n')
  } else {
    console.log('✅ Client found:', cliente)
    
    // Test 2: Fetch appointments for the client
    console.log('\nTest 2: Fetching appointments for client...')
    const { data: appointments, error: appointmentsError } = await supabase
      .from('citas')
      .select(`
        id,
        fecha,
        hora_inicio,
        hora_fin,
        estado,
        notas,
        duracion_total,
        servicios (
          nombre,
          descripcion,
          precio,
          duracion_min
        )
      `)
      .eq('cliente_id', cliente.id)
      .order('fecha', { ascending: false })
      .order('hora_inicio', { ascending: false })

    if (appointmentsError) {
      console.log('❌ Error fetching appointments:', appointmentsError)
    } else if (!appointments || appointments.length === 0) {
      console.log('⚠️  No appointments found for this client')
    } else {
      console.log('✅ Appointments found:', appointments.length)
      console.log('\nAppointment details:')
      appointments.forEach((apt, index) => {
        console.log(`\n  ${index + 1}. ${apt.servicios?.nombre || 'Unknown service'}`)
        console.log(`     Date: ${apt.fecha}`)
        console.log(`     Time: ${apt.hora_inicio} - ${apt.hora_fin}`)
        console.log(`     Status: ${apt.estado}`)
        if (apt.notas) console.log(`     Notes: ${apt.notas}`)
      })
    }
  }

  console.log('\n✅ Test completed!')
  console.log('\n💡 To test with real data:')
  console.log('   1. Add a "documento" field to a client in Supabase')
  console.log('   2. Create some appointments for that client')
  console.log('   3. Run this script again with that documento\n')
}

testAppointmentsEndpoint()
  .catch(err => {
    console.error('❌ Test failed:', err)
    process.exit(1)
  })
