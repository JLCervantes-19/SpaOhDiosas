// ============================================================
// main.js — Funcionalidades compartidas: navbar, WhatsApp, config
// ============================================================

// ——— CONFIGURACIÓN GLOBAL ——————————————————————————————————
// 👉 Personaliza aquí el nombre y número del spa
export const SPA_CONFIG = {
  nombre:    'Serenità Spa',
  tagline:   'Luxury Wellness',
  whatsapp:  '573001234567', // 👉 Reemplaza con el número real
  apiBase:   '/api',         // Base URL de la API
}

// ——— NAVBAR GLASSMORPHISM ——————————————————————————————————
export function initNavbar() {
  const navbar      = document.getElementById('navbar')
  const menuToggle  = document.getElementById('menu-toggle')
  const menuClose   = document.getElementById('menu-close')
  const mobileMenu  = document.getElementById('mobile-menu')
  if (!navbar) return

  // Efecto scroll
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  // Mobile menu
  let menuOpen = false
  
  menuToggle?.addEventListener('click', () => {
    menuOpen = !menuOpen
    mobileMenu?.classList.toggle('open', menuOpen)
  })
  
  menuClose?.addEventListener('click', () => {
    menuOpen = false
    mobileMenu?.classList.remove('open')
  })
  
  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false
      mobileMenu?.classList.remove('open')
    })
  })
}

// ——— WHATSAPP FLOTANTE ————————————————————————————————————
export function initWhatsApp() {
  const btn    = document.getElementById('wa-btn')
  const menu   = document.getElementById('wa-menu')
  if (!btn) return

  let open = false
  btn.addEventListener('click', () => {
    open = !open
    menu?.classList.toggle('open', open)
    btn.querySelector('.wa-icon')?.setAttribute('class', `wa-icon ${open ? 'hidden' : ''}`)
    btn.querySelector('.wa-close')?.setAttribute('class', `wa-close ${open ? '' : 'hidden'}`)
  })

  // Construir opciones
  const options = [
    { label: 'Agendar una cita',            msg: 'Hola%20quiero%20agendar%20una%20cita%20en%20el%20spa' },
    { label: 'Ver tratamientos disponibles', msg: 'Hola%20quisiera%20información%20sobre%20los%20tratamientos' },
    { label: 'Consultar precios',           msg: 'Hola%20me%20gustaría%20consultar%20los%20precios%20de%20los%20servicios' },
  ]

  if (menu) {
    menu.innerHTML = options.map(o =>
      `<a href="https://wa.me/${SPA_CONFIG.whatsapp}?text=${o.msg}"
          target="_blank" rel="noopener" class="wa-option">${o.label}</a>`
    ).join('')
  }

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu?.contains(e.target)) {
      open = false
      menu?.classList.remove('open')
    }
  })
}

// ——— FORMATO PRECIO ——————————————————————————————————————
export function formatPrice(n) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  }).format(n)
}

// ——— FETCH CON MANEJO DE ERRORES —————————————————————————
export async function fetchAPI(endpoint, options = {}) {
  try {
    const res  = await fetch(`${SPA_CONFIG.apiBase}${endpoint}`, options)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Error en la solicitud')
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

// ——— TOAST NOTIFICATION ——————————————————————————————————
export function showToast(message, type = 'success') {
  const existing = document.getElementById('toast')
  existing?.remove()

  const toast = document.createElement('div')
  toast.id = 'toast'
  toast.style.cssText = `
    position:fixed; bottom:88px; left:50%; transform:translateX(-50%) translateY(20px);
    z-index:9999; padding:12px 24px; font-family:var(--font-body); font-size:0.85rem;
    border-radius:2px; box-shadow:0 8px 32px rgba(0,0,0,0.15);
    transition:all 0.3s ease; opacity:0; white-space:nowrap;
    background:${type === 'error' ? '#fee2e2' : '#f0fdf4'};
    color:${type === 'error' ? '#991b1b' : '#14532d'};
    border:1px solid ${type === 'error' ? '#fca5a5' : '#bbf7d0'};
  `
  toast.textContent = message
  document.body.appendChild(toast)

  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateX(-50%) translateY(0)'
  })
  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => toast.remove(), 300)
  }, 5500)
}

// ——— CONFIG DINÁMICA DESDE BD ————————————————————————————
export async function loadConfig() {
  try {
    const res = await fetch(`${SPA_CONFIG.apiBase}/config`)
    if (!res.ok) return
    const cfg = await res.json()
    if (!cfg || !cfg.nombre_spa) return

    // Actualizar número WhatsApp globalmente
    if (cfg.whatsapp) {
      const waNum = cfg.whatsapp.replace(/[^0-9]/g, '')
      SPA_CONFIG.whatsapp = waNum

      const menu = document.getElementById('wa-menu')
      if (menu) {
        const options = [
          { label: 'Agendar una cita',            msg: 'Hola%20quiero%20agendar%20una%20cita%20en%20el%20spa' },
          { label: 'Ver tratamientos disponibles', msg: 'Hola%20quisiera%20información%20sobre%20los%20tratamientos' },
          { label: 'Consultar precios',            msg: 'Hola%20me%20gustaría%20consultar%20los%20precios%20de%20los%20servicios' },
        ]
        menu.innerHTML = options.map(o =>
          `<a href="https://wa.me/${waNum}?text=${o.msg}" target="_blank" rel="noopener" class="wa-option">${o.label}</a>`
        ).join('')
      }

      const ctaWaRegalo = document.getElementById('cta-wa-regalo')
      if (ctaWaRegalo) ctaWaRegalo.href = `https://wa.me/${waNum}?text=Hola%20me%20interesa%20un%20certificado%20de%20regalo`

      const contactWaBtn = document.getElementById('contact-wa-btn')
      if (contactWaBtn) contactWaBtn.href = `https://wa.me/${waNum}?text=Hola%20quiero%20agendar%20una%20cita`
    }

    const elTel = document.getElementById('contact-telefono')
    if (elTel && cfg.telefono) elTel.textContent = cfg.telefono

    const elDir = document.getElementById('contact-direccion')
    if (elDir && cfg.direccion) {
      const city = cfg.ciudad || ''
      elDir.innerHTML = cfg.direccion + (city ? `,<br>${city}` : '')
    }

    if (cfg.horario_atencion) {
      const elHerHorario = document.getElementById('hero-horario')
      if (elHerHorario) elHerHorario.textContent = cfg.horario_atencion

      const elConHorario = document.getElementById('contact-horario')
      if (elConHorario) elConHorario.textContent = cfg.horario_atencion
    }

    if (cfg.meta_title) document.title = cfg.meta_title
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc && cfg.meta_description) metaDesc.setAttribute('content', cfg.meta_description)

    // Colores de marca configurables desde el admin — antes estaban fijos
    // en spa.css y este endpoint los devolvía sin que nadie los leyera.
    const root = document.documentElement.style
    if (cfg.color_primario) root.setProperty('--purple-medium', cfg.color_primario)
    if (cfg.color_acento)   root.setProperty('--gold', cfg.color_acento)

  } catch (_) {
    // Fallo silencioso — valores hardcodeados permanecen
  }
}

// ——— INIT AL CARGAR ——————————————————————————————————————
document.addEventListener('DOMContentLoaded', () => {
  initNavbar()
  initWhatsApp()
  loadConfig()
})
