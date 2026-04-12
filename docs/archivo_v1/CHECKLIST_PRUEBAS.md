# ✅ Checklist de Pruebas - Gestión de Citas

## 🚀 Preparación

- [ ] Servidor iniciado con `npm start`
- [ ] Chat abierto en `http://localhost:3000/frontend/chat.html`
- [ ] Consola del navegador abierta (F12) para ver errores
- [ ] Terminal visible para ver logs del servidor
- [ ] Base de datos Supabase accesible

---

## 📝 Pruebas Básicas del Chat

### Inicio de Conversación
- [ ] Chat se abre correctamente
- [ ] Aparece mensaje de bienvenida
- [ ] Pide nombre al usuario
- [ ] Guarda el nombre cuando se proporciona
- [ ] Muestra menú principal después del nombre
- [ ] Menú tiene 5 opciones visibles

### Opciones del Menú
- [ ] "Ver servicios" funciona
- [ ] "Agendar cita" funciona
- [ ] "Consultar mis citas" funciona
- [ ] "Horarios y ubicación" funciona
- [ ] "Certificados de regalo" funciona

---

## 🔍 Pruebas de Consulta de Citas

### Flujo Normal
- [ ] Seleccionar "Consultar mis citas"
- [ ] Bot pide nombre completo
- [ ] Ingresar nombre (ej: "JHAN")
- [ ] Bot pide correo electrónico
- [ ] Ingresar email (ej: "jhan@example.com")
- [ ] Bot busca en base de datos
- [ ] Muestra citas futuras correctamente

### Formato de Citas
- [ ] Cada cita muestra fecha en español
- [ ] Cada cita muestra hora de inicio y fin
- [ ] Cada cita muestra nombre del servicio
- [ ] Cada cita muestra estado con emoji
- [ ] Citas están numeradas (1, 2, 3...)

### Botones de Acción
- [ ] Aparece botón "Cancelar cita"
- [ ] Aparece botón "Cambiar fecha"
- [ ] Aparece botón "Todo está bien"
- [ ] Botones son clickeables
- [ ] Botones tienen hover effect

---

## 🗑️ Pruebas de Cancelación

### Cancelación Exitosa (Con 24h)
- [ ] Hacer clic en "Cancelar cita"
- [ ] Bot pide número de cita
- [ ] Ingresar número válido (ej: "1")
- [ ] Bot valida que hay 24h de anticipación
- [ ] Bot muestra mensaje de confirmación
- [ ] Mensaje incluye nombre del servicio
- [ ] Mensaje incluye fecha de la cita
- [ ] Mensaje es cálido y profesional
- [ ] Aparecen botones post-cancelación
- [ ] Estado en BD cambia a 'cancelada'

### Cancelación Rechazada (Sin 24h)
- [ ] Intentar cancelar cita con < 24h
- [ ] Bot muestra mensaje de error
- [ ] Mensaje explica requisito de 24h
- [ ] Mensaje muestra teléfono: +57 300 123 4567
- [ ] Mensaje es amigable, no abrupto
- [ ] Aparecen botones: "Volver al menú", "Salir"
- [ ] Estado en BD NO cambia

### Validación de Número de Cita
- [ ] Ingresar número inválido (ej: "abc")
- [ ] Bot pide número válido
- [ ] Ingresar número fuera de rango (ej: "99")
- [ ] Bot indica que no existe esa cita

---

## 📅 Pruebas de Cambio de Fecha

### Cambio Exitoso (Con 24h)
- [ ] Hacer clic en "Cambiar fecha"
- [ ] Bot pide número de cita
- [ ] Ingresar número válido
- [ ] Bot valida que hay 24h de anticipación
- [ ] Bot muestra mensaje explicativo
- [ ] Mensaje indica redirección a reservas
- [ ] Redirige a `/reservas.html` después de 3 segundos

### Cambio Rechazado (Sin 24h)
- [ ] Intentar cambiar fecha con < 24h
- [ ] Bot muestra mensaje de error
- [ ] Mensaje explica requisito de 24h
- [ ] Mensaje muestra teléfono de contacto
- [ ] Aparecen botones: "Volver al menú", "Salir"

---

## 👍 Pruebas de "Todo Está Bien"

- [ ] Hacer clic en "Todo está bien"
- [ ] Bot muestra mensaje de confirmación
- [ ] Mensaje es cálido: "¡Perfecto! Nos vemos pronto..."
- [ ] Mensaje incluye información de contacto
- [ ] Mensaje incluye emojis apropiados (💜, ✨, 🌿)
- [ ] Aparecen botones: "Volver al menú", "Salir"

---

## 🚪 Pruebas de Opción "Salir"

- [ ] Hacer clic en "Salir"
- [ ] Bot muestra mensaje de despedida
- [ ] Mensaje es cálido y profesional
- [ ] Espera 2 segundos
- [ ] Redirige a `/index.html`
- [ ] localStorage se limpia (session_id)
- [ ] localStorage se limpia (user_name)

---

## 📭 Pruebas de Usuario Sin Citas

