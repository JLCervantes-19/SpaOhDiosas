// ============================================================
// backend/routes/chat.test.js — Unit tests for chat routes
// ============================================================

const request = require('supertest')
const express = require('express')

// Mock supabase
const mockSupabase = {
  from: jest.fn()
}

jest.mock('../lib/supabase', () => mockSupabase)

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123')
}))

// Mock N8N Service
const mockN8NService = {
  isConfigured: jest.fn(() => false),
  sendMessage: jest.fn()
}

jest.mock('../services/n8n', () => {
  return jest.fn().mockImplementation(() => mockN8NService)
})

// Mock Local Response Service
const mockLocalResponseService = {
  getResponse: jest.fn((message) => `Respuesta local para: ${message}`)
}

jest.mock('../services/localResponses', () => {
  return jest.fn().mockImplementation(() => mockLocalResponseService)
})

const chatRouter = require('./chat')

describe('POST /api/chat/session', () => {
  let app

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/chat', chatRouter)
    jest.clearAllMocks()

    // Default mock for session creation
    mockSupabase.from.mockReturnValue({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              session_id: 'test-uuid-123',
              started_at: '2024-01-01T00:00:00.000Z'
            },
            error: null
          }))
        }))
      }))
    })
  })

  it('should create a new chat session and return session_id and started_at', async () => {
    const response = await request(app)
      .post('/api/chat/session')
      .expect(201)

    expect(response.body).toHaveProperty('session_id')
    expect(response.body).toHaveProperty('started_at')
    expect(response.body.session_id).toBe('test-uuid-123')
  })

  it('should return 500 if database error occurs', async () => {
    mockSupabase.from.mockReturnValueOnce({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Database error' }
          }))
        }))
      }))
    })

    const response = await request(app)
      .post('/api/chat/session')
      .expect(500)

    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('Error creando sesión de chat')
  })
})

describe('GET /api/chat/services', () => {
  let app

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/chat', chatRouter)
    jest.clearAllMocks()
  })

  it('should return list of active services', async () => {
    const mockServices = [
      {
        id: '1',
        nombre: 'Masaje Relajante',
        descripcion: 'Masaje de cuerpo completo',
        precio: 150000,
        duracion_min: 60,
        activo: true
      },
      {
        id: '2',
        nombre: 'Facial Hidratante',
        descripcion: 'Tratamiento facial profundo',
        precio: 120000,
        duracion_min: 45,
        activo: true
      }
    ]

    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: mockServices,
          error: null
        }))
      }))
    })

    const response = await request(app)
      .get('/api/chat/services')
      .expect(200)

    expect(response.body).toEqual(mockServices)
    expect(mockSupabase.from).toHaveBeenCalledWith('servicios')
  })

  it('should filter only active services', async () => {
    const selectMock = jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({
        data: [],
        error: null
      }))
    }))

    mockSupabase.from.mockReturnValue({
      select: selectMock
    })

    await request(app)
      .get('/api/chat/services')
      .expect(200)

    expect(selectMock).toHaveBeenCalledWith('*')
  })

  it('should return empty array when no services found', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      }))
    })

    const response = await request(app)
      .get('/api/chat/services')
      .expect(200)

    expect(response.body).toEqual([])
  })

  it('should return empty array when data is null', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: null,
          error: null
        }))
      }))
    })

    const response = await request(app)
      .get('/api/chat/services')
      .expect(200)

    expect(response.body).toEqual([])
  })

  it('should return 500 if database error occurs', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: null,
          error: { message: 'Database connection failed' }
        }))
      }))
    })

    const response = await request(app)
      .get('/api/chat/services')
      .expect(500)

    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('Error consultando servicios')
    expect(response.body.message).toBe('No se pudieron cargar los servicios')
  })

  it('should handle unexpected errors gracefully', async () => {
    mockSupabase.from.mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    const response = await request(app)
      .get('/api/chat/services')
      .expect(500)

    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('Error inesperado')
    expect(response.body.message).toBe('Ocurrió un error al consultar los servicios')
  })
})

