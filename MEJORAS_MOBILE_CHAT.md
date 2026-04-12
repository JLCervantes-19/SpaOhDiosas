# 📱 Mejoras de Responsividad Móvil - Chat

## 🐛 Problema Identificado

Cuando el teclado aparece y desaparece en móvil, el chat se descuadra y queda mal posicionado.

**Causa**: El viewport cambia de tamaño cuando aparece el teclado, y el uso de `100vh` no se adapta correctamente en iOS Safari.

---

## ✅ Soluciones Implementadas

### 1. Viewport Mejorado

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

- `maximum-scale=1.0` - Previene zoom accidental
- `user-scalable=no` - Desactiva zoom manual
- `viewport-fit=cover` - Mejor ajuste en dispositivos con notch

### 2. Fix para iOS Safari

```css
html {
  height: -webkit-fill-available;
}

body {
  height: 100%;
  min-height: 100vh;
  min-height: -webkit-fill-available;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
}

.chat-container {
  height: 100vh;
  height: -webkit-fill-available;
}

@supports (-webkit-touch-callout: none) {
  body {
    height: 100vh;
    height: -webkit-fill-available;
  }
  
  .chat-container {
    height: 100vh;
    height: -webkit-fill-available;
  }
}
```

### 3. Elementos Más Compactos

**Header**:
- Padding: 20px → 16px
- Avatar: 56px → 48px
- Título: 1.4rem → 1.2rem

**Mensajes**:
- Padding: 24px 16px → 16px 12px
- Avatar: 36px → 32px
- Bubble padding: 12px 16px → 10px 14px
- Font size: 0.95rem → 0.9rem

**Quick Replies**:
- Padding: 10px 18px → 8px 14px
- Font size: 0.9rem → 0.85rem
- Gap: 8px → 6px

**Input**:
- Padding container: 16px → 12px
- Input padding: 14px 20px → 12px 16px
- Send button: 48px → 44px

### 4. Scroll Mejorado

```css
.chat-messages {
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
}
```

### 5. JavaScript para Manejar Teclado

```javascript
// Fix para viewport en móvil cuando aparece el teclado
function setViewportHeight() {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

// Establecer altura inicial
setViewportHeight()

// Actualizar en resize (con debounce)
let resizeTimer
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    setViewportHeight()
  }, 100)
})

// Scroll suave al input cuando se hace focus
chatInput.addEventListener('focus', (e) => {
  setTimeout(() => {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
})

// Scroll al final cuando se oculta el teclado
chatInput.addEventListener('blur', () => {
  setTimeout(() => {
    scrollToBottom()
  }, 300)
})
```

---

## 📊 Comparación: Antes vs Ahora

| Aspecto | Antes ❌ | Ahora ✅ |
|---------|---------|---------|
| **Viewport** | `100vh` fijo | `-webkit-fill-available` |
| **Body** | `height: 100vh` | `position: fixed` + altura dinámica |
| **Teclado** | Se descuadra | Se mantiene estable |
| **Scroll** | Problemas en iOS | Smooth scroll |
| **Tamaños** | Grandes | Más compactos |
| **Zoom** | Posible | Desactivado |

---

## 🧪 Cómo Probar

### En Móvil

1. Abre el chat en tu móvil
2. Toca el input para escribir
3. **Verifica**: El teclado aparece y el chat se mantiene bien posicionado
4. Escribe un mensaje
5. Envía el mensaje
6. **Verifica**: El teclado se oculta y el chat vuelve a su posición correcta
7. Repite varias veces

### Casos de Prueba

- [ ] Teclado aparece → Chat se mantiene
- [ ] Teclado desaparece → Chat vuelve a posición correcta
- [ ] Scroll funciona correctamente
- [ ] Mensajes se ven completos
- [ ] Quick replies se ven bien
- [ ] No hay zoom accidental
- [ ] Header siempre visible
- [ ] Input siempre accesible

---

## 🎯 Beneficios

1. **Estabilidad**: El chat no se descuadra con el teclado
2. **Mejor UX**: Elementos más compactos y accesibles
3. **iOS Compatible**: Funciona correctamente en Safari
4. **Smooth Scroll**: Transiciones suaves
5. **Sin Zoom**: No hay zoom accidental al tocar inputs

---

## 📝 Notas Técnicas

### Por qué `position: fixed` en body

En móvil, cuando aparece el teclado, el viewport cambia de tamaño. Con `position: fixed`, el body mantiene su tamaño original y el contenido se ajusta dentro de él.

### Por qué `-webkit-fill-available`

Es una propiedad específica de WebKit (Safari) que calcula la altura disponible real, excluyendo las barras del navegador.

### Por qué debounce en resize

El evento `resize` se dispara muchas veces cuando aparece/desaparece el teclado. El debounce evita cálculos innecesarios.

---

## ✅ Estado

**Cambios**: ✅ Implementados  
**Pruebas**: ⏳ Pendientes (usuario)  
**Archivo**: `frontend/chat.html`  
**Líneas modificadas**: ~50 líneas

---

**Fecha**: 2026-04-12  
**Versión**: 2.0.1 (hotfix)  
**Prioridad**: 🔴 ALTA (UX crítica en móvil)
