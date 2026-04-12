/**
 * Script de prueba para verificar la detección de intenciones
 * Ejecutar con: node test_intent_detection.js
 */

// Simular la clase ChatbotService
class ChatbotService {
  constructor() {
    this.intentPatterns = {
      greeting: /^(hola|buenos días|buenas tardes|buenas noches|hey|hi|saludos)/i,
      services: /ver servicios|servicios|tratamientos|que ofrecen|qué ofrecen|masajes|faciales|terapias/i,
      // IMPORTANTE: appointments debe ir ANTES de booking para que se detecte primero
      appointments: /consultar.*citas|mis citas|ver.*citas|citas agendadas|tengo cita/i,
      booking: /agendar.*cita|reservar|turno|disponibilidad|quiero agendar/i,
      schedule: /horario|hora|abierto|cerrado|atiende|cuando abren|cuándo abren/i,
      location: /ubicación|ubicacion|dirección|direccion|donde|dónde|queda|encuentro|como llego|cómo llego/i,
      pricing: /precio|costo|valor|cuanto|cuánto|tarifa|pagar/i,
      gift: /certificado|regalo|gift|tarjeta de regalo/i,
      help: /ayuda|help|menu|menú|opciones/i,
      thanks: /gracias|thank you|muchas gracias|te agradezco/i,
      bye: /adios|adiós|chao|hasta luego|nos vemos|bye/i,
    };
  }

  detectIntent(message) {
    const normalizedMessage = message.toLowerCase().trim();

    // IMPORTANTE: Verificar appointments ANTES que booking
    // porque "cita" puede coincidir con ambos
    const priorityIntents = ['appointments', 'booking'];
    
    for (const intent of priorityIntents) {
      if (this.intentPatterns[intent].test(normalizedMessage)) {
        return intent;
      }
    }

    // Verificar el resto de intenciones
    for (const [intent, pattern] of Object.entries(this.intentPatterns)) {
      if (priorityIntents.includes(intent)) continue; // Ya verificado
      if (pattern.test(normalizedMessage)) {
        return intent;
      }
    }

    return 'unknown';
  }
}

// Pruebas
const chatbot = new ChatbotService();

const testCases = [
  { message: 'Consultar mis citas', expected: 'appointments' },
  { message: 'consultar mis citas', expected: 'appointments' },
  { message: 'Ver mis citas', expected: 'appointments' },
  { message: 'Mis citas', expected: 'appointments' },
  { message: 'Agendar cita', expected: 'booking' },
  { message: 'Agendar una cita', expected: 'booking' },
  { message: 'Quiero agendar', expected: 'booking' },
  { message: 'Reservar', expected: 'booking' },
  { message: 'Ver servicios', expected: 'services' },
  { message: 'Horarios y ubicación', expected: 'schedule' },
];

console.log('🧪 Probando detección de intenciones...\n');

let passed = 0;
let failed = 0;

testCases.forEach(({ message, expected }) => {
  const detected = chatbot.detectIntent(message);
  const status = detected === expected ? '✅' : '❌';
  
  if (detected === expected) {
    passed++;
  } else {
    failed++;
  }
  
  console.log(`${status} "${message}"`);
  console.log(`   Esperado: ${expected}, Detectado: ${detected}`);
  console.log('');
});

console.log('━'.repeat(50));
console.log(`Resultados: ${passed} pasaron, ${failed} fallaron`);
console.log('━'.repeat(50));

if (failed === 0) {
  console.log('🎉 ¡Todas las pruebas pasaron!');
  process.exit(0);
} else {
  console.log('⚠️  Algunas pruebas fallaron');
  process.exit(1);
}
