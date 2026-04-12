/**
 * Chatbot Service - Sistema de chat inteligente sin N8N
 * 
 * Maneja conversaciones completas con el usuario usando:
 * - Reconocimiento de intenciones
 * - Gestión de contexto conversacional
 * - Consultas directas a Supabase
 * - Flujos conversacionales estructurados
 */

const supabase = require('../lib/supabase');

class ChatbotService {
  constructor() {
    // Patrones de intención mejorados
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

    // Estados conversacionales
    this.conversationStates = {
      INITIAL: 'initial',
      AWAITING_NAME: 'awaiting_name',
      MAIN_MENU: 'main_menu',
      VIEWING_SERVICES: 'viewing_services',
      BOOKING_SERVICE: 'booking_service',
      CHECKING_APPOINTMENTS: 'checking_appointments',
      AWAITING_DOCUMENT: 'awaiting_document',
      AWAITING_APPOINTMENT_NAME: 'awaiting_appointment_name',
      AWAITING_APPOINTMENT_EMAIL: 'awaiting_appointment_email',
      MANAGING_APPOINTMENTS: 'managing_appointments',
      AWAITING_CANCEL_CONFIRMATION: 'awaiting_cancel_confirmation',
      AWAITING_RESCHEDULE_DATE: 'awaiting_reschedule_date',
      CHOOSING_RESCHEDULE_PERIOD: 'choosing_reschedule_period',
      CHOOSING_RESCHEDULE_DAY: 'choosing_reschedule_day',
      CHOOSING_RESCHEDULE_TIME: 'choosing_reschedule_time',
    };
  }

  /**
   * Procesa un mensaje del usuario y retorna la respuesta apropiada
   */
  async processMessage(sessionId, userName, message, currentState = 'initial', context = {}) {
    try {
      // Normalizar mensaje
      const normalizedMessage = message.trim();

      // Detectar intención
      const intent = this.detectIntent(normalizedMessage);

      // Procesar según el estado actual
      switch (currentState) {
        case this.conversationStates.INITIAL:
          return this.handleInitialState(userName);

        case this.conversationStates.AWAITING_NAME:
          return this.handleNameProvided(normalizedMessage);

        case this.conversationStates.MAIN_MENU:
          return await this.handleMainMenu(intent, normalizedMessage, context);

        case this.conversationStates.VIEWING_SERVICES:
          return await this.handleServicesView(intent, normalizedMessage);

        case this.conversationStates.AWAITING_DOCUMENT:
          return await this.handleDocumentProvided(normalizedMessage);

        case this.conversationStates.AWAITING_APPOINTMENT_NAME:
          return this.handleAppointmentNameProvided(normalizedMessage, context);

        case this.conversationStates.AWAITING_APPOINTMENT_EMAIL:
          return await this.handleAppointmentEmailProvided(normalizedMessage, context);

        case this.conversationStates.MANAGING_APPOINTMENTS:
          return await this.handleManagingAppointments(intent, normalizedMessage, context);

        case this.conversationStates.AWAITING_CANCEL_CONFIRMATION:
          return await this.handleCancelConfirmation(normalizedMessage, context);

        case this.conversationStates.AWAITING_RESCHEDULE_DATE:
          return await this.handleRescheduleDate(normalizedMessage, context);

        case this.conversationStates.CHOOSING_RESCHEDULE_PERIOD:
          return await this.handleReschedulePeriodChoice(normalizedMessage, context);

        case this.conversationStates.CHOOSING_RESCHEDULE_DAY:
          return await this.handleRescheduleDayChoice(normalizedMessage, context);

        case this.conversationStates.CHOOSING_RESCHEDULE_TIME:
          return await this.handleRescheduleTimeChoice(normalizedMessage, context);

        default:
          return await this.handleMainMenu(intent, normalizedMessage, context);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        response: 'Lo siento, tuve un problema procesando tu mensaje. ¿Podrías intentar de nuevo?',
        nextState: currentState,
        showMenu: false
      };
    }
  }

  /**
   * Detecta la intención del mensaje
   */
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

  /**
   * Maneja el estado inicial (bienvenida)
   */
  handleInitialState(userName) {
    if (userName) {
      return {
        response: `¡Hola ${userName}! Bienvenido a Serenità Spa 🌿`,
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: true
      };
    }

    return {
      response: '¡Hola! Bienvenido a Serenità Spa 🌿\n\n¿Cómo te llamas?',
      nextState: this.conversationStates.AWAITING_NAME,
      showMenu: false
    };
  }

  /**
   * Maneja cuando el usuario proporciona su nombre
   */
  async handleNameProvided(name) {
    // Guardar el nombre para usarlo después
    return {
      response: `¡Encantado de conocerte, ${name}! 😊`,
      nextState: this.conversationStates.MAIN_MENU,
      showMenu: true,
      userName: name
    };
  }

