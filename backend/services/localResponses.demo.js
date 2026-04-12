/**
 * Demo script for LocalResponseService
 * 
 * Run with: node backend/services/localResponses.demo.js
 */

const LocalResponseService = require('./localResponses.js');

const service = new LocalResponseService();

console.log('\n🌿 Serenità Spa - Local Response Service Demo\n');
console.log('='.repeat(60));

const testMessages = [
  '¿Cuál es el precio del masaje?',
  '¿A qué hora abren?',
  '¿Dónde están ubicados?',
  'Quiero hacer una reserva',
  '¿Qué servicios tienen?',
  'Hola, necesito información',
  '¿Cuánto cuesta un facial?',
  'Horarios de atención',
  'Dirección del spa',
  'Agendar una cita'
];

testMessages.forEach((message, index) => {
  console.log(`\n${index + 1}. Usuario: "${message}"`);
  const intent = service.recognizeIntent(message);
  const response = service.getResponse(message);
  console.log(`   Intent: ${intent}`);
  console.log(`   Bot: ${response}`);
  console.log('-'.repeat(60));
});

console.log('\n✅ Demo completed!\n');
