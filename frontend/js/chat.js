/**
 * chat.js — Sistema de Chat Interno para Serenità Spa
 * Reemplaza el botón de WhatsApp con un chat conversacional integrado
 */

// ============================================================
// CHAT BUTTON COMPONENT
// ============================================================

/**
 * ChatButton - Botón flotante que abre el panel de chat
 * 
 * Responsabilidades:
 * - Renderizar botón flotante con icono de chat
 * - Mostrar animación pulse continua
 * - Mostrar badge numérico después de 3 segundos
 * - Toggle del Chat Panel al hacer clic
 * - Cambiar icono entre chat y close según estado
 * 
 * Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
 */
class ChatButton {
  constructor(containerId = 'chat-button-container') {
    this.containerId = containerId
    this.container = null
    this.button = null
    this.badge = null
    this.isOpen = false
    this.badgeTimeout = null
  }

  /**
   * Renderiza el botón de chat en el DOM
   * Reemplaza el botón de WhatsApp existente
   */
  render() {
    // Crear contenedor si no existe
    let container = document.getElementById(this.containerId)
    if (!container) {
      container = document.createElement('div')
      container.id = this.containerId
      document.body.appendChild(container)
    }
    this.container = container

    // HTML del botón
    this.container.innerHTML = `
      <button id="chat-btn" class="chat-button" aria-label="Chat con Serenità Spa">
        <span class="chat-pulse"></span>
        <span class="chat-badge hidden">1</span>
        
        <!-- Icono de chat (visible por defecto) -->
        <svg class="chat-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        
        <!-- Icono de cerrar (oculto por defecto) -->
        <svg class="chat-close-icon hidden" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `

    // Referencias a elementos
    this.button = document.getElementById('chat-btn')
    this.badge = this.button.querySelector('.chat-badge')

    // Event listener para toggle
    this.button.addEventListener('click', () => this.toggle())

    // Mostrar badge después de 3 segundos (Requirement 1.6)
    this.badgeTimeout = setTimeout(() => {
      this.showBadge()
    }, 3000)

    return this.button
  }

  /**
   * Muestra el badge con número "1"
   * Requirement 1.6: Badge aparece después de 3 segundos
   */
  showBadge(count = '1') {
    if (this.badge) {
      this.badge.textContent = count
      this.badge.classList.remove('hidden')
    }
  }

  /**
   * Oculta el badge
   */
  hideBadge() {
    if (this.badge) {
      this.badge.classList.add('hidden')
    }
  }

  /**
   * Toggle del panel de chat
   * Requirement 1.7, 1.8: Abre/cierra panel con animación
   */
  toggle() {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  /**
   * Abre el panel de chat
   * Requirement 1.7: Panel se abre con slide-in animation
   */
  open() {
    this.isOpen = true
    
    // Cambiar iconos (Requirement 1.8)
    const chatIcon = this.button.querySelector('.chat-icon')
    const closeIcon = this.button.querySelector('.chat-close-icon')
    
    if (chatIcon) chatIcon.classList.add('hidden')
    if (closeIcon) closeIcon.classList.remove('hidden')
    
    // Ocultar badge cuando se abre
    this.hideBadge()
    
    // Emitir evento para que ChatPanel se abra
    const event = new CustomEvent('chat:open')
    window.dispatchEvent(event)
  }

  /**
   * Cierra el panel de chat
   * Requirement 1.8: Panel se cierra con slide-out animation
   */
  close() {
    this.isOpen = false
    
    // Cambiar iconos de vuelta
    const chatIcon = this.button.querySelector('.chat-icon')
    const closeIcon = this.button.querySelector('.chat-close-icon')
    
    if (chatIcon) chatIcon.classList.remove('hidden')
    if (closeIcon) closeIcon.classList.add('hidden')
    
    // Emitir evento para que ChatPanel se cierre
    const event = new CustomEvent('chat:close')
    window.dispatchEvent(event)
  }

  /**
   * Destruye el botón y limpia recursos
   */
  destroy() {
    if (this.badgeTimeout) {
      clearTimeout(this.badgeTimeout)
    }
    if (this.container) {
      this.container.remove()
    }
  }
}

// ============================================================
// EXPORTS
// ============================================================

export { ChatButton }

// ============================================================
// CHAT PANEL COMPONENT
// ============================================================

/**
 * ChatPanel - Panel de chat que contiene los mensajes y el input
 * 
 * Responsabilidades:
 * - Renderizar panel con header, área de mensajes, e input
 * - Mostrar/ocultar panel con animaciones
 * - Agregar mensajes (bot y usuario)
 * - Agregar quick replies, service cards, appointment cards
 * - Mostrar/ocultar typing indicator
 * - Auto-scroll al último mensaje
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 13.1, 13.2
 */
class ChatPanel {
  constructor(containerId = 'chat-panel-container') {
    this.containerId = containerId
    this.container = null
    this.panel = null
    this.messagesArea = null
    this.inputField = null
    this.sendButton = null
    this.isOpen = false
  }

