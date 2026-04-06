// ============================================================
// bookings.js — Sistema de agendamiento paso a paso
// ============================================================

import { fetchAPI, formatPrice, SPA_CONFIG, showToast } from './main.js'
import { loadServiciosSelect } from './services.js'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

// Estado del formulario
const state = {
  step:       1,
  servicioId: null,
  fecha:      null,
  hora:       null,
  nombre:     '',
  telefono:   '',
  email:      '',
  notas:      '',
  servicios:  [],
}

// ——— NAVEGACIÓN DE PASOS ——————————————————————————————————
function goToStep(n) {
  state.step = n
  document.querySelectorAll('.booking-step').forEach((el, i) => {
    el.style.display = (i + 1 === n) ? 'block' : 'none'
  })
  updateStepIndicators()
  window.scrollTo({ top: document.getElementById('booking-section')?.offsetTop - 80, behavior: 'smooth' })
}

function updateStepIndicators() {
  document.querySelectorAll('.step-indicator').forEach((el, i) => {
    const n = i + 1
    el.classList.remove('active', 'done')
    if (n < state.step)      el.classList.add('done')
    else if (n === state.step) el.classList.add('active')

    // Ícono
    if (n < state.step) {
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>`
    } else {
      el.innerHTML = `<span style="font-family:var(--font-body);font-size:0.7rem;color:${n === state.step ? 'var(--gold)' : 'rgba(28,28,30,0.3)'}">${n}</span>`
    }
  })
}

// ——— PASO 1: SELECCIÓN DE SERVICIO ——————————————————————
function renderStep1() {
  const container = document.getElementById('step1-servicios')
  if (!container || !state.servicios.length) return

  container.innerHTML = state.servicios.map(s => `
    <button class="service-select-btn" data-id="${s.id}" style="
      width:100%;text-align:left;padding:20px;background:white;
      border:1px solid rgba(201,169,97,0.15);cursor:pointer;
      transition:all 0.3s ease;font-family:var(--font-body);display:flex;
      justify-content:space-between;align-items:flex-start;gap:16px;
      ${state.servicioId === s.id ? 'border-color:var(--gold);background:rgba(201,169,97,0.04)' : ''}
    ">
      <div style="flex:1">
        <h4 class="font-display" style="font-size:1rem;color:var(--forest);font-weight:400;margin-bottom:4px">${s.nombre}</h4>
        <p style="font-size:0.78rem;color:rgba(28,28,30,0.5);line-height:1.5;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden">${s.descripcion}</p>
        <p style="font-size:0.7rem;color:rgba(201,169,97,0.6);margin-top:6px;display:flex;align-items:center;gap:4px">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          ${s.duracion_min} min
        </p>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <p style="color:var(--gold);font-size:0.9rem;font-weight:500">${formatPrice(s.precio)}</p>
        <div style="width:20px;height:20px;border-radius:50%;border:2px solid rgba(201,169,97,0.3);margin-top:8px;margin-left:auto;
          background:${state.servicioId === s.id ? 'var(--gold)' : 'transparent'};
          display:flex;align-items:center;justify-content:center;transition:all 0.3s">
          ${state.servicioId === s.id ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" stroke="var(--forest)" stroke-width="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>' : ''}
        </div>
      </div>
    </button>
  `).join('')

  container.querySelectorAll('.service-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.servicioId = btn.dataset.id
      renderStep1() // re-render para actualizar selección
    })
  })
}

// ——— PASO 2: FECHA & HORA ————————————————————————————————
function getAvailableDates() {
  const dates = []
  const now = new Date()
  
  // Configurar zona horaria de Colombia (UTC-5)
  const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
  const currentHour = colombiaTime.getHours()
  
  // Si son más de las 18:00 (6 PM), empezar desde 2 días adelante
  // Si no, empezar desde mañana
  const startDay = currentHour >= 18 ? 2 : 1
  
  for (let i = startDay; dates.length < 15; i++) {
    const d = new Date(colombiaTime)
    d.setDate(colombiaTime.getDate() + i)
    // Excluir domingos (día 0)
    if (d.getDay() !== 0) dates.push(d)
  }
  return dates
}

function formatDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function renderDates() {
  const container = document.getElementById('fechas-grid')
  if (!container) return

  const dates = getAvailableDates()
  container.innerHTML = dates.map(d => {
    const key      = formatDateKey(d)
    const selected = state.fecha === key
    return `
      <button class="date-btn ${selected ? 'selected' : ''}" data-fecha="${key}" style="
        ${selected ? 'background:var(--forest);border-color:var(--forest);color:var(--cream)' : ''}
      ">
        <div style="font-family:var(--font-body);font-size:0.65rem;text-transform:uppercase;letter-spacing:0.1em;opacity:0.6;margin-bottom:2px">${DIAS[d.getDay()]}</div>
        <div class="font-display" style="font-size:1.4rem;${selected ? 'color:var(--gold)' : 'color:var(--forest)'}">${d.getDate()}</div>
        <div style="font-family:var(--font-body);font-size:0.6rem;text-transform:uppercase;opacity:0.5">${MESES[d.getMonth()]}</div>
      </button>
    `
  }).join('')

  container.querySelectorAll('.date-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      state.fecha = btn.dataset.fecha
      state.hora  = null
      renderDates()
      await loadSlots()
    })
  })
}

async function loadSlots() {
  const container = document.getElementById('slots-section')
  const grid      = document.getElementById('slots-grid')
  if (!container || !grid || !state.fecha || !state.servicioId) return

  container.style.display = 'block'
  grid.innerHTML = Array(8).fill(0).map(() => `<div class="skeleton" style="height:40px"></div>`).join('')

  const { data, error } = await fetchAPI(`/slots?servicio=${state.servicioId}&fecha=${state.fecha}`)
  if (error || !data?.length) {
    grid.innerHTML = `<p style="font-family:var(--font-body);font-size:0.85rem;color:rgba(28,28,30,0.4);grid-column:1/-1;padding:16px 0">No hay horarios disponibles para este día.</p>`
    return
  }

  grid.innerHTML = data.map(slot => `
    <button class="slot-btn ${!slot.disponible ? '' : ''} ${state.hora === slot.hora ? 'selected' : ''}"
      data-hora="${slot.hora}" ${!slot.disponible ? 'disabled' : ''}>
      ${slot.hora}
    </button>
  `).join('')

  grid.querySelectorAll('.slot-btn:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      state.hora = btn.dataset.hora
      grid.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
    })
  })
}

// ——— PASO 3: DATOS PERSONALES ————————————————————————————
function renderResumen() {
  const el = document.getElementById('resumen-reserva')
  if (!el) return

  const servicio = state.servicios.find(s => s.id === state.servicioId)
  if (!servicio || !state.fecha || !state.hora) return

  const fecha = new Date(state.fecha + 'T12:00')
  const fechaStr = `${DIAS[fecha.getDay()]} ${fecha.getDate()} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][fecha.getMonth()]}`

  el.innerHTML = `
    <div style="background:rgba(44,74,46,0.04);border:1px solid rgba(201,169,97,0.12);padding:16px 20px;margin-bottom:24px">
      <p style="font-family:var(--font-accent);font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(28,28,30,0.4);margin-bottom:10px">Resumen de tu reserva</p>
      <p class="font-display" style="font-size:1.1rem;color:var(--forest);margin-bottom:4px">${servicio.nombre}</p>
      <p style="font-family:var(--font-body);font-size:0.85rem;color:rgba(28,28,30,0.55);text-transform:capitalize">${fechaStr} · ${state.hora}</p>
      <p style="font-family:var(--font-body);font-size:0.9rem;color:var(--gold);font-weight:500;margin-top:6px">${formatPrice(servicio.precio)}</p>
    </div>
  `
}

// ——— ENVÍO DEL FORMULARIO —————————————————————————————————
async function submitReserva() {
  const btn = document.getElementById('btn-confirmar')
  state.nombre   = document.getElementById('input-nombre')?.value.trim()    ?? ''
  state.telefono = document.getElementById('input-telefono')?.value.trim()  ?? ''
  state.email    = document.getElementById('input-email')?.value.trim()     ?? ''
  state.notas    = document.getElementById('input-notas')?.value.trim()     ?? ''

  // Validaciones
  if (!state.nombre || !state.telefono) {
    showToast('Por favor completa nombre y teléfono', 'error')
    return
  }

  // Validar email si se proporcionó
  if (state.email && !state.email.includes('@')) {
    showToast('Por favor ingresa un email válido con @', 'error')
    return
  }

  // Validar teléfono (mínimo 7 dígitos)
  const telefonoNumeros = state.telefono.replace(/\D/g, '')
  if (telefonoNumeros.length < 7) {
    showToast('Por favor ingresa un teléfono válido', 'error')
    return
  }

  btn.disabled = true
  btn.textContent = 'Confirmando...'

  const { data, error } = await fetchAPI('/bookings', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre:      state.nombre,
      telefono:    state.telefono,
      email:       state.email,
      servicio_id: state.servicioId,
      fecha:       state.fecha,
      hora_inicio: state.hora,
      notas:       state.notas,
      origen:      'web',
    }),
  })

  btn.disabled = false
  btn.textContent = 'Confirmar reserva'

  if (error) {
    showToast(error, 'error')
    return
  }

  goToStep(4)
  renderConfirmacion(data)
}

// ——— PASO 4: CONFIRMACIÓN ————————————————————————————————
function renderConfirmacion(cita) {
  const servicio = state.servicios.find(s => s.id === state.servicioId)
  const fecha    = new Date((state.fecha ?? cita?.fecha) + 'T12:00')
  const waText   = encodeURIComponent(`Hola, acabo de reservar ${servicio?.nombre ?? 'una cita'} para el ${fecha.toLocaleDateString('es-CO')} a las ${state.hora}`)

  const el = document.getElementById('confirmacion-content')
  if (!el) return

  el.innerHTML = `
    <h2 class="font-display" style="font-size:2.2rem;color:var(--purple-dark);margin-bottom:12px;font-weight:400">¡Reserva confirmada!</h2>
    <p style="font-family:var(--font-body);color:var(--text-medium);margin-bottom:36px;font-size:0.95rem">Tu cita ha sido registrada. Te contactaremos para confirmar.</p>

    <div style="background:var(--white);border:2px solid var(--lilac);border-radius:12px;padding:28px;text-align:left;margin-bottom:32px;box-shadow:0 4px 20px rgba(173,116,195,0.15)">
      <p style="font-family:var(--font-accent);font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--lilac);margin-bottom:20px;font-weight:600">Detalle de tu reserva</p>
      ${[
        ['Servicio', servicio?.nombre],
        ['Fecha', fecha.toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })],
        ['Hora', state.hora],
        ['Valor', formatPrice(servicio?.precio ?? 0)],
        ['Nombre', state.nombre],
      ].map(([k,v]) => `
        <div style="display:flex;justify-content:space-between;font-family:var(--font-body);font-size:0.9rem;padding:12px 0;border-bottom:1px solid rgba(173,116,195,0.1)">
          <span style="color:var(--text-medium);font-weight:500">${k}</span>
          <span style="color:var(--purple-dark);font-weight:600;text-transform:capitalize">${v}</span>
        </div>
      `).join('')}
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      <button class="btn-gold" style="width:100%;justify-content:center" onclick="location.reload()">Agendar otra cita</button>
      <a href="https://wa.me/${SPA_CONFIG.whatsapp}?text=${waText}" target="_blank" rel="noopener"
         style="display:flex;align-items:center;justify-content:center;gap:10px;padding:16px;border:2px solid #25D366;background:rgba(37,211,102,0.05);color:#16a34a;font-family:var(--font-body);font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;transition:all 0.3s;border-radius:8px;font-weight:500"
         onmouseover="this.style.background='rgba(37,211,102,0.15)';this.style.borderColor='#16a34a'" onmouseout="this.style.background='rgba(37,211,102,0.05)';this.style.borderColor='#25D366'">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.526 5.847L.057 23.5l5.816-1.524A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.868 9.868 0 01-5.034-1.378l-.361-.214-3.741.98.999-3.648-.235-.374A9.851 9.851 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106S21.894 6.58 21.894 12 17.42 21.894 12 21.894z"/></svg>
        Confirmar por WhatsApp
      </a>
    </div>
  `
}

// ——— INIT BOOKING ————————————————————————————————————————
export async function initBooking() {
  const section = document.getElementById('booking-section')
  if (!section) return

  // Cargar servicios
  const { data } = await fetchAPI('/services')
  state.servicios = data ?? []

  // Preselección por URL param
  const params = new URLSearchParams(window.location.search)
  const preselect = params.get('servicio')
  if (preselect && state.servicios.find(s => s.id === preselect)) {
    state.servicioId = preselect
  }

  // Render inicial
  renderStep1()
  renderDates()
  goToStep(state.servicioId ? 2 : 1)

  // Botón "Siguiente" paso 1
  document.getElementById('btn-paso1')?.addEventListener('click', () => {
    if (!state.servicioId) { showToast('Por favor selecciona un servicio', 'error'); return }
    renderDates()
    goToStep(2)
  })

  // Botón "Siguiente" paso 2
  document.getElementById('btn-paso2')?.addEventListener('click', () => {
    if (!state.fecha) { showToast('Por favor selecciona una fecha', 'error'); return }
    if (!state.hora)  { showToast('Por favor selecciona un horario', 'error'); return }
    renderResumen()
    goToStep(3)
  })

  // Botones "Atrás"
  document.getElementById('btn-back-2')?.addEventListener('click', () => goToStep(1))
  document.getElementById('btn-back-3')?.addEventListener('click', () => goToStep(2))

  // Envío
  document.getElementById('btn-confirmar')?.addEventListener('click', submitReserva)
}
