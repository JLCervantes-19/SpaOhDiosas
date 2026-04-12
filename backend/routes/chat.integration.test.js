// ============================================================
// backend/routes/chat.integration.test.js
// Integration test for chat message endpoint
// ============================================================

const request = require('supertest')
const express = require('express')

// Skip integration tests if Supabase credentials are not configured
const skipTests = !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY

const describeOrSkip = skipTests ? describe.skip : describe

describeOrSkip('POST /api/chat/message - Integration Test', () => {
  let app
  let sessionId
  let chatRouter

  beforeAll(async () => {
    // Import after checking env vars
    chatRouter = require('./chat')
    
    app = express()
    app.use(express.json())
    app.use('/api/chat', chatRouter)

    // Create a real session first
    const sessionResponse = await request(app)
      .post('/api/chat/session')
      .expect(201)
    
    sessionId = sessionResponse.body.session_id
  })

  it('should process a message and return bot response', async () => {
    const response = await request(app)
      .post('/api/chat/message')
      .send({
        session_id: sessionId,
        user_name: 'Test User',
        message: '¿Cuál es el precio de los masajes?',
        message_type: 'text'
      })
      .expect(200)

    expect(response.body).toHaveProperty('bot_response')
    expect(typeof response.body.bot_response).toBe('string')
    expect(response.body.bot_response.length).toBeGreaterThan(0)
  })

  it('should handle quick_reply messages', async () => {
    const response = await request(app)
      .post('/api/chat/message')
      .send({
        session_id: sessionId,
        message: 'Ver servicios',
        message_type: 'quick_reply'
      })
      .expect(200)

    expect(response.body).toHaveProperty('bot_response')
    expect(typeof response.body.bot_response).toBe('string')
  })

  it('should recognize pricing intent', async () => {
    const response = await request(app)
      .post('/api/chat/message')
      .send({
        session_id: sessionId,
        message: '¿Cuánto cuesta?',
        message_type: 'text'
      })
      .expect(200)

    expect(response.body.bot_response).toMatch(/precio|servicio/i)
  })

  it('should recognize schedule intent', async () => {
    const response = await request(app)
      .post('/api/chat/message')
      .send({
        session_id: sessionId,
        message: '¿Cuál es el horario?',
        message_type: 'text'
      })
      .expect(200)

    expect(response.body.bot_response).toMatch(/horario|lunes|sábado/i)
  })

  it('should recognize location intent', async () => {
    const response = await request(app)
      .post('/api/chat/message')
      .send({
        session_id: sessionId,
        message: '¿Dónde están ubicados?',
        message_type: 'text'
      })
      .expect(200)

    expect(response.body.bot_response).toMatch(/ubicación|dirección|encontramos/i)
  })
})

if (skipTests) {
  console.log('⚠️  Integration tests skipped: SUPABASE_URL and SUPABASE_ANON_KEY environment variables not set')
}
