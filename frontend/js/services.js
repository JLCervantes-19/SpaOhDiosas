// ============================================================
// services.js — Carga y renderiza servicios desde la API
// ============================================================

import { fetchAPI, formatPrice, SPA_CONFIG } from './main.js'
import { initScrollReveal } from './animations.js'

function renderServiceCard(s, delay = 0) {
  const imagenUrl = s.imagen_url || s.imagen || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop'
  const catNombre = s.categoria_nombre || s.categoria || ''
  const catColor  = s.categoria_color  || '#AD74C3'

  return `
    <article class="service-card card-luxury overflow-hidden reveal delay-${delay}"
             data-id="${s.id}"
             data-categoria="${s.categoria_id || ''}"
             style="transition:opacity 0.35s ease,transform 0.35s ease">
      <div class="service-img">
        <img src="${imagenUrl}" alt="${s.nombre}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop'" />
        <div style="position:absolute;top:12px;right:12px;background:rgba(82,37,102,0.9);backdrop-filter:blur(8px);color:#FFFFFF;font-size:0.7rem;font-family:var(--font-body);letter-spacing:0.1em;padding:6px 12px;border-radius:6px;font-weight:500;">
          ${formatPrice(s.precio)}
        </div>
      </div>
      <div style="padding:24px">
        ${catNombre ? `<span class="cat-badge-card" style="color:${catColor};background:${catColor}15;border:1px solid ${catColor}30">${catNombre}</span>` : ''}
        <h3 class="font-display" style="font-size:1.15rem;color:var(--purple-dark);margin:8px 0;font-weight:500;line-height:1.3;transition:color 0.3s">${s.nombre}</h3>
        <p style="font-family:var(--font-body);font-size:0.82rem;color:var(--text-medium);line-height:1.6;margin-bottom:16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${s.descripcion || 'Tratamiento de spa premium'}</p>
        <div style="display:flex;align-items:center;gap:6px;font-family:var(--font-body);font-size:0.75rem;color:var(--lilac);margin-bottom:16px;font-weight:500">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          ${s.duracion_min} min
        </div>
        <a href="reservas.html?servicio=${s.id}" class="btn-gold" style="font-size:0.65rem;padding:10px 20px;display:inline-flex;gap:6px;align-items:center">
          Reservar
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </article>
  `
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${alpha})`
}

function renderFilterBubbles(categorias, allServices) {
  const wrapper = document.getElementById('categorias-filter')
  if (!wrapper) return

  const usedIds = new Set(allServices.map(s => s.categoria_id).filter(Boolean))
  const activas = categorias.filter(c => usedIds.has(c.id))

  wrapper.innerHTML = `
    <button class="cat-pill active" data-cat="todos">
      <span>Todos</span>
      <em class="pill-count">${allServices.length}</em>
    </button>
    ${activas.map(c => {
      const count = allServices.filter(s => s.categoria_id === c.id).length
      return `
        <button class="cat-pill" data-cat="${c.id}"
          style="border-color:${c.color};color:${c.color}">
          <span>${c.nombre}</span>
          <em class="pill-count">${count}</em>
        </button>`
    }).join('')}
  `

  wrapper.querySelectorAll('.cat-pill').forEach(btn => {
    const isCategory = btn.dataset.cat !== 'todos'
    if (isCategory) {
      const color = btn.style.color
      btn.addEventListener('mouseenter', () => {
        if (!btn.classList.contains('active')) {
          btn.style.background = hexToRgba(color, 0.09)
          btn.style.transform  = 'translateY(-2px)'
          btn.style.boxShadow  = `0 4px 14px ${hexToRgba(color, 0.22)}`
        }
      })
      btn.addEventListener('mouseleave', () => {
        if (!btn.classList.contains('active')) {
          btn.style.background = 'transparent'
          btn.style.transform  = ''
          btn.style.boxShadow  = ''
        }
      })
    }

    btn.addEventListener('click', () => {
      wrapper.querySelectorAll('.cat-pill').forEach(b => {
        b.classList.remove('active')
        if (b.dataset.cat !== 'todos') {
          b.style.background = 'transparent'
          b.style.color      = b.getAttribute('data-orig-color') || b.style.borderColor
          b.style.transform  = ''
          b.style.boxShadow  = ''
        }
      })

      btn.classList.add('active')
      if (isCategory) {
        const color = btn.style.borderColor
        btn.setAttribute('data-orig-color', color)
        btn.style.background = color
        btn.style.color      = '#fff'
        btn.style.transform  = 'translateY(-2px)'
        btn.style.boxShadow  = `0 4px 20px ${hexToRgba(color, 0.35)}`
      }

      filterServicios(btn.dataset.cat, allServices)
    })
  })

  const counter = document.getElementById('servicios-counter')
  if (counter) counter.textContent = `${allServices.length} rituales disponibles`
}

function filterServicios(catId, allServices) {
  const grid    = document.getElementById('servicios-grid-full')
  const counter = document.getElementById('servicios-counter')
  if (!grid) return

  // Filtrado real: solo se renderizan las tarjetas de la categoría activa,
  // así la grilla se reacomoda sin dejar espacios vacíos
  const visibles = catId === 'todos'
    ? allServices
    : allServices.filter(s => s.categoria_id === catId)

  grid.innerHTML = visibles.map((s, i) => renderServiceCard(s, (i % 3) + 1)).join('')

  grid.querySelectorAll('article[data-id]').forEach((card, i) => {
    card.classList.remove('reveal')
    card.classList.add('filtro-enter')
    card.style.animationDelay = `${Math.min(i * 60, 420)}ms`
  })

  if (counter) {
    const n = visibles.length
    counter.textContent = `${n} ritual${n !== 1 ? 'es' : ''} disponible${n !== 1 ? 's' : ''}`
  }
}

function renderSkeletons(count, container) {
  container.innerHTML = Array(count).fill(0).map(() => `
    <div class="skeleton" style="height:380px;border-radius:0"></div>
  `).join('')
}

// ——— Sección HOME: muestra los primeros 4 ————————————————
export async function loadServiciosHome() {
  const container = document.getElementById('servicios-grid-home')
  if (!container) return

  renderSkeletons(4, container)
  const { data, error } = await fetchAPI('/services')
  if (error || !data?.length) {
    container.innerHTML = `<p style="color:rgba(28,28,30,0.4);font-family:var(--font-body);text-align:center;grid-column:1/-1;padding:40px 0">No hay servicios disponibles.</p>`
    return
  }

  container.innerHTML = data.slice(0, 4).map((s, i) => renderServiceCard(s, Math.min(i + 1, 5))).join('')
  initScrollReveal()
}

// ——— Página SERVICIOS: muestra todos + filtros ——————————
export async function loadServiciosFull() {
  const container = document.getElementById('servicios-grid-full')
  if (!container) return

  renderSkeletons(6, container)

  const [{ data: servicios, error }, { data: categorias }] = await Promise.all([
    fetchAPI('/services'),
    fetchAPI('/services/categories'),
  ])

  if (error || !servicios?.length) {
    container.innerHTML = `<p style="color:rgba(28,28,30,0.4);font-family:var(--font-body);text-align:center;grid-column:1/-1;padding:60px 0">No hay servicios disponibles.</p>`
    return
  }

  renderFilterBubbles(categorias || [], servicios)
  container.innerHTML = servicios.map((s, i) => renderServiceCard(s, (i % 3) + 1)).join('')
  initScrollReveal()
}

// ——— SELECT para el form de reservas ————————————————————
export async function loadServiciosSelect(selectEl) {
  if (!selectEl) return
  const { data } = await fetchAPI('/services')
  if (!data?.length) return

  selectEl.innerHTML = `<option value="">— Elige tu ritual —</option>` +
    data.map(s => `<option value="${s.id}" data-duracion="${s.duracion_min}">${s.nombre} · ${formatPrice(s.precio)}</option>`).join('')
}

// ——— Testimonios dinámicos ———————————————————————————————
export async function loadTestimonios() {
  const container = document.getElementById('testimonios-grid')
  if (!container) return

  const { data, error } = await fetchAPI('/testimonials')

  if (error) {
    container.innerHTML = `<p style="color:rgba(255,255,255,0.6);font-family:var(--font-body);text-align:center;grid-column:1/-1;padding:40px 0">Error cargando testimonios</p>`
    return
  }

  if (!data?.length) {
    container.innerHTML = `<p style="color:rgba(255,255,255,0.6);font-family:var(--font-body);text-align:center;grid-column:1/-1;padding:40px 0">No hay testimonios disponibles.</p>`
    return
  }

  container.innerHTML = data.map((t, i) => `
    <div class="testimonial-card reveal delay-${i + 1}" style="padding:32px;position:relative">
      <svg style="position:absolute;top:24px;right:24px;opacity:0.08;width:48px;height:48px;color:var(--lilac)" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.301-3.995 5.847h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.301-3.996 5.847h3.983v10h-9.983z"/></svg>
      <div class="stars">${'<span class="star">★</span>'.repeat(t.rating || 5)}</div>
      <p class="font-display" style="font-size:1.05rem;color:var(--text-dark);line-height:1.65;margin:16px 0 24px;font-style:italic;font-weight:300">"${t.texto}"</p>
      <div style="border-top:1px solid rgba(173,116,195,0.15);padding-top:16px">
        <p style="font-family:var(--font-body);color:var(--purple-dark);font-size:0.85rem;font-weight:600">${t.nombre}</p>
      </div>
    </div>
  `).join('')

  initScrollReveal()
}
