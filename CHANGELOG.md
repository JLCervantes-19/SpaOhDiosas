# 📝 Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [2.0.1] - 2026-04-12

### 🔧 Corregido

- **Responsividad móvil del chat**: Chat se descuadraba cuando aparecía/desaparecía el teclado
  - Implementado viewport mejorado con `maximum-scale` y `viewport-fit`
  - Fix específico para iOS Safari con `-webkit-fill-available`
  - JavaScript para manejar resize del viewport dinámicamente
  - Scroll suave cuando aparece/desaparece el teclado
  - Prevención de zoom accidental

### 📈 Mejorado

- **Elementos más compactos en móvil**: Mejor uso del espacio en pantalla
  - Header: padding 20px → 16px, avatar 56px → 48px
  - Mensajes: padding reducido, font 0.95rem → 0.9rem
  - Quick replies: más compactos, mejor espaciado
  - Input: altura mínima 44px para mejor touch

### 🎯 Beneficios

- Chat estable con teclado móvil
- Mejor UX en dispositivos móviles
- Compatible con iOS Safari
- Sin zoom accidental

---

## [2.0.0] - 2026-04-12

### ✨ Agregado

- **Cambio de fecha de citas en el chat**: Flujo completo para cambiar la fecha de una cita sin salir del chat
  - Selección de período (Esta semana, Este mes, Otro mes)
  - Selección de día disponible
  - Selección de horario disponible
  - Validación de disponibilidad en tiempo real
  - Confirmación y actualización en base de datos

- **Nuevos estados conversacionales**:
  - `CHOOSING_RESCHEDULE_PERIOD`
  - `CHOOSING_RESCHEDULE_DAY`
  - `CHOOSING_RESCHEDULE_TIME`

- **Nuevos métodos en chatbot**:
  - `handleReschedulePeriodChoice()`
  - `handleRescheduleDayChoice()`
  - `handleRescheduleTimeChoice()`
  - `getAvailableDays()`
  - `getAvailableTimesForDay()`

### 🔧 Corregido

- **Botón "Consultar mis citas"**: Ya no redirige a la página de reservas
  - Ajustado orden de prioridad en detección de intenciones
  - `appointments` se verifica antes que `booking`

- **Reglas de negocio**: Implementadas correctamente
  - Eliminada referencia a tabla `disponibilidad` inexistente
  - Implementado `SCHEDULE` hardcodeado
  - Domingos excluidos automáticamente (spa cerrado)
  - Buffer calculado correctamente (10 minutos)
  - Slots de 30 minutos
  - Horarios correctos: Lun-Vie 9:00-18:00, Sáb 9:00-16:00

- **Zona horaria**: Fechas se guardan correctamente
  - Agregado `'T12:00:00'` al crear objetos Date
  - Evita problemas de conversión UTC
  - Día guardado coincide con día seleccionado

- **Horarios de tarde**: Ahora visibles
  - Eliminado límite de 8 horarios (`.slice(0, 8)`)
  - Todos los horarios disponibles se muestran
  - Horarios de mañana Y tarde visibles

### 📈 Mejorado

- **Experiencia de usuario**: Flujo más intuitivo y completo
- **Validación de disponibilidad**: En tiempo real
- **Código**: Más mantenible y documentado
- **Documentación**: Reorganizada y consolidada en `docs/v2.0/`

### 🗂️ Documentación

- Creada estructura organizada en `docs/v2.0/`
- `README.md` - Inicio rápido y resumen
- `correcciones/CORRECCIONES_V2.md` - Todas las correcciones
- `flujos/FLUJOS_CHAT.md` - Diagramas y flujos
- `guias/GUIA_PRUEBAS.md` - Guía de pruebas
- Archivada documentación v1.0 en `docs/archivo_v1/`

### 🔄 Cambios Técnicos

**Archivos modificados**:
- `backend/services/chatbot.js` - 8 métodos modificados/agregados

**Métodos modificados**:
1. `detectIntent()` - Prioridad de intenciones
2. `getAvailableDays()` - SCHEDULE + zona horaria
3. `getAvailableTimesForDay()` - SCHEDULE + buffer + zona horaria
4. `handleReschedulePeriodChoice()` - Zona horaria + sin límite
5. `handleRescheduleDayChoice()` - Zona horaria + sin límite
6. `handleRescheduleTimeChoice()` - Buffer + sin límite
7. `handleDocumentProvided()` - Zona horaria
8. `checkAppointmentsByNameAndEmail()` - Obtiene buffer_min

---

## [1.0.0] - 2026-03-01

### ✨ Agregado

- Sistema de chat inteligente
- Sistema de reservas con calendario
- Gestión de citas (consulta, cancelación)
- Integración con Supabase
- Frontend responsive
- Deploy en Vercel

### 🎯 Características Iniciales

- Consulta de citas por nombre y email
- Cancelación de citas (con validación de 24h)
- Información de servicios
- Horarios y ubicación
- Certificados de regalo

---

## Tipos de Cambios

- `✨ Agregado` - Para nuevas funcionalidades
- `🔧 Corregido` - Para corrección de bugs
- `📈 Mejorado` - Para mejoras en funcionalidades existentes
- `🗑️ Eliminado` - Para funcionalidades eliminadas
- `🔒 Seguridad` - Para correcciones de seguridad
- `📝 Documentación` - Para cambios en documentación
- `🔄 Cambios Técnicos` - Para cambios técnicos internos

---

**Formato**: [MAJOR.MINOR.PATCH]
- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nuevas funcionalidades compatibles
- **PATCH**: Correcciones de bugs compatibles