  /**
   * Maneja el menú principal
   */
  async handleMainMenu(intent, message, context) {
    switch (intent) {
      case 'greeting':
        return {
          response: '¡Hola! ¿En qué puedo ayudarte hoy? 😊',
          nextState: this.conversationStates.MAIN_MENU,
          showMenu: true
        };

      case 'services':
        return await this.showServices();

      case 'booking':
        return {
          response: 'Para agendar una cita, te invito a usar nuestro sistema de reservas en línea.\n\n👉 Puedes acceder desde el menú principal o escribiendo "reservar".',
          nextState: this.conversationStates.MAIN_MENU,
          showMenu: true,
          action: 'redirect_booking'
        };

      case 'appointments':
        // Pedir nombre para consultar citas
        return {
          response: 'Para consultar tus citas, necesito algunos datos.\n\n¿Cuál es tu nombre completo?',
          nextState: this.conversationStates.AWAITING_APPOINTMENT_NAME,
          showMenu: false
        };

      case 'schedule':
        return this.showSchedule();

      case 'location':
        return this.showLocation();

      case 'pricing':
        return await this.showServices();

      case 'gift':
        return this.showGiftInfo();

      case 'help':
        return {
          response: '¿En qué puedo ayudarte hoy?',
          nextState: this.conversationStates.MAIN_MENU,
          showMenu: true
        };

      case 'thanks':
        return {
          response: '¡De nada! Estoy aquí para ayudarte. ¿Hay algo más en lo que pueda asistirte? 😊',
          nextState: this.conversationStates.MAIN_MENU,
          showMenu: true
        };

      case 'bye':
        return {
          response: '¡Hasta pronto! Esperamos verte pronto en Serenità Spa. 🌿✨',
          nextState: this.conversationStates.MAIN_MENU,
          showMenu: false
        };

      default:
        return {
          response: 'No estoy seguro de entender. ¿Podrías elegir una de las opciones del menú?',
          nextState: this.conversationStates.MAIN_MENU,
          showMenu: true
        };
    }
  }

  /**
   * Muestra los servicios disponibles desde Supabase
   */
  async showServices() {
    try {
      const { data: services, error } = await supabase
        .from('servicios')
        .select('id, nombre, descripcion, precio, duracion_min')
        .eq('activo', true)
        .order('precio', { ascending: true })
        .limit(6);

      if (error) throw error;

      if (!services || services.length === 0) {
        return {
          response: 'Lo siento, no pude cargar los servicios en este momento. Por favor intenta más tarde.',
          nextState: this.conversationStates.MAIN_MENU,
          showMenu: true
        };
      }

      let response = '✨ Estos son nuestros servicios más populares:\n\n';
      
      services.forEach((service, index) => {
        const price = service.precio ? `$${service.precio.toLocaleString('es-CO')}` : 'Consultar';
        response += `${index + 1}. **${service.nombre}**\n`;
        response += `   ⏱️ ${service.duracion_min} min | 💰 ${price}\n`;
        if (service.descripcion) {
          response += `   ${service.descripcion.substring(0, 80)}...\n`;
        }
        response += '\n';
      });

      response += '¿Te gustaría agendar alguno de estos servicios?';

      return {
        response,
        nextState: this.conversationStates.VIEWING_SERVICES,
        showMenu: true,
        data: { services }
      };
    } catch (error) {
      console.error('Error fetching services:', error);
      return {
        response: 'Hubo un error al cargar los servicios. Por favor intenta de nuevo.',
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: true
      };
    }
  }

  /**
   * Muestra horarios de atención
   */
  showSchedule() {
    return {
      response: '🕐 **Nuestros horarios de atención:**\n\n' +
                '📅 Lunes a Sábado: 9:00 AM - 7:00 PM\n' +
                '📅 Domingos: 10:00 AM - 5:00 PM\n\n' +
                '¿Te gustaría agendar una cita?',
      nextState: this.conversationStates.MAIN_MENU,
      showMenu: true
    };
  }

  /**
   * Muestra ubicación
   */
  showLocation() {
    return {
      response: '📍 **Nuestra ubicación:**\n\n' +
                'Carrera 1 # 2-3\n' +
                'Riohacha, La Guajira\n' +
                'Colombia\n\n' +
                '📞 Teléfono: +57 300 123 4567\n\n' +
                '¿Necesitas ayuda con algo más?',
      nextState: this.conversationStates.MAIN_MENU,
      showMenu: true
    };
  }