- [ ] Consultar con nombre/email sin citas
- [ ] Bot muestra mensaje apropiado
- [ ] Mensaje indica que no hay citas
- [ ] Mensaje ofrece agendar una cita
- [ ] Aparecen botones: "Sí, agendar", "No, gracias"
- [ ] "Sí, agendar" redirige a reservas

---

## 🔄 Pruebas de Flujo Completo

### Escenario 1: Cancelar y Salir
- [ ] Abrir chat
- [ ] Dar nombre
- [ ] Consultar citas
- [ ] Cancelar una cita
- [ ] Hacer clic en "Salir"
- [ ] Verificar redirección

### Escenario 2: Cambiar Fecha
- [ ] Abrir chat
- [ ] Dar nombre
- [ ] Consultar citas
- [ ] Cambiar fecha de cita
- [ ] Verificar redirección a reservas

### Escenario 3: Todo Bien y Volver
- [ ] Abrir chat
- [ ] Dar nombre
- [ ] Consultar citas
- [ ] "Todo está bien"
- [ ] "Volver al menú"
- [ ] Verificar que vuelve al menú principal

---

## 🗄️ Verificaciones en Base de Datos

### Después de Cancelación
```sql
SELECT id, fecha, hora_inicio, estado 
FROM citas 
WHERE id = '[ID_CITA_CANCELADA]';
```
- [ ] Estado es 'cancelada'
- [ ] Fecha y hora no cambiaron
- [ ] Otros campos intactos

### Sesiones de Chat
```sql
SELECT session_id, user_name, started_at, last_activity
FROM chat_sessions
ORDER BY started_at DESC
LIMIT 5;
```
- [ ] Sesión se creó correctamente
- [ ] user_name se guardó
- [ ] last_activity se actualiza

### Mensajes de Chat
```sql
SELECT sender, content, created_at
FROM chat_messages
WHERE session_id = '[TU_SESSION_ID]'
ORDER BY created_at ASC;
```
- [ ] Mensajes del usuario se guardan
- [ ] Mensajes del bot se guardan
- [ ] Orden cronológico correcto

---

## 🐛 Verificación de Errores

### Consola del Navegador
- [ ] No hay errores de JavaScript
- [ ] No hay warnings críticos
- [ ] Requests a API son exitosos (200)
- [ ] No hay errores de CORS

### Logs del Servidor
- [ ] No hay errores de conexión a BD
- [ ] No hay errores de sintaxis
- [ ] Requests se procesan correctamente
- [ ] Respuestas se envían correctamente

---

## 📱 Pruebas de Responsividad

### Mobile (< 768px)
- [ ] Chat ocupa fullscreen
- [ ] Botones son clickeables
- [ ] Texto es legible
- [ ] Scroll funciona correctamente
- [ ] Input es accesible

### Desktop (> 768px)
- [ ] Chat es floating (400x600px)
- [ ] Posición bottom-right
- [ ] No interfiere con contenido
- [ ] Animaciones suaves

---

## 🎨 Verificación de Estilo

### Colores
- [ ] Botones usan color lilac (#AD74C3)
- [ ] Hover effects funcionan
- [ ] Mensajes del bot: fondo blanco
- [ ] Mensajes del usuario: fondo lilac
- [ ] Emojis se muestran correctamente

### Animaciones
- [ ] Mensajes aparecen con fade-in
- [ ] Typing indicator tiene bounce
- [ ] Botones tienen hover effect
- [ ] Transiciones son suaves (< 300ms)

---

## ✅ Criterios de Éxito Final

- [ ] Todos los flujos funcionan sin errores
- [ ] Validación de 24h funciona correctamente
- [ ] Cancelaciones actualizan BD
- [ ] Mensajes son cálidos y profesionales
- [ ] No hay errores en consola
- [ ] No hay errores en servidor
- [ ] Opción "Salir" funciona correctamente
- [ ] Redirecciones funcionan
- [ ] Base de datos se actualiza correctamente
- [ ] Experiencia de usuario es fluida

---

## 📊 Resumen de Resultados

**Total de Pruebas**: ~80 items

**Completadas**: _____ / 80

**Errores Encontrados**: _____

**Errores Críticos**: _____

**Estado General**: 
- [ ] ✅ Todo funciona perfectamente
- [ ] ⚠️ Funciona con errores menores
- [ ] ❌ Requiere correcciones

---

## 📝 Notas y Observaciones

```
Escribe aquí cualquier observación, error encontrado, o mejora sugerida:

1. 

2. 

3. 

```

---

## 🚀 Siguiente Paso

Una vez completado este checklist:

- [ ] Revisar notas y observaciones
- [ ] Corregir errores encontrados (si los hay)
- [ ] Preparar para deploy a Vercel
- [ ] Probar en producción
- [ ] Obtener feedback de usuarios reales

---

**Fecha de Prueba**: ___________

**Probado por**: ___________

**Tiempo Total**: ___________ minutos

**Resultado**: ⭐⭐⭐⭐⭐
