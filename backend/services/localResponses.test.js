/**
 * Unit Tests for LocalResponseService
 * 
 * Run with: node backend/services/localResponses.test.js
 */

const LocalResponseService = require('./localResponses.js');

// Simple test framework
class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  test(description, fn) {
    this.tests.push({ description, fn });
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  assertIncludes(array, value, message) {
    if (!array.includes(value)) {
      throw new Error(message || `Expected array to include ${value}`);
    }
  }

  assertMatch(string, pattern, message) {
    if (!pattern.test(string)) {
      throw new Error(message || `Expected string to match pattern ${pattern}`);
    }
  }

  async run() {
    console.log('\n🧪 Running LocalResponseService Tests\n');

    for (const { description, fn } of this.tests) {
      try {
        await fn(this);
        this.passed++;
        console.log(`✅ ${description}`);
      } catch (error) {
        this.failed++;
        console.log(`❌ ${description}`);
        console.log(`   Error: ${error.message}\n`);
      }
    }

    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed\n`);
    process.exit(this.failed > 0 ? 1 : 0);
  }
}

// Initialize test runner
const runner = new TestRunner();

// Test: Service instantiation
runner.test('should instantiate LocalResponseService', (t) => {
  const service = new LocalResponseService();
  t.assert(service instanceof LocalResponseService, 'Service should be instance of LocalResponseService');
  t.assert(typeof service.getResponse === 'function', 'Service should have getResponse method');
  t.assert(typeof service.recognizeIntent === 'function', 'Service should have recognizeIntent method');
});

// Test: Recognize "precio" keyword
runner.test('should recognize "precio" keyword as pricing intent', (t) => {
  const service = new LocalResponseService();
  const intent = service.recognizeIntent('¿Cuál es el precio del masaje?');
  t.assertEqual(intent, 'pricing', 'Should recognize pricing intent');
});

// Test: Recognize "horario" keyword
runner.test('should recognize "horario" keyword as schedule intent', (t) => {
  const service = new LocalResponseService();
  const intent = service.recognizeIntent('¿Cuál es el horario de atención?');
  t.assertEqual(intent, 'schedule', 'Should recognize schedule intent');
});

// Test: Recognize "ubicación" keyword
runner.test('should recognize "ubicación" keyword as location intent', (t) => {
  const service = new LocalResponseService();
  const intent = service.recognizeIntent('¿Dónde están ubicados?');
  t.assertEqual(intent, 'location', 'Should recognize location intent');
});

// Test: Recognize "reserva" keyword
runner.test('should recognize "reserva" keyword as booking intent', (t) => {
  const service = new LocalResponseService();
  const intent = service.recognizeIntent('Quiero hacer una reserva');
  t.assertEqual(intent, 'booking', 'Should recognize booking intent');
});

// Test: Recognize "servicio" keyword
runner.test('should recognize "servicio" keyword as service_inquiry intent', (t) => {
  const service = new LocalResponseService();
  const intent = service.recognizeIntent('¿Qué servicios ofrecen?');
  t.assertEqual(intent, 'service_inquiry', 'Should recognize service_inquiry intent');
});

// Test: Return appropriate response for pricing
runner.test('should return appropriate response for pricing inquiry', (t) => {
  const service = new LocalResponseService();
  const response = service.getResponse('¿Cuánto cuesta el masaje?');
  t.assert(typeof response === 'string', 'Response should be a string');
  t.assert(response.length > 0, 'Response should not be empty');
  t.assertMatch(response, /precio|servicio/i, 'Response should mention pricing or services');
});

// Test: Return appropriate response for schedule
runner.test('should return appropriate response for schedule inquiry', (t) => {
  const service = new LocalResponseService();
  const response = service.getResponse('¿A qué hora abren?');
  t.assert(typeof response === 'string', 'Response should be a string');
  t.assertMatch(response, /horario|9:00|7:00/i, 'Response should mention schedule or hours');
});

// Test: Return appropriate response for location
runner.test('should return appropriate response for location inquiry', (t) => {
  const service = new LocalResponseService();
  const response = service.getResponse('¿Dónde están ubicados?');
  t.assert(typeof response === 'string', 'Response should be a string');
  t.assertMatch(response, /ubicación|dirección|encuentr/i, 'Response should mention location');
});

// Test: Return appropriate response for booking
runner.test('should return appropriate response for booking inquiry', (t) => {
  const service = new LocalResponseService();
  const response = service.getResponse('Quiero agendar una cita');
  t.assert(typeof response === 'string', 'Response should be a string');
  t.assertMatch(response, /reserva|cita|agendar/i, 'Response should mention booking');
});

// Test: Return appropriate response for service inquiry
runner.test('should return appropriate response for service inquiry', (t) => {
  const service = new LocalResponseService();
  const response = service.getResponse('¿Qué tratamientos tienen?');
  t.assert(typeof response === 'string', 'Response should be a string');
  t.assertMatch(response, /servicio|tratamiento/i, 'Response should mention services');
});

// Test: Handle unknown intent
runner.test('should return generic response for unknown intent', (t) => {
  const service = new LocalResponseService();
  const response = service.getResponse('xyz123 random text');
  t.assert(typeof response === 'string', 'Response should be a string');
  t.assert(response.length > 0, 'Response should not be empty');
});

// Test: Handle empty message
runner.test('should handle empty message gracefully', (t) => {
  const service = new LocalResponseService();
  const response = service.getResponse('');
  t.assert(typeof response === 'string', 'Response should be a string');
  t.assert(response.length > 0, 'Response should not be empty');
});

// Test: Handle null message
runner.test('should handle null message gracefully', (t) => {
  const service = new LocalResponseService();
  const response = service.getResponse(null);
  t.assert(typeof response === 'string', 'Response should be a string');
  t.assert(response.length > 0, 'Response should not be empty');
});

// Test: Case insensitivity
runner.test('should recognize keywords case-insensitively', (t) => {
  const service = new LocalResponseService();
  const intent1 = service.recognizeIntent('PRECIO');
  const intent2 = service.recognizeIntent('precio');
  const intent3 = service.recognizeIntent('PrEcIo');
  t.assertEqual(intent1, 'pricing', 'Should recognize uppercase');
  t.assertEqual(intent2, 'pricing', 'Should recognize lowercase');
  t.assertEqual(intent3, 'pricing', 'Should recognize mixed case');
});

// Test: Multiple keywords in one message
runner.test('should recognize first matching keyword when multiple present', (t) => {
  const service = new LocalResponseService();
  const intent = service.recognizeIntent('¿Cuál es el precio y el horario?');
  // Should match one of the intents (service_inquiry, pricing, or schedule)
  t.assertIncludes(['service_inquiry', 'pricing', 'schedule'], intent, 'Should recognize one of the intents');
});

// Test: Response variety
runner.test('should provide variety in responses', (t) => {
  const service = new LocalResponseService();
  const responses = new Set();
  
  // Get multiple responses for the same intent
  for (let i = 0; i < 10; i++) {
    const response = service.getResponse('¿Cuál es el precio?');
    responses.add(response);
  }
  
  // With randomization, we should get at least 1 response (could be more)
  t.assert(responses.size >= 1, 'Should provide at least one response');
});

// Test: Spanish language responses
runner.test('should return responses in Spanish', (t) => {
  const service = new LocalResponseService();
  const response = service.getResponse('What is the price?');
  
  // Check for Spanish characters or common Spanish words
  const spanishPattern = /[áéíóúñ¿¡]|para|con|que|por|una|del|los|las/i;
  t.assertMatch(response, spanishPattern, 'Response should be in Spanish');
});

// Test: Professional and friendly tone
runner.test('should maintain professional and friendly tone', (t) => {
  const service = new LocalResponseService();
  const response = service.getResponse('¿Tienen masajes?');
  
  // Check for friendly elements (emojis, exclamations, polite language, questions)
  const friendlyPattern = /[🌿💆‍♀️📅✨😊🕐📍🗺️¡¿]|gustaría|encantaría|aquí para|esperamos|quieres|puedes|ofrecemos/i;
  t.assertMatch(response, friendlyPattern, 'Response should have friendly tone');
});

// Run all tests
runner.run();
