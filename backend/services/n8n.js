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
    this.timeout = 15000; // 15s — workflows en Render pueden tardar en arrancar
  }

  isConfigured() {
    return Boolean(this.webhookUrl && this.webhookUrl.trim() !== '');
  }

  async sendMessage(sessionId, userName, message, messageType = 'text', action = null) {
    if (!this.isConfigured()) {
      throw new Error('N8N webhook is not configured');
    }

    // El workflow n8n espera el campo "chatInput" en el nodo "Parse Input"
    const payload = {
      sessionId,
      userName: userName || '',
      chatInput: message,
      mensaje: message,        // compatibilidad con versiones anteriores
      messageType,             // 'init' | 'text' | 'quick_reply'
      ...(action && { action }) // clave normalizada del botón, p.ej. "agendar_cita"
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`N8N webhook returned status ${response.status}`);
      }

      const data = await response.json();

      // Soporte para múltiples formatos de respuesta de N8N
      const botResponse =
        data.text ||
        data.output ||
        data.message ||
        data.respuesta ||
        (typeof data === 'string' ? data : null) ||
        'No pude procesar tu mensaje. Por favor intenta de nuevo.';

      return {
        response: botResponse,
        quickReplies: data.quickReplies || data.opciones || data.suggestions || [],
        messages: Array.isArray(data.messages) ? data.messages : [],
        redirect: data.redirect || null,
        data: data.data || {}
      };

    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('N8N webhook request timed out');
      }
      throw error;
    }
  }
}

module.exports = N8NService;
