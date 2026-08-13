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
          <div class="chat-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5A4 4 0 0 1 12 22a4 4 0 0 1-2-12.5C8.8 8.8 8 7.5 8 6a4 4 0 0 1 4-4z"/><circle cx="12" cy="12" r="2.5"/></svg>
          </div>
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
            placeholder="Escribe tu consulta aquí..."
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

// Mapeo de etiquetas de botón a claves de acción normalizadas para n8n
const QUICK_REPLY_ACTIONS = {
  'ver servicios': 'ver_servicios',
  'agendar cita': 'agendar_cita',
  'consultar mis citas': 'consultar_citas',
  'horarios y ubicación': 'horarios_ubicacion',
  'horarios y ubicacion': 'horarios_ubicacion',
  'certificados de regalo': 'certificados_regalo',
  'hablar con asesor': 'hablar_asesor',
  'volver al menú': 'menu',
  'volver al menu': 'menu',
  'volver': 'menu',
  '1': 'ver_servicios',
  '2': 'consultar_citas',
  '3': 'agendar_cita',
  '4': 'hablar_asesor'
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
      const action = QUICK_REPLY_ACTIONS[option.toLowerCase()] || null
      const event = new CustomEvent('chat:quickreply', { detail: { option, action } })
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

  const imgDiv = document.createElement('div')
  imgDiv.className = 'service-card-image'
  const fallbackUrl = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80'
  const safeUrl = /^https?:\/\//.test(service.imagen_url || '') ? service.imagen_url : fallbackUrl
  imgDiv.style.backgroundImage = `url('${safeUrl}')`

  const contentDiv = document.createElement('div')
  contentDiv.className = 'service-card-content'

  const title = document.createElement('h4')
  title.className = 'service-card-title'
  title.textContent = service.nombre

  const desc = document.createElement('p')
  desc.className = 'service-card-description'
  desc.textContent = service.descripcion || ''

  const footer = document.createElement('div')
  footer.className = 'service-card-footer'

  const price = document.createElement('span')
  price.className = 'service-card-price'
  price.textContent = `$${service.precio?.toLocaleString() || 'N/A'}`

  const duration = document.createElement('span')
  duration.className = 'service-card-duration'
  duration.textContent = `${service.duracion_min || 0} min`

  footer.appendChild(price)
  footer.appendChild(duration)
  contentDiv.appendChild(title)
  contentDiv.appendChild(desc)
  contentDiv.appendChild(footer)
  card.appendChild(imgDiv)
  card.appendChild(contentDiv)

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

  // Sincronizado con los tokens --estado-* (SISTEMA WEB/design-tokens.css)
  const estadoColors = {
    'confirmada':        '#2563eb',
    'pendiente':         '#AD74C3',
    'completada':        '#16a34a',
    'no_asistio':        '#dc2626',
    'cancelada_cliente': '#c2410c',
    'cancelada_admin':   '#64748b',
  }
  const estadoLabels = {
    'confirmada':        'Confirmada',
    'pendiente':         'Pendiente',
    'completada':        'Completada',
    'no_asistio':        'No asistió',
    'cancelada_cliente': 'Cancelada',
    'cancelada_admin':   'Cancelada',
  }
  const estadoColor = estadoColors[appointment.estado] || '#64748b'

  const header = document.createElement('div')
  header.className = 'appointment-card-header'

  const badge = document.createElement('span')
  badge.className = 'appointment-badge'
  badge.style.backgroundColor = estadoColor
  badge.textContent = estadoLabels[appointment.estado] || appointment.estado

  const dateSpan = document.createElement('span')
  dateSpan.className = 'appointment-date'
  dateSpan.textContent = appointment.fecha

  header.appendChild(badge)
  header.appendChild(dateSpan)

  const body = document.createElement('div')
  body.className = 'appointment-card-body'

  const serviceName = document.createElement('h4')
  serviceName.className = 'appointment-service'
  serviceName.textContent = appointment.servicio_nombre

  const time = document.createElement('p')
  time.className = 'appointment-time'
  time.textContent = `${appointment.hora_inicio} - ${appointment.hora_fin}`

  body.appendChild(serviceName)
  body.appendChild(time)

  if (appointment.notas) {
    const notes = document.createElement('p')
    notes.className = 'appointment-notes'
    notes.textContent = appointment.notas
    body.appendChild(notes)
  }

  card.appendChild(header)
  card.appendChild(body)

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

class ChatManager {
  constructor(chatPanel) {
    this.panel = chatPanel
    this.sessionId = null
    this.userName = null
    this.apiBaseUrl = '/api/chat'

    this.loadSession()

    window.addEventListener('chat:send', (e) => this.handleUserMessage(e.detail.message, 'text'))
    // Los quick replies llevan tipo 'quick_reply' y su acción normalizada
    window.addEventListener('chat:quickreply', (e) => {
      this.handleUserMessage(e.detail.option, 'quick_reply', e.detail.action)
    })
  }

  async initSession() {
    try {
      if (this.sessionId) {
        // Sesión existente: dejar que N8N maneje el saludo de bienvenida
        await this.sendToBackend('__init__', 'init')
        return this.sessionId
      }

      const response = await fetch(`${this.apiBaseUrl}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to create session')

      const data = await response.json()
      this.sessionId = data.session_id
      this.saveSession()

      // Trigger inicial → N8N responde con el saludo
      await this.sendToBackend('__init__', 'init')

      return this.sessionId
    } catch (error) {
      console.error('Error initializing session:', error)
      this.panel.addMessage('Lo siento, hubo un error al iniciar el chat. Por favor intenta de nuevo.', 'bot')
    }
  }

  async handleUserMessage(message, messageType = 'text', action = null) {
    this.panel.addMessage(message, 'user')

    try {
      this.panel.showTypingIndicator()
      const response = await this.sendToBackend(message, messageType, action)
      this.panel.hideTypingIndicator()
      this.processResponse(response)
    } catch (error) {
      this.panel.hideTypingIndicator()
      console.error('Error sending message:', error)
      this.panel.addMessage('Lo siento, hubo un error. Por favor intenta de nuevo.', 'bot')
    }
  }

  async sendToBackend(message, messageType = 'text', action = null) {
    const body = {
      session_id: this.sessionId,
      user_name: this.userName,
      message,
      messageType
    }
    if (action) body.action = action

    const response = await fetch(`${this.apiBaseUrl}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'Error sending message')
    }

    return response.json()
  }

  processResponse(response) {
    // Soporte para múltiples burbujas (bot_messages[]) o burbuja única (bot_response)
    if (response.bot_messages && response.bot_messages.length > 0) {
      response.bot_messages.forEach(msg => this.panel.addMessage(msg, 'bot'))
    } else if (response.bot_response) {
      this.panel.addMessage(response.bot_response, 'bot')
    }

    if (response.quickReplies && response.quickReplies.length > 0) {
      this.panel.addQuickReplies(response.quickReplies)
    }

    // N8N puede actualizar el nombre del usuario
    if (response.data?.userName) {
      this.userName = response.data.userName
      this.saveSession()
    }

    // N8N puede pedir redirigir al usuario (ej. a horarios de un servicio específico)
    if (response.redirect) {
      window.location.href = response.redirect
    }
  }

  saveSession() {
    localStorage.setItem('chat_session_id', this.sessionId || '')
    localStorage.setItem('chat_user_name', this.userName || '')
  }

  loadSession() {
    this.sessionId = localStorage.getItem('chat_session_id') || null
    this.userName = localStorage.getItem('chat_user_name') || null
  }

  getSessionId() { return this.sessionId }
  getUserName() { return this.userName }
  setUserName(name) { this.userName = name; this.saveSession() }
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
