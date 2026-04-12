/**
 * N8N Integration Service
 * 
 * Handles communication with N8N webhook for processing free-text messages.
 * Provides graceful degradation when N8N is unavailable.
 * 
 * Requirements: 10.2, 10.3, 10.4, 10.6
 */

class N8NService {
  constructor(webhookUrl = null) {
    this.webhookUrl = webhookUrl || process.env.N8N_CHAT_WEBHOOK;
    this.timeout = 5000; // 5 seconds timeout
  }

  /**
   * Check if N8N webhook is configured
   * @returns {boolean} True if webhook URL is configured
   */
  isConfigured() {
    return Boolean(this.webhookUrl && this.webhookUrl.trim() !== '');
  }

  /**
   * Send message to N8N webhook
   * @param {string} sessionId - Chat session UUID
   * @param {string} userName - User's name
   * @param {string} message - User's message text
   * @returns {Promise<{response: string, suggestions?: string[]}>} N8N response
   * @throws {Error} If webhook is not configured or request fails
   */
  async sendMessage(sessionId, userName, message, step = 'inicio', userDoc = null) {
    if (!this.isConfigured()) {
      throw new Error('N8N webhook is not configured');
    }

    // Formato adaptado a tu flujo de N8N
    const payload = {
      sessionId: sessionId,      // Tu flujo usa "sessionId" (camelCase)
      userName: userName,         // Tu flujo usa "userName"
      mensaje: message,           // Tu flujo usa "mensaje"
      step: step,                 // Estado conversacional
      userDoc: userDoc            // Documento del usuario (si está disponible)
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`N8N webhook returned status ${response.status}`);
      }

      const data = await response.json();
      
      // Tu flujo de N8N puede retornar diferentes formatos
      // Adaptamos para manejar: text, servicios, citas, showMenu
      let botResponse = '';
      let responseData = {};

      if (data.text) {
        // Respuesta de texto simple
        botResponse = data.text;
        responseData.showMenu = data.showMenu || false;
      } else if (data.servicios) {
        // Respuesta con lista de servicios
        botResponse = 'Aquí están nuestros servicios disponibles:';
        responseData.servicios = data.servicios;
      } else if (data.citas) {
        // Respuesta con lista de citas
        botResponse = data.citas.length > 0 
          ? 'Estas son tus citas:' 
          : 'No encontré citas asociadas a ese documento.';
        responseData.citas = data.citas;
      } else {
        throw new Error('Invalid response format from N8N webhook');
      }

      return {
        response: botResponse,
        data: responseData,
        suggestions: data.suggestions || []
      };

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('N8N webhook request timed out');
      }
      throw error;
    }
  }
}

module.exports = N8NService;
