/**
 * Local Response Service
 * 
 * Provides fallback responses when N8N is unavailable.
 * Recognizes common keywords and returns contextual responses in Spanish.
 * 
 * Requirements: 10.5, 10.7, 15.2
 */

class LocalResponseService {
  constructor() {
    // Define keyword patterns and their associated intents
    this.intentPatterns = {
      pricing: /precio|costo|valor|cuanto|cuánto|tarifa|pagar/i,
      schedule: /horario|hora|abierto|cerrado|atiende|disponible/i,
      location: /ubicación|ubicacion|dirección|direccion|donde|dónde|queda|encuentro|ubicados/i,
      booking: /reserva|cita|agendar|turno|disponibilidad/i,
      service_inquiry: /servicio|tratamiento|masaje|facial|terapia|spa/i
    };

    // Define responses for each intent
    this.responses = {
      service_inquiry: [
        '¡Tenemos una variedad de servicios maravillosos! 🌿 Puedes ver todos nuestros tratamientos escribiendo "Ver servicios" o visitando nuestra página de servicios. ¿Te gustaría que te muestre las opciones disponibles?',
        'En Serenità Spa ofrecemos masajes relajantes, faciales rejuvenecedores, tratamientos corporales y mucho más. ¿Quieres que te muestre nuestro catálogo completo de servicios?'
      ],
      pricing: [
        'Los precios de nuestros servicios varían según el tratamiento. Te invito a escribir "Ver servicios" para conocer todos los detalles, incluyendo precios y duración de cada servicio. 💆‍♀️',
        'Cada uno de nuestros tratamientos tiene un precio especial. ¿Te gustaría que te muestre nuestro menú de servicios con todos los precios?'
      ],
      schedule: [
        '¡Estamos aquí para ti! 🕐 Nuestro horario de atención es de lunes a sábado de 9:00 AM a 7:00 PM. Los domingos abrimos de 10:00 AM a 5:00 PM. ¿Te gustaría agendar una cita?',
        'Atendemos de lunes a sábado de 9:00 AM a 7:00 PM, y domingos de 10:00 AM a 5:00 PM. ¿En qué horario te gustaría visitarnos?'
      ],
      location: [
        '📍 Nos encontramos en el corazón de la ciudad, listos para recibirte. Para obtener nuestra dirección exacta y detalles de contacto, escribe "Horarios y ubicación". ¡Te esperamos!',
        'Estamos ubicados en una zona tranquila y accesible. Escribe "Horarios y ubicación" para ver nuestra dirección completa y cómo llegar. 🗺️'
      ],
      booking: [
        '¡Me encantaría ayudarte a reservar! 📅 Puedes hacer tu reserva escribiendo "Reservar" y te guiaré al sistema de reservas donde podrás elegir el servicio, fecha y hora que prefieras.',
        '¿Listo para una experiencia de relajación? Escribe "Reservar" y te llevaré a nuestro sistema de reservas donde podrás agendar tu cita fácilmente. ✨'
      ],
      unknown: [
        'Entiendo tu consulta. Para ayudarte mejor, puedo mostrarte nuestros servicios, horarios, o ayudarte a hacer una reserva. ¿Qué te gustaría hacer? 😊',
        'Estoy aquí para ayudarte. Puedo mostrarte información sobre nuestros servicios, horarios de atención, o ayudarte a agendar una cita. ¿Qué necesitas?',
        'Gracias por tu mensaje. ¿Te gustaría ver nuestros servicios, conocer nuestros horarios, o hacer una reserva? Estoy aquí para asistirte. 🌿'
      ]
    };
  }

  /**
   * Recognize the intent from a user message
   * @param {string} message - User's message text
   * @returns {string} Recognized intent key
   */
  recognizeIntent(message) {
    if (!message || typeof message !== 'string') {
      return 'unknown';
    }

    const normalizedMessage = message.toLowerCase().trim();

    // Check each intent pattern
    for (const [intent, pattern] of Object.entries(this.intentPatterns)) {
      if (pattern.test(normalizedMessage)) {
        return intent;
      }
    }

    return 'unknown';
  }

  /**
   * Get a response for a user message
   * @param {string} message - User's message text
   * @returns {string} Contextual response in Spanish
   */
  getResponse(message) {
    const intent = this.recognizeIntent(message);
    const possibleResponses = this.responses[intent] || this.responses.unknown;
    
    // Return a random response from the available options for variety
    const randomIndex = Math.floor(Math.random() * possibleResponses.length);
    return possibleResponses[randomIndex];
  }
}

module.exports = LocalResponseService;
