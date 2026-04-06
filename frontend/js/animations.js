// ============================================================
// animations.js — Scroll reveal + parallax + microinteracciones
// ============================================================

// ——— REVEAL AL SCROLL (Intersection Observer) ————————————
export function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          // No desconectar para permitir re-animación si se desea
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
}

// ——— PARALLAX SUAVE EN HERO ——————————————————————————————
export function initHeroParallax() {
  const hero = document.getElementById('hero-content')
  if (!hero) return

  let ticking = false
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY
        if (y < window.innerHeight) {
          hero.style.transform = `translateY(${y * 0.25}px)`
          hero.style.opacity   = `${1 - y / (window.innerHeight * 0.8)}`
        }
        ticking = false
      })
      ticking = true
    }
  }, { passive: true })
}

// ——— COUNTER ANIMADO ————————————————————————————————————
export function animateCounter(el, target, duration = 1500, prefix = '', suffix = '') {
  const start     = 0
  const startTime = performance.now()

  const update = (currentTime) => {
    const elapsed  = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased    = 1 - Math.pow(1 - progress, 3) // ease-out cubic
    const current  = Math.round(start + (target - start) * eased)
    el.textContent = prefix + current.toLocaleString('es-CO') + suffix
    if (progress < 1) requestAnimationFrame(update)
  }

  requestAnimationFrame(update)
}

// ——— STATS COUNTER (auto-init) ———————————————————————————
export function initCounters() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target
          const target = parseInt(el.dataset.count, 10)
          const prefix = el.dataset.prefix ?? ''
          const suffix = el.dataset.suffix ?? ''
          animateCounter(el, target, 1600, prefix, suffix)
          observer.unobserve(el)
        }
      })
    },
    { threshold: 0.5 }
  )

  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el))
}

// ——— SMOOTH SCROLL PARA ANCHORS ——————————————————————————
export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'))
      if (target) {
        e.preventDefault()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })
}

// ——— INIT —————————————————————————————————————————————————
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal()
  initHeroParallax()
  initCounters()
  initSmoothScroll()
})