describe('POST /api/chat/message', () => {
  let app

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/chat', chatRouter)
    jest.clearAllMocks()

    // Default mock for message operations
    mockSupabase.from.mockReturnValue({
      insert: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: {}, error: null }))
      }))
    })
  })

  it('should return 400 if session_id is missing', async () => {
    const response = await request(app)
      .post('/api/chat/message')
      .send({ message: 'Hola' })
      .expect(400)

    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('Faltan campos requeridos')
  })

  it('should return 400 if message is missing', async () => {
    const response = await request(app)
      .post('/api/chat/message')
      .send({ session_id: 'test-uuid-123' })
      .expect(400)

    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('Faltan campos requeridos')
  })

  it('should save user message to database', async () => {
    const insertMock = jest.fn(() => Promise.resolve({ data: {}, error: null }))
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'chat_messages') {
        return { insert: insertMock }
      }
      return {
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: {}, error: null }))
        }))
      }
    })

    await request(app)
      .post('/api/chat/message')
      .send({
        session_id: 'test-uuid-123',
        user_name: 'Juan',
        message: 'Hola',
        message_type: 'text'
      })
      .expect(200)

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        session_id: 'test-uuid-123',
        sender: 'user',
        content: 'Hola',
        message_type: 'text'
      })
    )
  })

  it('should update last_activity in session', async () => {
    const updateMock = jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: {}, error: null }))
    }))
    
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'chat_messages') {
        return { insert: jest.fn(() => Promise.resolve({ data: {}, error: null })) }
      }
      if (table === 'chat_sessions') {
        return { update: updateMock }
      }
    })

    await request(app)
      .post('/api/chat/message')
      .send({
        session_id: 'test-uuid-123',
        user_name: 'Juan',
        message: 'Hola'
      })
      .expect(200)

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        last_activity: expect.any(String),
        user_name: 'Juan'
      })
    )
  })

  it('should use local responses for quick_reply messages', async () => {
    mockLocalResponseService.getResponse.mockReturnValueOnce('Respuesta local')

    const response = await request(app)
      .post('/api/chat/message')
      .send({
        session_id: 'test-uuid-123',
        message: 'Ver servicios',
        message_type: 'quick_reply'
      })
      .expect(200)

    expect(mockLocalResponseService.getResponse).toHaveBeenCalledWith('Ver servicios')
    expect(response.body.bot_response).toBe('Respuesta local')
  })

  it('should use local responses when N8N is not configured', async () => {
    mockN8NService.isConfigured.mockReturnValueOnce(false)
    mockLocalResponseService.getResponse.mockReturnValueOnce('Respuesta local para texto libre')

    const response = await request(app)
      .post('/api/chat/message')
      .send({
        session_id: 'test-uuid-123',
        message: '¿Cuál es el precio?',
        message_type: 'text'
      })
      .expect(200)

    expect(mockLocalResponseService.getResponse).toHaveBeenCalledWith('¿Cuál es el precio?')
    expect(response.body.bot_response).toBe('Respuesta local para texto libre')
  })

  it('should use N8N when configured and fallback on error', async () => {
    mockN8NService.isConfigured.mockReturnValueOnce(true)
    mockN8NService.sendMessage.mockRejectedValueOnce(new Error('N8N timeout'))
    mockLocalResponseService.getResponse.mockReturnValueOnce('Respuesta de fallback')

    const response = await request(app)
      .post('/api/chat/message')
      .send({
        session_id: 'test-uuid-123',
        user_name: 'Juan',
        message: 'Pregunta compleja',
        message_type: 'text'
      })
      .expect(200)

    expect(mockN8NService.sendMessage).toHaveBeenCalledWith('test-uuid-123', 'Juan', 'Pregunta compleja')
    expect(mockLocalResponseService.getResponse).toHaveBeenCalledWith('Pregunta compleja')
    expect(response.body.bot_response).toBe('Respuesta de fallback')
  })

  it('should save bot response to database', async () => {
    const insertMock = jest.fn(() => Promise.resolve({ data: {}, error: null }))
    let callCount = 0
    
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'chat_messages') {
        callCount++
        return { insert: insertMock }
      }
      return {
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: {}, error: null }))
        }))
      }
    })

    await request(app)
      .post('/api/chat/message')
      .send({
        session_id: 'test-uuid-123',
        message: 'Hola'
      })
      .expect(200)

    // Should be called twice: once for user message, once for bot message
    expect(insertMock).toHaveBeenCalledTimes(2)
    expect(insertMock).toHaveBeenNthCalledWith(2, 
      expect.objectContaining({
        sender: 'bot',
        message_type: 'text'
      })
    )
  })

  it('should return 500 if saving user message fails', async () => {
    mockSupabase.from.mockReturnValue({
      insert: jest.fn(() => Promise.resolve({ 
        data: null, 
        error: { message: 'Database error' } 
      }))
    })

    const response = await request(app)
      .post('/api/chat/message')
      .send({
        session_id: 'test-uuid-123',
        message: 'Hola'
      })
      .expect(500)

    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('Error guardando mensaje')
  })
})