  /**
   * Muestra información de certificados de regalo
   */
  showGiftInfo() {
    return {
      response: '🎁 **Certificados de Regalo**\n\n' +
                '¡El regalo perfecto para alguien especial!\n\n' +
                'Puedes regalar cualquiera de nuestros servicios. ' +
                'Para más información sobre certificados de regalo, ' +
                'contáctanos al +57 300 123 4567.\n\n' +
                '¿Te gustaría ver nuestros servicios?',
      nextState: this.conversationStates.MAIN_MENU,
      showMenu: true
    };
  }

  /**
   * Maneja cuando el usuario proporciona su nombre para consultar citas
   */
  handleAppointmentNameProvided(name, context) {
    return {
      response: `Perfecto, ${name}. Ahora necesito tu correo electrónico para buscar tus citas:`,
      nextState: this.conversationStates.AWAITING_APPOINTMENT_EMAIL,
      showMenu: false,
      tempName: name
    };
  }

  /**
   * Maneja cuando el usuario proporciona su email para consultar citas
   */
  async handleAppointmentEmailProvided(email, context) {
    const tempName = context.tempName;
    
    if (!tempName) {
      return {
        response: 'Hubo un error. Por favor intenta de nuevo desde el menú principal.',
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: true
      };
    }

    // Normalizar email
    const emailNormalizado = email.toLowerCase().trim();

    // Buscar por nombre Y email
    return await this.checkAppointmentsByNameAndEmail(tempName, emailNormalizado);
  }

