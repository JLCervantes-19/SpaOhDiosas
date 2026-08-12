import { EMPRESA_ID } from '../config/supabase.js';

class N8NService {
  constructor(webhookUrl = null) {
    this.webhookUrl = webhookUrl || process.env.N8N_CHAT_WEBHOOK;
    this.timeout = 15000;
  }

  isConfigured() {
    return Boolean(this.webhookUrl && this.webhookUrl.trim() !== '');
  }

  async sendMessage(sessionId, userName, message, messageType = 'text', action = null) {
    if (!this.isConfigured()) {
      throw new Error('N8N webhook is not configured');
    }

    const payload = {
      sessionId,
      userName: userName || '',
      chatInput: message,
      mensaje: message,
      messageType,
      empresaId: EMPRESA_ID,
      ...(action && { action }),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`N8N webhook returned status ${response.status}`);
      }

      const data = await response.json();

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
        data: data.data || {},
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

export default N8NService;