  /**
   * Renderiza el panel de chat en el DOM
   */
  render() {
    // Crear contenedor si no existe
    let container = document.getElementById(this.containerId)
    if (!container) {
      container = document.createElement('div')
      container.id = this.containerId
      document.body.appendChild(container)
    }
    this.container = container

    // HTML del panel
    this.container.innerHTML = `
      <div id="chat-panel" class="chat-panel">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-avatar">🌿</div>
          <div class="chat-header-info">
            <h3 class="chat-header-title">Serenità Spa</h3>
            <p class="chat-header-status">
              <span class="status-indicator"></span>
              En línea
            </p>
          </div>
        </div>

        <!-- Messages Area -->
        <div id="chat-messages" class="chat-messages"></div>

        <!-- Input Container -->
        <div class="chat-input-container">
          <input 
            type="text" 
            id="chat-input" 
            class="chat-input" 
            placeholder="Escribe tu mensaje..."
            aria-label="Mensaje de chat"
          />
          <button id="chat-send-btn" class="chat-send-btn" aria-label="Enviar mensaje">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    `

    // Referencias a elementos
    this.panel = document.getElementById('chat-panel')
    this.messagesArea = document.getElementById('chat-messages')
    this.inputField = document.getElementById('chat-input')
    this.sendButton = document.getElementById('chat-send-btn')

    // Event listeners
    this.sendButton.addEventListener('click', () => this.handleSend())
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSend()
      }
    })

    // Escuchar eventos de apertura/cierre
    window.addEventListener('chat:open', () => this.open())
    window.addEventListener('chat:close', () => this.close())

    return this.panel
  }

  /**
   * Maneja el envío de mensajes
   */
  handleSend() {
    const message = this.inputField.value.trim()
    if (message) {
      // Emitir evento con el mensaje
      const event = new CustomEvent('chat:send', { detail: { message } })
      window.dispatchEvent(event)
      
      // Limpiar input
      this.inputField.value = ''
    }
  }

  /**
   * Abre el panel con animación
   */
  open() {
    this.isOpen = true
    this.panel.classList.add('open')
    this.scrollToBottom()
    
    // Focus en el input
    setTimeout(() => {
      this.inputField.focus()
    }, 300)
  }

  /**
   * Cierra el panel con animación
   */
  close() {
    this.isOpen = false
    this.panel.classList.remove('open')
  }

  /**
   * Agrega un mensaje al chat
   * @param {string} text - Texto del mensaje
   * @param {string} sender - 'user' o 'bot'
   */
  addMessage(text, sender = 'bot') {
    const bubble = createMessageBubble(text, sender)
    this.messagesArea.appendChild(bubble)
    this.scrollToBottom()
  }

  /**
   * Agrega quick replies (botones de respuesta rápida)
   * @param {Array<string>} options - Array de opciones
   */
  addQuickReplies(options) {
    const quickReplies = createQuickReplies(options)
    this.messagesArea.appendChild(quickReplies)
    this.scrollToBottom()
  }

  /**
   * Agrega service cards
   * @param {Array<Object>} services - Array de servicios
   */
  addServiceCards(services) {
    const container = document.createElement('div')
    container.className = 'service-cards-container'
    
    services.forEach(service => {
      const card = createServiceCard(service)
      container.appendChild(card)
    })
    
    this.messagesArea.appendChild(container)
    this.scrollToBottom()
  }

  /**
   * Agrega appointment cards
   * @param {Array<Object>} appointments - Array de citas
   */
  addAppointmentCards(appointments) {
    const container = document.createElement('div')
    container.className = 'appointment-cards-container'
    
    appointments.forEach(appointment => {
      const card = createAppointmentCard(appointment)
      container.appendChild(card)
    })
    
    this.messagesArea.appendChild(container)
    this.scrollToBottom()
  }

  /**
   * Muestra el typing indicator
   */
  showTypingIndicator() {
    // Remover typing indicator existente si hay
    this.hideTypingIndicator()
    
    const indicator = createTypingIndicator()
    indicator.id = 'typing-indicator'
    this.messagesArea.appendChild(indicator)
    this.scrollToBottom()
  }

  /**
   * Oculta el typing indicator
   */
  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator')
    if (indicator) {
      indicator.remove()
    }
  }

  /**
   * Scroll al último mensaje
   */
  scrollToBottom() {
    setTimeout(() => {
      this.messagesArea.scrollTop = this.messagesArea.scrollHeight
    }, 100)
  }

  /**
   * Limpia todos los mensajes
   */
  clearMessages() {
    this.messagesArea.innerHTML = ''
  }
}

