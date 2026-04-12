# 🌿 Serenità Spa - Sistema de Gestión y Chat

Sistema completo de gestión de citas y chat inteligente para Serenità Spa.

## 🚀 Versión 2.0

Esta versión incluye mejoras significativas en el sistema de chat, correcciones críticas y nueva funcionalidad de cambio de fecha.

### ✨ Novedades v2.0

- ✅ Cambio de fecha de citas directamente en el chat
- ✅ Corrección de reglas de negocio (horarios, domingos, buffer)
- ✅ Corrección de zona horaria en fechas
- ✅ Todos los horarios disponibles visibles (mañana y tarde)
- ✅ Mejor experiencia de usuario

---

## 📚 Documentación

La documentación completa está en [`docs/v2.0/`](docs/v2.0/):

- **[README](docs/v2.0/README.md)** - Inicio rápido y resumen
- **[Correcciones](docs/v2.0/correcciones/CORRECCIONES_V2.md)** - Todas las correcciones implementadas
- **[Flujos del Chat](docs/v2.0/flujos/FLUJOS_CHAT.md)** - Diagramas y explicación de flujos
- **[Guía de Pruebas](docs/v2.0/guias/GUIA_PRUEBAS.md)** - Cómo probar el sistema

---

## 🏃 Inicio Rápido

### 1. Instalación

```bash
npm install
```

### 2. Configuración

Copia `.env.example` a `.env` y configura tus credenciales de Supabase:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
PORT=3000
```

### 3. Ejecutar

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

---

## 🎯 Características Principales

### Sistema de Chat Inteligente

- 💬 Consulta de citas por nombre y email
- 🗓️ Cambio de fecha de citas (NUEVO en v2.0)
- ❌ Cancelación de citas
- 📋 Información de servicios
- 📍 Horarios y ubicación
- 🎁 Certificados de regalo

### Sistema de Reservas

- 📅 Calendario interactivo
- ⏰ Selección de horarios disponibles
- 💳 Gestión de servicios
- 📧 Confirmación por email

### Reglas de Negocio

- **Horarios**: Lun-Vie 9:00-18:00, Sáb 9:00-16:00, Dom CERRADO
- **Slots**: Intervalos de 30 minutos
- **Buffer**: 10 minutos entre citas
- **Validación**: 24 horas de anticipación para cambios

---

## 🛠️ Stack Tecnológico

- **Backend**: Node.js + Express
- **Base de datos**: Supabase (PostgreSQL)
- **Frontend**: HTML + CSS + JavaScript vanilla
- **Hosting**: Vercel

---

## 📁 Estructura del Proyecto

```
SpaOhDiosas/
├── api/                    # API endpoints para Vercel
├── backend/
│   ├── lib/               # Configuración de Supabase
│   ├── routes/            # Rutas de la API
│   └── services/          # Lógica de negocio (chatbot, etc.)
├── frontend/
│   ├── css/               # Estilos
│   ├── js/                # JavaScript del frontend
│   └── *.html             # Páginas HTML
├── database/
│   └── migrations/        # Migraciones de BD
├── docs/
│   ├── v2.0/              # Documentación v2.0 (ACTUAL)
│   └── archivo_v1/        # Documentación antigua
├── data/                  # Datos estáticos (servicios, testimonios)
├── .env                   # Variables de entorno (no en Git)
├── .env.example           # Ejemplo de variables de entorno
├── package.json           # Dependencias
└── vercel.json            # Configuración de Vercel
```

---

## 🧪 Pruebas

Ver [Guía de Pruebas](docs/v2.0/guias/GUIA_PRUEBAS.md) para instrucciones detalladas.

### Pruebas Rápidas

```bash
# Probar detección de intenciones
node test_intent_detection.js

# Verificar conexión a BD
node database/migrations/test_connection.js
```

---

## 🚀 Deploy

### Vercel

El proyecto está configurado para deploy automático en Vercel:

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno en Vercel
3. Deploy automático en cada push a `main`

### Variables de Entorno en Vercel

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
```

---

## 📝 Changelog

### v2.0 (Abril 2026)

#### Nuevas Funcionalidades
- ✨ Cambio de fecha de citas en el chat

#### Correcciones
- 🐛 Botón "Consultar mis citas" funcionando correctamente
- 🐛 Reglas de negocio implementadas correctamente
- 🐛 Problema de zona horaria resuelto
- 🐛 Horarios de tarde ahora visibles

#### Mejoras
- 📈 Mejor experiencia de usuario en el chat
- 📈 Validación de disponibilidad en tiempo real
- 📈 Código más mantenible y documentado

### v1.0 (Marzo 2026)
- 🎉 Lanzamiento inicial

---

## 🤝 Contribuir

1. Lee la documentación en [`docs/v2.0/`](docs/v2.0/)
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Haz commit de tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crea un Pull Request

---

## 📞 Contacto

**Serenità Spa**  
📍 Carrera 1 # 2-3, Riohacha, La Guajira, Colombia  
📞 +57 300 123 4567  
🌐 [serenita-spa.vercel.app](https://serenita-spa.vercel.app)

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**Versión**: 2.0  
**Estado**: ✅ Estable  
**Última actualización**: Abril 2026
