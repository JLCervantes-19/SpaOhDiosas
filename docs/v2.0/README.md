# 📚 Documentación Serenità Spa - Versión 2.0

## 🎯 Resumen de la Versión 2.0

Esta versión incluye correcciones críticas y nuevas funcionalidades para el sistema de chat del spa.

### ✨ Nuevas Funcionalidades

1. **Cambio de fecha de citas en el chat**
   - Flujo completo guiado (período → día → hora)
   - Sin necesidad de redirigir a la página de reservas
   - Validación de disponibilidad en tiempo real

### 🔧 Correcciones Implementadas

1. **Botón "Consultar mis citas"** - Corregido para no redirigir a reservas
2. **Reglas de negocio** - Horarios correctos, domingos excluidos, buffer calculado
3. **Zona horaria** - Fechas se guardan correctamente
4. **Horarios de tarde** - Todos los horarios disponibles se muestran

---

## 📂 Estructura de Documentación

```
docs/v2.0/
├── README.md (este archivo)
├── correcciones/
│   └── CORRECCIONES_V2.md - Todas las correcciones implementadas
├── flujos/
│   └── FLUJOS_CHAT.md - Flujos conversacionales del chatbot
└── guias/
    ├── GUIA_DESARROLLO.md - Guía para desarrolladores
    └── GUIA_PRUEBAS.md - Cómo probar el sistema
```

---

## 🚀 Inicio Rápido

### 1. Instalación

```bash
npm install
```

### 2. Configuración

Copia `.env.example` a `.env` y configura:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 3. Ejecutar

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

---

## 🔑 Características Principales

### Sistema de Chat Inteligente

- ✅ Consulta de citas por nombre y email
- ✅ Cancelación de citas (con validación de 24h)
- ✅ Cambio de fecha de citas (NUEVO en v2.0)
- ✅ Información de servicios
- ✅ Horarios y ubicación

### Reglas de Negocio

- **Horarios**: Lun-Vie 9:00-18:00, Sáb 9:00-16:00, Dom CERRADO
- **Slots**: Intervalos de 30 minutos
- **Buffer**: 10 minutos entre citas
- **Validación**: 24 horas de anticipación para cambios

---

## 📖 Documentación Detallada

- **[Correcciones v2.0](correcciones/CORRECCIONES_V2.md)** - Todas las correcciones implementadas
- **[Flujos del Chat](flujos/FLUJOS_CHAT.md)** - Diagramas y explicación de flujos
- **[Guía de Desarrollo](guias/GUIA_DESARROLLO.md)** - Para desarrolladores
- **[Guía de Pruebas](guias/GUIA_PRUEBAS.md)** - Cómo probar el sistema

---

## 🛠️ Stack Tecnológico

- **Backend**: Node.js + Express
- **Base de datos**: Supabase (PostgreSQL)
- **Frontend**: HTML + CSS + JavaScript vanilla
- **Hosting**: Vercel

---

## 📝 Changelog v2.0

### Nuevas Funcionalidades
- ✨ Cambio de fecha de citas en el chat

### Correcciones
- 🐛 Botón "Consultar mis citas" funcionando correctamente
- 🐛 Reglas de negocio implementadas correctamente
- 🐛 Problema de zona horaria resuelto
- 🐛 Horarios de tarde ahora visibles

### Mejoras
- 📈 Mejor experiencia de usuario en el chat
- 📈 Validación de disponibilidad en tiempo real
- 📈 Código más mantenible y documentado

---

## 🤝 Contribuir

Para contribuir al proyecto:

1. Lee la [Guía de Desarrollo](guias/GUIA_DESARROLLO.md)
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Crea un Pull Request

---

## 📞 Soporte

Para reportar bugs o solicitar features, contacta al equipo de desarrollo.

---

**Versión**: 2.0  
**Fecha**: Abril 2026  
**Estado**: ✅ Estable