// ============================================================
// MESSAGE RENDERING FUNCTIONS
// ============================================================

/**
 * Crea una burbuja de mensaje
 * @param {string} text - Texto del mensaje
 * @param {string} sender - 'user' o 'bot'
 * @returns {HTMLElement}
 */
function createMessageBubble(text, sender = 'bot') {
  const bubble = document.createElement('div')
  bubble.className = `message-bubble ${sender}`
  bubble.textContent = text
  return bubble
}

/**
 * Crea quick replies (botones de respuesta rápida)
 * @param {Array<string>} options - Array de opciones
 * @returns {HTMLElement}
 */
function createQuickReplies(options) {
  const container = document.createElement('div')
  container.className = 'quick-replies'
  
  options.forEach(option => {
    const button = document.createElement('button')
    button.className = 'quick-reply-btn'
    button.textContent = option
    button.addEventListener('click', () => {
      // Emitir evento con la opción seleccionada
      const event = new CustomEvent('chat:quickreply', { detail: { option } })
      window.dispatchEvent(event)
    })
    container.appendChild(button)
  })
  
  return container
}

/**
 * Crea una service card
 * @param {Object} service - Objeto de servicio
 * @returns {HTMLElement}
 */
function createServiceCard(service) {
  const card = document.createElement('div')
  card.className = 'service-card'
  
  card.innerHTML = `
    <div class="service-card-image" style="background-image: url('${service.imagen_url || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80'}')"></div>
    <div class="service-card-content">
      <h4 class="service-card-title">${service.nombre}</h4>
      <p class="service-card-description">${service.descripcion || ''}</p>
      <div class="service-card-footer">
        <span class="service-card-price">$${service.precio?.toLocaleString() || 'N/A'}</span>
        <span class="service-card-duration">${service.duracion_min || 0} min</span>
      </div>
    </div>
  `
  
  return card
}

/**
 * Crea una appointment card
 * @param {Object} appointment - Objeto de cita
 * @returns {HTMLElement}
 */