  /**
   * Busca citas por nombre Y email del cliente
   */
  async checkAppointmentsByNameAndEmail(userName, userEmail) {
    try {
      if (!userName || userName.trim().length < 2) {
        return {
          response: 'Para consultar tus citas, necesito saber tu nombre completo.',
          nextState: this.conversationStates.MAIN_MENU,
          showMenu: true
        };
      }

      // Buscar cliente por nombre Y email
      const { data: clientes, error: clienteError } = await supabase
        .from('clientes')
        .select('id, nombre, email, telefono')
        .or(`nombre.ilike.%${userName.trim()}%,email.eq.${userEmail}`)
        .limit(5);

      if (clienteError) {
        console.error('Error buscando cliente:', clienteError);
        throw clienteError;
      }

      if (!clientes || clientes.length === 0) {
        return {
          response: `Hola ${userName}! 👋\n\n` +
                    'No encontré tu perfil en nuestro sistema.\n\n' +
                    '¿Te gustaría agendar tu primera cita con nosotros?',
          nextState: this.conversationStates.MAIN_MENU,
          showMenu: true,
          action: 'suggest_booking'
        };
      }

      // Si hay múltiples clientes con nombres similares, usar el primero
      const cliente = clientes[0];

      // Buscar citas del cliente (todas las citas, no solo futuras)
      const { data: citas, error: citasError } = await supabase
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
            duracion_min,
            buffer_min,
            precio
          )
        `)
        .eq('cliente_id', cliente.id)
        .order('fecha', { ascending: false })
        .order('hora_inicio', { ascending: false })
        .limit(10);

      if (citasError) {
        console.error('Error buscando citas:', citasError);
        throw citasError;
      }

      // Separar citas futuras y pasadas
      const hoy = new Date().toISOString().split('T')[0];
      const citasFuturas = citas?.filter(c => c.fecha >= hoy) || [];
      const citasPasadas = citas?.filter(c => c.fecha < hoy) || [];

      if (!citas || citas.length === 0) {
        return {
          response: `Hola ${cliente.nombre}! 👋\n\n` +
                    'No tienes citas registradas en nuestro sistema.\n\n' +
                    '¿Te gustaría agendar una cita?',
          nextState: this.conversationStates.MAIN_MENU,
          showMenu: true,
          action: 'suggest_booking'
        };
      }

      // Formatear respuesta
      let response = `Hola ${cliente.nombre}! 👋\n\n`;

      // Mostrar citas futuras
      if (citasFuturas.length > 0) {
        response += `📅 **Tus citas próximas:**\n\n`;
        
        citasFuturas.forEach((cita, index) => {
          const fecha = new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          const estadoEmoji = {
            'confirmada': '✅',
            'pendiente': '⏳',
            'cancelada': '❌',
            'completada': '✔️'
          }[cita.estado] || '📅';

          response += `${index + 1}. ${estadoEmoji} **${cita.servicios?.nombre || 'Servicio'}**\n`;
          response += `   📅 ${fecha}\n`;
          response += `   🕐 ${cita.hora_inicio} - ${cita.hora_fin}\n`;
          response += `   Estado: ${cita.estado}\n`;
          if (cita.notas) {
            response += `   📝 ${cita.notas}\n`;
          }
          response += '\n';
        });
        
        response += '¿Necesitas modificar alguna de estas citas? Puedo ayudarte a:\n';
        response += '• Cancelar una cita\n';
        response += '• Cambiar la fecha de una cita\n\n';
        response += 'O si todo está bien, ¡nos vemos pronto! 💜';

        return {
          response,
          nextState: this.conversationStates.MANAGING_APPOINTMENTS,
          showMenu: false,
          data: { citas: citasFuturas, cliente },
          quickReplies: ['Cancelar cita', 'Cambiar fecha', 'Todo está bien']
        };
      } else if (citasPasadas.length > 0) {
        response += 'No tienes citas próximas agendadas.\n\n';
        response += `Pero veo que has visitado nuestro spa antes. ¡Gracias por tu confianza! 💜\n\n`;
        response += '¿Te gustaría agendar una nueva cita?';
        
        return {
          response,
          nextState: this.conversationStates.MAIN_MENU,
          showMenu: false,
          action: 'suggest_booking',
          quickReplies: ['Sí, agendar', 'No, gracias']
        };
      }

    } catch (error) {
      console.error('Error fetching appointments:', error);
      return {
        response: 'Hubo un error al consultar tus citas. Por favor intenta de nuevo más tarde.',
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: true
      };
    }
  }

  /**
   * Maneja cuando el usuario proporciona su documento
   */
  async handleDocumentProvided(documento) {
    try {
      // Limpiar el documento (remover espacios y caracteres especiales)
      const cleanDoc = documento.replace(/[^0-9]/g, '');

      if (!cleanDoc || cleanDoc.length < 5) {
        return {
          response: 'Por favor ingresa un número de documento válido (mínimo 5 dígitos):',
          nextState: this.conversationStates.AWAITING_DOCUMENT,
          showMenu: false
        };
      }

      // Buscar cliente por documento
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('id, nombre, email')
        .eq('documento', cleanDoc)
        .single();

      if (clienteError || !cliente) {
        return {
          response: `No encontré citas asociadas al documento ${cleanDoc}.\n\n` +
                    'Si aún no tienes citas con nosotros, ¿te gustaría agendar una?',
          nextState: this.conversationStates.MAIN_MENU,
          showMenu: true
        };
      }

      // Buscar citas del cliente
      const { data: citas, error: citasError } = await supabase
        .from('citas')
        .select(`
          id,
          fecha,
          hora_inicio,
          hora_fin,
          estado,
          notas,
          servicios (
            nombre,
            duracion_min,
            precio
          )
        `)
        .eq('cliente_id', cliente.id)
        .gte('fecha', new Date().toISOString().split('T')[0])
        .order('fecha', { ascending: true })
        .order('hora_inicio', { ascending: true });

      if (citasError) throw citasError;

      if (!citas || citas.length === 0) {
        return {
          response: `Hola ${cliente.nombre}! 👋\n\n` +
                    'No tienes citas próximas agendadas.\n\n' +
                    '¿Te gustaría agendar una nueva cita?',
          nextState: this.conversationStates.MAIN_MENU,
          showMenu: true
        };
      }

      // Formatear citas
      let response = `Hola ${cliente.nombre}! 👋\n\n`;
      response += `Estas son tus citas próximas:\n\n`;

      citas.forEach((cita, index) => {
        const fecha = new Date(cita.fecha + 'T12:00:00').toLocaleDateString('es-CO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const estadoEmoji = {
          'confirmada': '✅',
          'pendiente': '⏳',
          'cancelada': '❌',
          'completada': '✔️'
        }[cita.estado] || '📅';

        response += `${index + 1}. ${estadoEmoji} **${cita.servicios?.nombre || 'Servicio'}**\n`;
        response += `   📅 ${fecha}\n`;
        response += `   🕐 ${cita.hora_inicio} - ${cita.hora_fin}\n`;
        response += `   Estado: ${cita.estado}\n`;
        if (cita.notas) {
          response += `   📝 ${cita.notas}\n`;
        }
        response += '\n';
      });

      response += '¿Necesitas ayuda con algo más?';

      return {
        response,
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: true,
        data: { citas }
      };

    } catch (error) {
      console.error('Error fetching appointments:', error);
      return {
        response: 'Hubo un error al consultar tus citas. Por favor intenta de nuevo más tarde.',
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: true
      };
    }
  }

  /**
   * Maneja la gestión de citas (cancelar o cambiar fecha)
   */
  async handleManagingAppointments(intent, message, context) {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Detectar intención
    if (normalizedMessage.includes('cancelar')) {
      return {
        response: '¿Cuál cita deseas cancelar? Por favor escribe el número de la cita (1, 2, 3...)',
        nextState: this.conversationStates.AWAITING_CANCEL_CONFIRMATION,
        showMenu: false
      };
    } else if (normalizedMessage.includes('cambiar') || normalizedMessage.includes('fecha')) {
      return {
        response: '¿Cuál cita deseas cambiar de fecha? Por favor escribe el número de la cita (1, 2, 3...)',
        nextState: this.conversationStates.AWAITING_RESCHEDULE_DATE,
        showMenu: false
      };
    } else if (normalizedMessage.includes('todo está bien') || normalizedMessage.includes('no')) {
      return {
        response: '¡Perfecto! Nos vemos pronto en tu cita. 💜\n\n' +
                  'Recuerda que puedes contactarnos si necesitas algo:\n' +
                  '📞 +57 300 123 4567\n\n' +
                  '¡Que tengas un día maravilloso! ✨🌿',
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: false,
        quickReplies: ['Volver al menú', 'Salir']
      };
    } else {
      return {
        response: 'No estoy seguro de entender. ¿Quieres cancelar una cita, cambiar la fecha, o todo está bien?',
        nextState: this.conversationStates.MANAGING_APPOINTMENTS,
        showMenu: false,
        quickReplies: ['Cancelar cita', 'Cambiar fecha', 'Todo está bien']
      };
    }
  }

  /**
   * Maneja la confirmación de cancelación de cita
   */
  async handleCancelConfirmation(message, context) {
    const citaNumero = parseInt(message.trim());
    
    if (isNaN(citaNumero) || citaNumero < 1) {
      return {
        response: 'Por favor escribe un número válido de cita (1, 2, 3...)',
        nextState: this.conversationStates.AWAITING_CANCEL_CONFIRMATION,
        showMenu: false
      };
    }

    // Obtener las citas del contexto (deberían estar guardadas)
    const citas = context.citas || [];
    const citaIndex = citaNumero - 1;
    
    if (citaIndex >= citas.length) {
      return {
        response: `No tienes una cita con el número ${citaNumero}. Por favor elige un número válido.`,
        nextState: this.conversationStates.AWAITING_CANCEL_CONFIRMATION,
        showMenu: false
      };
    }

    const cita = citas[citaIndex];
    
    // Verificar que la cita sea con al menos 24 horas de anticipación
    const fechaCita = new Date(cita.fecha + 'T' + cita.hora_inicio);
    const ahora = new Date();
    const horasAnticipacion = (fechaCita - ahora) / (1000 * 60 * 60);
    
    if (horasAnticipacion < 24) {
      return {
        response: '⚠️ Lo siento, las cancelaciones deben hacerse con al menos 24 horas de anticipación.\n\n' +
                  'Por favor contáctanos directamente:\n' +
                  '📞 +57 300 123 4567\n\n' +
                  '¿Hay algo más en lo que pueda ayudarte?',
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: false,
        quickReplies: ['Volver al menú', 'Salir']
      };
    }

    // Cancelar la cita
    try {
      const { error } = await supabase
        .from('citas')
        .update({ estado: 'cancelada' })
        .eq('id', cita.id);

      if (error) throw error;

      const fechaFormateada = new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });

      return {
        response: `✅ Tu cita de **${cita.servicios?.nombre}** para el ${fechaFormateada} a las ${cita.hora_inicio} ha sido cancelada exitosamente.\n\n` +
                  'Esperamos verte pronto en Serenità Spa. 💜\n\n' +
                  '¿Hay algo más en lo que pueda ayudarte?',
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: false,
        quickReplies: ['Agendar nueva cita', 'Volver al menú', 'Salir']
      };
    } catch (error) {
      console.error('Error cancelando cita:', error);
      return {
        response: 'Hubo un error al cancelar tu cita. Por favor contáctanos directamente:\n' +
                  '📞 +57 300 123 4567',
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: true
      };
    }
  }

  /**
   * Maneja el cambio de fecha de una cita
   */
  async handleRescheduleDate(message, context) {
    const citaNumero = parseInt(message.trim());
    
    if (isNaN(citaNumero) || citaNumero < 1) {
      return {
        response: 'Por favor escribe un número válido de cita (1, 2, 3...)',
        nextState: this.conversationStates.AWAITING_RESCHEDULE_DATE,
        showMenu: false
      };
    }

    // Obtener las citas del contexto
    const citas = context.citas || [];
    const citaIndex = citaNumero - 1;
    
    if (citaIndex >= citas.length) {
      return {
        response: `No tienes una cita con el número ${citaNumero}. Por favor elige un número válido.`,
        nextState: this.conversationStates.AWAITING_RESCHEDULE_DATE,
        showMenu: false
      };
    }

    const cita = citas[citaIndex];
    
    // Verificar que la cita sea con al menos 24 horas de anticipación
    const fechaCita = new Date(cita.fecha + 'T' + cita.hora_inicio);
    const ahora = new Date();
    const horasAnticipacion = (fechaCita - ahora) / (1000 * 60 * 60);
    
    if (horasAnticipacion < 24) {
      return {
        response: '⚠️ Lo siento, los cambios de fecha deben hacerse con al menos 24 horas de anticipación.\n\n' +
                  'Por favor contáctanos directamente:\n' +
                  '📞 +57 300 123 4567\n\n' +
                  '¿Hay algo más en lo que pueda ayudarte?',
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: false,
        quickReplies: ['Volver al menú', 'Salir']
      };
    }

    const fechaFormateada = new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    // Guardar la cita seleccionada en el contexto
    return {
      response: `Perfecto! Vamos a cambiar la fecha de tu cita de **${cita.servicios?.nombre}**\n\n` +
                `📅 Fecha actual: ${fechaFormateada} a las ${cita.hora_inicio}\n\n` +
                `¿Cuándo te gustaría reagendar?`,
      nextState: this.conversationStates.CHOOSING_RESCHEDULE_PERIOD,
      showMenu: false,
      selectedCita: cita,
      quickReplies: ['Esta semana', 'Este mes', 'Otro mes']
    };
  }

  /**
   * Maneja la elección del período para reagendar
   */
  async handleReschedulePeriodChoice(message, context) {
    const normalizedMessage = message.toLowerCase().trim();
    const cita = context.selectedCita;

    if (!cita) {
      return {
        response: 'Hubo un error. Por favor intenta de nuevo desde el menú principal.',
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: true
      };
    }

    let fechaInicio, fechaFin, periodoTexto;

    if (normalizedMessage.includes('esta semana')) {
      // Esta semana (próximos 7 días)
      fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() + 1); // Mañana
      fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + 7);
      periodoTexto = 'esta semana';
    } else if (normalizedMessage.includes('este mes')) {
      // Este mes
      fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() + 1);
      fechaFin = new Date();
      fechaFin.setMonth(fechaFin.getMonth() + 1);
      periodoTexto = 'este mes';
    } else if (normalizedMessage.includes('otro mes')) {
      // Próximo mes
      fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() + 1);
      fechaInicio.setDate(1);
      fechaFin = new Date(fechaInicio);
      fechaFin.setMonth(fechaFin.getMonth() + 1);
      periodoTexto = 'el próximo mes';
    } else {
      return {
        response: 'Por favor elige una de las opciones disponibles.',
        nextState: this.conversationStates.CHOOSING_RESCHEDULE_PERIOD,
        showMenu: false,
        selectedCita: cita,
        quickReplies: ['Esta semana', 'Este mes', 'Otro mes']
      };
    }

    // Obtener días disponibles
    const diasDisponibles = await this.getAvailableDays(fechaInicio, fechaFin);

    if (!diasDisponibles || diasDisponibles.length === 0) {
      return {
        response: `Lo siento, no hay disponibilidad ${periodoTexto}. ¿Te gustaría ver otro período?`,
        nextState: this.conversationStates.CHOOSING_RESCHEDULE_PERIOD,
        showMenu: false,
        selectedCita: cita,
        quickReplies: ['Esta semana', 'Este mes', 'Otro mes', 'Volver al menú']
      };
    }

    // Formatear días disponibles
    const diasOpciones = diasDisponibles.slice(0, 7).map(dia => {
      const fecha = new Date(dia + 'T12:00:00');
      return fecha.toLocaleDateString('es-CO', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    });

    return {
      response: `📅 Días disponibles ${periodoTexto}:\n\nElige un día:`,
      nextState: this.conversationStates.CHOOSING_RESCHEDULE_DAY,
      showMenu: false,
      selectedCita: cita,
      availableDays: diasDisponibles,
      quickReplies: diasOpciones
    };
  }

  /**
   * Maneja la elección del día para reagendar
   */
  async handleRescheduleDayChoice(message, context) {
    const cita = context.selectedCita;
    const availableDays = context.availableDays || [];

    if (!cita || availableDays.length === 0) {
      return {
        response: 'Hubo un error. Por favor intenta de nuevo desde el menú principal.',
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: true
      };
    }

    // Buscar el día seleccionado
    const normalizedMessage = message.toLowerCase().trim();
    let selectedDay = null;

    for (const dia of availableDays) {
      // Usar T12:00:00 para evitar problemas de zona horaria
      const fecha = new Date(dia + 'T12:00:00');
      const diaFormateado = fecha.toLocaleDateString('es-CO', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      }).toLowerCase();
      
      if (normalizedMessage.includes(diaFormateado) || 
          normalizedMessage.includes(fecha.getDate().toString())) {
        selectedDay = dia;
        break;
      }
    }

    if (!selectedDay) {
      return {
        response: 'Por favor elige uno de los días disponibles.',
        nextState: this.conversationStates.CHOOSING_RESCHEDULE_DAY,
        showMenu: false,
        selectedCita: cita,
        availableDays: availableDays,
        quickReplies: availableDays.slice(0, 7).map(dia => {
          const fecha = new Date(dia + 'T12:00:00');
          return fecha.toLocaleDateString('es-CO', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          });
        })
      };
    }

    // Obtener horarios disponibles para ese día
    // Usar buffer_min del servicio (por defecto 10 minutos)
    const duracionMin = cita.servicios?.duracion_min || 60;
    const bufferMin = cita.servicios?.buffer_min || 10;
    const horariosDisponibles = await this.getAvailableTimesForDay(selectedDay, duracionMin, bufferMin);

    if (!horariosDisponibles || horariosDisponibles.length === 0) {
      return {
        response: 'Lo siento, no hay horarios disponibles para ese día. ¿Quieres elegir otro día?',
        nextState: this.conversationStates.CHOOSING_RESCHEDULE_DAY,
        showMenu: false,
        selectedCita: cita,
        availableDays: availableDays,
        quickReplies: availableDays.slice(0, 7).map(dia => {
          const fecha = new Date(dia + 'T12:00:00');
          return fecha.toLocaleDateString('es-CO', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          });
        })
      };
    }

    const fechaFormateada = new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    return {
      response: `📅 ${fechaFormateada}\n\n🕐 Horarios disponibles:\n\nElige una hora:`,
      nextState: this.conversationStates.CHOOSING_RESCHEDULE_TIME,
      showMenu: false,
      selectedCita: cita,
      selectedDay: selectedDay,
      availableTimes: horariosDisponibles,
      quickReplies: horariosDisponibles // Mostrar TODOS los horarios disponibles
    };
  }

  /**
   * Maneja la elección del horario y confirma el cambio
   */
  async handleRescheduleTimeChoice(message, context) {
    const cita = context.selectedCita;
    const selectedDay = context.selectedDay;
    const availableTimes = context.availableTimes || [];

    if (!cita || !selectedDay || availableTimes.length === 0) {
      return {
        response: 'Hubo un error. Por favor intenta de nuevo desde el menú principal.',
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: true
      };
    }

    const normalizedMessage = message.trim();
    
    // Verificar si el horario seleccionado está disponible
    if (!availableTimes.includes(normalizedMessage)) {
      return {
        response: 'Por favor elige uno de los horarios disponibles.',
        nextState: this.conversationStates.CHOOSING_RESCHEDULE_TIME,
        showMenu: false,
        selectedCita: cita,
        selectedDay: selectedDay,
        availableTimes: availableTimes,
        quickReplies: availableTimes // Mostrar TODOS los horarios disponibles
      };
    }

    // Calcular hora de fin usando duración + buffer (igual que bookings.js)
    const duracionMin = cita.servicios?.duracion_min || 60;
    const bufferMin = cita.servicios?.buffer_min || 10;
    const duracionTotal = duracionMin + bufferMin;
    
    // Funciones auxiliares (mismas que bookings.js)
    const timeToMinutes = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    
    const minutesToTime = (m) => {
      return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    };
    
    const endMin = timeToMinutes(normalizedMessage) + duracionTotal;
    const horaFinStr = minutesToTime(endMin);

    try {
      // Actualizar la cita en la base de datos (igual que bookings.js)
      const { error } = await supabase
        .from('citas')
        .update({
          fecha: selectedDay,
          hora_inicio: normalizedMessage,
          hora_fin: horaFinStr,
          duracion_total: duracionTotal
        })
        .eq('id', cita.id);

      if (error) throw error;

      const fechaFormateada = new Date(selectedDay).toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });

      return {
        response: `✅ ¡Perfecto! Tu cita ha sido reagendada exitosamente.\n\n` +
                  `📅 **Nueva fecha:** ${fechaFormateada}\n` +
                  `🕐 **Hora:** ${normalizedMessage} - ${horaFinStr}\n` +
                  `💆 **Servicio:** ${cita.servicios?.nombre}\n\n` +
                  `Te esperamos! 💜✨\n\n` +
                  `¿Hay algo más en lo que pueda ayudarte?`,
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: false,
        quickReplies: ['Volver al menú', 'Salir']
      };
    } catch (error) {
      console.error('Error actualizando cita:', error);
      return {
        response: 'Hubo un error al actualizar tu cita. Por favor contáctanos directamente:\n' +
                  '📞 +57 300 123 4567',
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: true
      };
    }
  }

  /**
   * Obtiene días disponibles en un rango de fechas
   * USA LAS MISMAS REGLAS QUE EL SISTEMA DE RESERVAS
   */
  async getAvailableDays(fechaInicio, fechaFin) {
    try {
      // HORARIO DEL SPA (mismo que bookings.js)
      // Lunes a Viernes: 9:00 - 18:00
      // Sábado: 9:00 - 16:00
      // Domingo: CERRADO
      const SCHEDULE = {
        1: { start: '09:00', end: '18:00' }, // Lunes
        2: { start: '09:00', end: '18:00' }, // Martes
        3: { start: '09:00', end: '18:00' }, // Miércoles
        4: { start: '09:00', end: '18:00' }, // Jueves
        5: { start: '09:00', end: '18:00' }, // Viernes
        6: { start: '09:00', end: '16:00' }, // Sábado
        // 0 (Domingo) no está en el objeto = CERRADO
      };

      const diasDisponibles = [];
      const fecha = new Date(fechaInicio);
      
      while (fecha <= fechaFin) {
        // Obtener fecha en formato YYYY-MM-DD
        const fechaStr = fecha.toISOString().split('T')[0];
        
        // Usar T12:00:00 para evitar problemas de zona horaria
        const diaSemana = new Date(fechaStr + 'T12:00:00').getDay(); // 0 = Domingo, 1 = Lunes, etc.
        
        // Solo agregar si hay horario definido (excluye domingos)
        if (SCHEDULE[diaSemana]) {
          diasDisponibles.push(fechaStr);
        }
        
        fecha.setDate(fecha.getDate() + 1);
      }

      return diasDisponibles;
    } catch (error) {
      console.error('Error obteniendo días disponibles:', error);
      return [];
    }
  }

  /**
   * Obtiene horarios disponibles para un día específico
   * USA LAS MISMAS REGLAS QUE EL SISTEMA DE RESERVAS
   */
  async getAvailableTimesForDay(fecha, duracionServicio = 60, bufferMin = 10) {
    try {
      // HORARIO DEL SPA (mismo que bookings.js)
      const SCHEDULE = {
        1: { start: '09:00', end: '18:00' }, // Lunes
        2: { start: '09:00', end: '18:00' }, // Martes
        3: { start: '09:00', end: '18:00' }, // Miércoles
        4: { start: '09:00', end: '18:00' }, // Jueves
        5: { start: '09:00', end: '18:00' }, // Viernes
        6: { start: '09:00', end: '16:00' }, // Sábado
      };

      const diaSemana = new Date(fecha + 'T12:00:00').getDay();
      const horario = SCHEDULE[diaSemana];

      if (!horario) {
        return []; // Domingo cerrado
      }

      // Funciones auxiliares (mismas que bookings.js)
      const timeToMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };

      const minutesToTime = (m) => {
        return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      };

      const intervalosSeCruzan = (s1, e1, s2, e2) => {
        return timeToMinutes(s1) < timeToMinutes(e2) &&
               timeToMinutes(e1) > timeToMinutes(s2);
      };

      // Duración total = duración servicio + buffer
      const totalMin = duracionServicio + bufferMin;

      // Obtener citas del día (misma query que bookings.js)
      const { data: citasDia, error } = await supabase
        .from('citas')
        .select('hora_inicio, hora_fin')
        .eq('fecha', fecha)
        .neq('estado', 'cancelada');

      if (error) throw error;

      // Generar slots de 30 minutos (mismo que bookings.js)
      const horariosDisponibles = [];
      let cursor = timeToMinutes(horario.start);
      const endMin = timeToMinutes(horario.end);

      while (cursor + totalMin <= endMin) {
        const slotStart = minutesToTime(cursor);
        const slotEnd = minutesToTime(cursor + totalMin);

        // Verificar si está ocupado
        const ocupado = (citasDia || []).some(c =>
          intervalosSeCruzan(slotStart, slotEnd, c.hora_inicio, c.hora_fin)
        );

        if (!ocupado) {
          horariosDisponibles.push(slotStart);
        }

        cursor += 30; // Avanzar 30 minutos
      }

      return horariosDisponibles;
    } catch (error) {
      console.error('Error obteniendo horarios disponibles:', error);
      return [];
    }
  }

  /**
   * Maneja la vista de servicios
   */
  async handleServicesView(intent, message) {
    if (intent === 'booking') {
      return {
        response: 'Perfecto! Te redirigiré a nuestro sistema de reservas donde podrás elegir el servicio, fecha y hora.',
        nextState: this.conversationStates.MAIN_MENU,
        showMenu: true,
        action: 'redirect_booking'
      };
    }

    // Volver al menú principal
    return {
      response: '¿En qué más puedo ayudarte?',
      nextState: this.conversationStates.MAIN_MENU,
      showMenu: true
    };
  }

  /**
   * Obtiene las opciones del menú principal
   */
  getMainMenuOptions() {
    return [
      'Ver servicios',
      'Agendar cita',
      'Consultar mis citas',
      'Horarios y ubicación',
      'Certificados de regalo'
    ];
  }
}

module.exports = ChatbotService;