describe('POST /api/chat/appointments', () => {
  let app

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/chat', chatRouter)
    jest.clearAllMocks()
  })

  it('should return 400 if documento is missing', async () => {
    const response = await request(app)
      .post('/api/chat/appointments')
      .send({})
      .expect(400)

    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('Campo requerido faltante')
    expect(response.body.message).toBe('El documento es obligatorio')
  })

  it('should return empty array if no client found for documento', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: null,
            error: { message: 'No rows found' }
          }))
        }))
      }))
    })

    const response = await request(app)
      .post('/api/chat/appointments')
      .send({ documento: '123456789' })
      .expect(200)

    expect(response.body).toHaveProperty('appointments')
    expect(response.body.appointments).toEqual([])
    expect(response.body.message).toBe('No se encontraron citas para este documento')
  })

  it('should return appointments with service details for valid documento', async () => {
    const mockCliente = { id: 'cliente-uuid-123' }
    const mockAppointments = [
      {
        id: 'cita-1',
        fecha: '2024-02-15',
        hora_inicio: '10:00',
        hora_fin: '11:00',
        estado: 'confirmada',
        notas: 'Primera cita',
        duracion_total: 60,
        servicios: {
          nombre: 'Masaje Relajante',
          descripcion: 'Masaje de cuerpo completo',
          precio: 150000,
          duracion_min: 60
        }
      },
      {
        id: 'cita-2',
        fecha: '2024-02-10',
        hora_inicio: '14:00',
        hora_fin: '15:00',
        estado: 'completada',
        notas: null,
        duracion_total: 60,
        servicios: {
          nombre: 'Facial Hidratante',
          descripcion: 'Tratamiento facial',
          precio: 120000,
          duracion_min: 45
        }
      }
    ]

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'clientes') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: mockCliente,
                error: null
              }))
            }))
          }))
        }
      }
      if (table === 'citas') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({
                  data: mockAppointments,
                  error: null
                }))
              }))
            }))
          }))
        }
      }
    })

    const response = await request(app)
      .post('/api/chat/appointments')
      .send({ documento: '123456789' })
      .expect(200)

    expect(response.body).toHaveProperty('appointments')
    expect(response.body.appointments).toHaveLength(2)
    expect(response.body.appointments[0]).toMatchObject({
      id: 'cita-1',
      fecha: '2024-02-15',
      hora_inicio: '10:00',
      hora_fin: '11:00',
      estado: 'confirmada',
      servicio_nombre: 'Masaje Relajante',
      servicio_precio: 150000
    })
  })

  it('should handle appointments with missing service data gracefully', async () => {
    const mockCliente = { id: 'cliente-uuid-123' }
    const mockAppointments = [
      {
        id: 'cita-1',
        fecha: '2024-02-15',
        hora_inicio: '10:00',
        hora_fin: '11:00',
        estado: 'pendiente',
        notas: null,
        duracion_total: 60,
        servicios: null
      }
    ]

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'clientes') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: mockCliente,
                error: null
              }))
            }))
          }))
        }
      }
      if (table === 'citas') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({
                  data: mockAppointments,
                  error: null
                }))
              }))
            }))
          }))
        }
      }
    })

    const response = await request(app)
      .post('/api/chat/appointments')
      .send({ documento: '123456789' })
      .expect(200)

    expect(response.body.appointments[0].servicio_nombre).toBe('Servicio no disponible')
  })

  it('should return empty array when client has no appointments', async () => {
    const mockCliente = { id: 'cliente-uuid-123' }

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'clientes') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: mockCliente,
                error: null
              }))
            }))
          }))
        }
      }
      if (table === 'citas') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({
                  data: [],
                  error: null
                }))
              }))
            }))
          }))
        }
      }
    })

    const response = await request(app)
      .post('/api/chat/appointments')
      .send({ documento: '123456789' })
      .expect(200)

    expect(response.body.appointments).toEqual([])
  })

  it('should return 500 if database error occurs when fetching appointments', async () => {
    const mockCliente = { id: 'cliente-uuid-123' }

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'clientes') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: mockCliente,
                error: null
              }))
            }))
          }))
        }
      }
      if (table === 'citas') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({
                  data: null,
                  error: { message: 'Database connection failed' }
                }))
              }))
            }))
          }))
        }
      }
    })

    const response = await request(app)
      .post('/api/chat/appointments')
      .send({ documento: '123456789' })
      .expect(500)

    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('Error consultando citas')
    expect(response.body.message).toBe('No se pudieron cargar las citas')
  })

  it('should handle unexpected errors gracefully', async () => {
    mockSupabase.from.mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    const response = await request(app)
      .post('/api/chat/appointments')
      .send({ documento: '123456789' })
      .expect(500)

    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('Error inesperado')
    expect(response.body.message).toBe('Ocurrió un error al consultar las citas')
  })

  it('should order appointments by fecha and hora_inicio descending', async () => {
    const mockCliente = { id: 'cliente-uuid-123' }
    const orderMock = jest.fn(() => Promise.resolve({
      data: [],
      error: null
    }))

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'clientes') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: mockCliente,
                error: null
              }))
            }))
          }))
        }
      }
      if (table === 'citas') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                order: orderMock
              }))
            }))
          }))
        }
      }
    })

    await request(app)
      .post('/api/chat/appointments')
      .send({ documento: '123456789' })
      .expect(200)

    expect(orderMock).toHaveBeenCalledWith('hora_inicio', { ascending: false })
  })
})
