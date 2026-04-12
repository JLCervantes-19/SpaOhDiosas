# Chat Message Endpoint Implementation

## Overview
Implemented POST `/api/chat/message` endpoint for processing user messages in the internal chat system.

## Endpoint Details

### POST /api/chat/message

**Purpose:** Processes user messages, stores them in the database, and returns bot responses.

**Request Body:**
```json
{
  "session_id": "uuid",
  "user_name": "string (optional)",
  "message": "string (required)",
  "message_type": "text | quick_reply (optional, defaults to 'text')"
}
```

**Response:**
```json
{
  "bot_response": "string"
}
```

**Error Responses:**
- `400` - Missing required fields (session_id or message)
- `500` - Database error or unexpected error

## Implementation Features

### 1. Message Storage
- Saves user message to `chat_messages` table with sender='user'
- Saves bot response to `chat_messages` table with sender='bot'
- Updates `last_activity` timestamp in `chat_sessions` table
- Updates `user_name` in session if provided

### 2. Message Type Handling
- **Quick Reply:** Uses LocalResponseService for predefined options
- **Free Text:** Attempts N8N integration first, falls back to LocalResponseService

### 3. N8N Integration
- Checks if N8N webhook is configured via `N8N_CHAT_WEBHOOK` environment variable
- Sends message to N8N with session_id, user_name, and message
- Gracefully falls back to local responses if N8N fails or times out
- No user notification of fallback (seamless experience)

### 4. Local Response Fallback
- Recognizes intents: pricing, schedule, location, booking, service_inquiry
- Returns contextual Spanish responses based on keywords
- Provides variety by randomly selecting from multiple response options

## Requirements Satisfied

- ✅ 14.1: POST /api/chat/message endpoint implemented
- ✅ 14.2: Accepts session_id, user_name, message, message_type parameters
- ✅ 14.3: Returns bot response
- ✅ 14.7: Forwards free text to N8N if configured
- ✅ 10.2: N8N integration for free text messages
- ✅ 10.5: Local response fallback when N8N unavailable

## Testing

### Unit Tests (11 tests, all passing)
- ✅ Validates required fields (session_id, message)
- ✅ Saves user message to database
- ✅ Updates session last_activity
- ✅ Uses local responses for quick_reply messages
- ✅ Uses local responses when N8N not configured
- ✅ Uses N8N when configured and falls back on error
- ✅ Saves bot response to database
- ✅ Handles database errors gracefully

### Integration Tests (5 tests, skipped without credentials)
- ✅ Processes messages and returns bot responses
- ✅ Handles quick_reply messages
- ✅ Recognizes pricing intent
- ✅ Recognizes schedule intent
- ✅ Recognizes location intent

## Files Modified/Created

### Modified
- `backend/routes/chat.js` - Added POST /api/chat/message endpoint

### Created
- `backend/routes/chat.test.js` - Unit tests (updated with new tests)
- `backend/routes/chat.integration.test.js` - Integration tests
- `backend/routes/CHAT_MESSAGE_ENDPOINT.md` - This documentation

## Usage Example

```javascript
// Frontend code example
const response = await fetch('/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'abc-123-def-456',
    user_name: 'Juan',
    message: '¿Cuál es el precio de los masajes?',
    message_type: 'text'
  })
})

const data = await response.json()
console.log(data.bot_response)
// Output: "Los precios de nuestros servicios varían según el tratamiento..."
```

## Error Handling

The endpoint implements comprehensive error handling:

1. **Validation Errors:** Returns 400 with clear error message
2. **Database Errors:** Returns 500 with user-friendly message
3. **N8N Failures:** Silently falls back to local responses
4. **Session Update Errors:** Non-critical, continues processing

All errors are logged to console for debugging while maintaining a friendly user experience.

## Next Steps

This endpoint is ready for integration with the frontend chat panel. The frontend should:

1. Call POST /api/chat/session to create a session
2. Store session_id in localStorage
3. Call POST /api/chat/message for each user message
4. Display bot_response in the chat UI
5. Handle errors gracefully with user-friendly messages