function createAppointmentCard(appointment) {
  const card = document.createElement('div')
  card.className = 'appointment-card'
  
  // Determinar color según estado
  const estadoColors = {
    'confirmada': '#4ade80',
    'pendiente': '#fbbf24',
    'cancelada': '#ef4444',
    'completada': '#8b5cf6'
  }
  const estadoColor = estadoColors[appointment.estado] || '#6b7280'
  
  card.innerHTML = `
    <div class="appointment-card-header">
      <span class="appointment-badge" style="background-color: ${estadoColor}">${appointment.estado}</span>
      <span class="appointment-date">${appointment.fecha}</span>
    </div>
    <div class="appointment-card-body">
      <h4 class="appointment-service">${appointment.servicio_nombre}</h4>
      <p class="appointment-time">⏰ ${appointment.hora_inicio} - ${appointment.hora_fin}</p>
      ${appointment.notas ? `<p class="appointment-notes">📝 ${appointment.notas}</p>` : ''}
    </div>
  `
  
  return card
}

/**
 * Crea el typing indicator (animación de "escribiendo...")
 * @returns {HTMLElement}
 */
function createTypingIndicator() {
  const indicator = document.createElement('div')
  indicator.className = 'typing-indicator'
  
  indicator.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `
  
  return indicator
}

// ============================================================
// CHAT MANAGER - Business Logic
// ============================================================

/**
 * ChatManager - Maneja la lógica de negocio del chat
 * 
 * Responsabilidades:
 * - Gestionar sesiones de chat
 * - Enviar/recibir mensajes del backend
 * - Manejar flujos conversacionales
 * - Integrar con API de backend
 * - Persistir estado en localStorage
 * 
 * Requirements: 11.6, 4.1, 4.2, 4.3, 4.4, 4.6, 5.1, 6.1, 7.1, 7.2, 8.1, 9.1
 */
class ChatManager {
  constructor(chatPanel) {
    this.panel = chatPanel
    this.sessionId = null
    this.userName = null
    this.currentStep = 'inicio'
    this.apiBaseUrl = '/api/chat'
    
    // Cargar sesión desde localStorage
    this.loadSession()
    
    // Event listeners
    window.addEventListener('chat:send', (e) => this.handleUserMessage(e.detail.message))
    window.addEventListener('chat:quickreply', (e) => this.handleQuickReply(e.detail.option))
  }

  /**
   * Inicializa la sesión de chat
   */
  async initSession() {
    try {
      // Si ya hay una sesión, no crear una nueva
      if (this.sessionId) {
        return this.sessionId
      }

      const sessionId = await this.createSession()
      this.sessionId = sessionId
      this.saveSession()
      
      // Iniciar conversación
      await this.startConversation()
      
      return sessionId
    } catch (error) {
      console.error('Error initializing session:', error)
      this.panel.addMessage('Lo siento, hubo un error al iniciar el chat. Por favor intenta de nuevo.', 'bot')
    }
  }

  /**
   * Crea una nueva sesión en el backend
   * @returns {Promise<string>} Session ID
   */
  async createSession() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      const data = await response.json()
      return data.session_id
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    }
  }

  /**
   * Inicia la conversación con mensaje de bienvenida
   */
  async startConversation() {
    this.panel.addMessage('¡Hola! Bienvenido a Serenità Spa 🌿', 'bot')
    
    setTimeout(() => {
      this.panel.addMessage('¿Cómo te llamas?', 'bot')
    }, 800)
  }

  /**
   * Maneja mensajes del usuario
   * @param {string} message - Mensaje del usuario
   */
  async handleUserMessage(message) {
    // Agregar mensaje del usuario al chat
    this.panel.addMessage(message, 'user')

    // Si no tenemos nombre de usuario, guardarlo
    if (!this.userName) {
      this.userName = message
      this.saveSession()
      
      this.panel.showTypingIndicator()
      setTimeout(() => {
        this.panel.hideTypingIndicator()
        this.panel.addMessage(`¡Encantado de conocerte, ${this.userName}! 😊`, 'bot')
        
        setTimeout(() => {
          this.showMainMenu()
        }, 1000)
      }, 1500)
      
      return
    }

    // Enviar mensaje al backend (N8N)
    try {
      this.panel.showTypingIndicator()
      
      const response = await this.sendMessageToAPI(message)
      
      this.panel.hideTypingIndicator()
      
      // Procesar respuesta
      this.processResponse(response)
      
    } catch (error) {
      this.panel.hideTypingIndicator()
      console.error('Error sending message:', error)
      this.panel.addMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo o contacta directamente al +57 300 123 4567.', 'bot')
    }
  }

  /**
   * Maneja quick replies
   * @param {string} option - Opción seleccionada
   */
  async handleQuickReply(option) {
    // Agregar como mensaje del usuario
    this.panel.addMessage(option, 'user')

    // Procesar según la opción
    if (option === 'Ver servicios') {
      await this.handleServiceInquiry()
    } else if (option === 'Agendar cita') {
      await this.handleBookingInquiry()
    } else if (option === 'Consultar mis citas') {
      await this.handleAppointmentInquiry()
    } else if (option === 'Horarios y ubicación') {
      await this.handleScheduleInfo()
    } else if (option === 'Certificados de regalo') {
      await this.handleGiftCertificates()
    } else if (option === 'Volver al menú') {
      this.showMainMenu()
    } else {
      // Enviar al backend como mensaje normal
      await this.handleUserMessage(option)
    }
  }

  /**
   * Muestra el menú principal
   */
  showMainMenu() {
    this.panel.addMessage('¿En qué puedo ayudarte hoy?', 'bot')
    
    const options = [
      'Ver servicios',
      'Agendar cita',
      'Consultar mis citas',
      'Horarios y ubicación',
      'Certificados de regalo'
    ]
    
    this.panel.addQuickReplies(options)
  }

  /**
   * Maneja consulta de servicios
   */
  async handleServiceInquiry() {
    try {
      this.panel.showTypingIndicator()
      
      const services = await this.getServices()
      
      this.panel.hideTypingIndicator()
      
      if (services && services.length > 0) {
        this.panel.addMessage('Estos son nuestros servicios disponibles:', 'bot')
        this.panel.addServiceCards(services)
        
        setTimeout(() => {
          this.panel.addMessage('¿Te gustaría agendar alguno de estos servicios?', 'bot')
          this.panel.addQuickReplies(['Agendar cita', 'Volver al menú'])
        }, 1000)
      } else {
        this.panel.addMessage('Lo siento, no pude cargar los servicios en este momento. Por favor intenta de nuevo.', 'bot')
      }
    } catch (error) {
      this.panel.hideTypingIndicator()
      console.error('Error fetching services:', error)
      this.panel.addMessage('Hubo un error al consultar los servicios. Por favor intenta de nuevo.', 'bot')
    }
  }

  /**
   * Maneja consulta de reserva
   */
  async handleBookingInquiry() {
    this.panel.addMessage('Para agendar una cita, te voy a redirigir a nuestro sistema de reservas en línea.', 'bot')
    
    setTimeout(() => {
      this.panel.addMessage('Haz clic aquí para continuar: <a href="/reservas.html" target="_blank" style="color: #C9A961; text-decoration: underline;">Ir a Reservas</a>', 'bot')
      this.panel.addQuickReplies(['Volver al menú'])
    }, 1000)
  }

  /**
   * Maneja consulta de citas
   */
  async handleAppointmentInquiry() {
    this.panel.addMessage('Para consultar tus citas, necesito tu número de documento.', 'bot')
    this.panel.addMessage('Por favor escribe tu número de documento (cédula o pasaporte):', 'bot')
    
    // Cambiar el step para que el próximo mensaje sea procesado como documento
    this.currentStep = 'waiting_documento'
  }

  /**
   * Maneja información de horarios
   */
  async handleScheduleInfo() {
    this.panel.addMessage('📍 Estamos ubicados en:', 'bot')
    this.panel.addMessage('Carrera 1 # 2-3, Riohacha, La Guajira, Colombia', 'bot')
    
    setTimeout(() => {
      this.panel.addMessage('🕐 Nuestros horarios de atención:', 'bot')
      this.panel.addMessage('Lunes a Sábado: 9:00 AM - 7:00 PM', 'bot')
    }, 1000)
    
    setTimeout(() => {
      this.panel.addMessage('📞 Teléfono: +57 300 123 4567', 'bot')
      this.panel.addQuickReplies(['Volver al menú'])
    }, 2000)
  }

  /**
   * Maneja información de certificados de regalo
   */
  async handleGiftCertificates() {
    this.panel.addMessage('🎁 ¡Los certificados de regalo son el detalle perfecto!', 'bot')
    
    setTimeout(() => {
      this.panel.addMessage('Puedes regalar cualquiera de nuestros servicios. Para más información, contáctanos al +57 300 123 4567 o escríbenos por WhatsApp.', 'bot')
      this.panel.addQuickReplies(['Ver servicios', 'Volver al menú'])
    }, 1500)
  }

  /**
   * Envía mensaje al backend
   * @param {string} message - Mensaje a enviar
   * @returns {Promise<Object>} Respuesta del backend
   */
  async sendMessageToAPI(message) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          user_name: this.userName,
          message: message,
          message_type: 'text',
          step: this.currentStep
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error sending message')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error in sendMessageToAPI:', error)
      throw error
    }
  }

  /**
   * Obtiene servicios del backend
   * @returns {Promise<Array>} Array de servicios
   */
  async getServices() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/services`)
      
      if (!response.ok) {
        throw new Error('Error fetching services')
      }

      const services = await response.json()
      return services
    } catch (error) {
      console.error('Error in getServices:', error)
      throw error
    }
  }

  /**
   * Obtiene citas por documento
   * @param {string} documento - Número de documento
   * @returns {Promise<Array>} Array de citas
   */
  async getAppointments(documento) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documento })
      })

      if (!response.ok) {
        throw new Error('Error fetching appointments')
      }

      const data = await response.json()
      return data.appointments || []
    } catch (error) {
      console.error('Error in getAppointments:', error)
      throw error
    }
  }

  /**
   * Procesa la respuesta del backend
   * @param {Object} response - Respuesta del backend
   */
  processResponse(response) {
    if (response.bot_response) {
      this.panel.addMessage(response.bot_response, 'bot')
    }

    // Si hay quick replies
    if (response.quick_replies && response.quick_replies.length > 0) {
      this.panel.addQuickReplies(response.quick_replies)
    }

    // Si hay servicios
    if (response.servicios && response.servicios.length > 0) {
      this.panel.addServiceCards(response.servicios)
    }

    // Si hay citas
    if (response.citas && response.citas.length > 0) {
      this.panel.addAppointmentCards(response.citas)
    }
  }

  /**
   * Guarda la sesión en localStorage
   */
  saveSession() {
    localStorage.setItem('chat_session_id', this.sessionId || '')
    localStorage.setItem('chat_user_name', this.userName || '')
  }

  /**
   * Carga la sesión desde localStorage
   */
  loadSession() {
    this.sessionId = localStorage.getItem('chat_session_id') || null
    this.userName = localStorage.getItem('chat_user_name') || null
  }

  /**
   * Obtiene el session ID
   * @returns {string|null}
   */
  getSessionId() {
    return this.sessionId
  }

  /**
   * Obtiene el nombre de usuario
   * @returns {string|null}
   */
  getUserName() {
    return this.userName
  }

  /**
   * Establece el nombre de usuario
   * @param {string} name
   */
  setUserName(name) {
    this.userName = name
    this.saveSession()
  }
}

// ============================================================
// INITIALIZATION FUNCTION
// ============================================================

/**
 * Inicializa el sistema de chat
 */
function initChat() {
  // Crear componentes
  const chatButton = new ChatButton()
  const chatPanel = new ChatPanel()
  const chatManager = new ChatManager(chatPanel)

  // Renderizar
  chatButton.render()
  chatPanel.render()

  // Inicializar sesión cuando se abre el chat por primera vez
  window.addEventListener('chat:open', async () => {
    if (!chatManager.getSessionId()) {
      await chatManager.initSession()
    }
  }, { once: true })

  return { chatButton, chatPanel, chatManager }
}

// ============================================================
// EXPORTS
// ============================================================

export { ChatButton, ChatPanel, ChatManager, initChat }
