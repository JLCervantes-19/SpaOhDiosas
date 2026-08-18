import express from 'express';
import { timingSafeEqual } from 'crypto';
import getSupabaseClient, { EMPRESA_ID } from '../config/supabase.js';

const router = express.Router();

// Solo por header (no query string, que queda expuesto en logs/referrer) y
// comparación timing-safe (evita filtrar el token por diferencia de tiempo).
function requireAdmin(req, res, next) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return res.status(403).json({ error: 'Admin no configurado' });
  const provided = req.headers['x-admin-token'] || '';
  const a = Buffer.from(provided);
  const b = Buffer.from(adminToken);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  next();
}

const DIA_KEYS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

const HORARIO_FALLBACK = {
  lunes:     { open: '09:00', close: '18:00', activo: true  },
  martes:    { open: '09:00', close: '18:00', activo: true  },
  miercoles: { open: '09:00', close: '18:00', activo: true  },
  jueves:    { open: '09:00', close: '18:00', activo: true  },
  viernes:   { open: '09:00', close: '18:00', activo: true  },
  sabado:    { open: '09:00', close: '16:00', activo: true  },
  domingo:   { open: '09:00', close: '16:00', activo: false },
};

function timeToMin(t) {
  const [h, m] = t.slice(0, 5).split(':').map(Number);
  return h * 60 + m;
}
function minToTime(m) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
function cruzan(s1, e1, s2, e2) {
  return timeToMin(s1) < timeToMin(e2) && timeToMin(e1) > timeToMin(s2);
}

async function getHorarioSpa() {
  const supabase = getSupabaseClient();
  try {
    const { data } = await supabase
      .from('configuracion')
      .select('horario_semana, slot_duracion_min, reserva_anticip_min_horas, reserva_anticip_max_dias, buffer_min')
      .eq('empresa_id', EMPRESA_ID)
      .limit(1)
      .single();
    return {
      horario: data?.horario_semana || HORARIO_FALLBACK,
      slotMin: data?.slot_duracion_min || 30,
      anticipMinHoras: data?.reserva_anticip_min_horas ?? 2,
      anticipMaxDias: data?.reserva_anticip_max_dias ?? 60,
      bufferDefault: data?.buffer_min ?? 10,
    };
  } catch (err) {
    console.error('Error obteniendo configuración del spa, usando defaults:', err);
    return { horario: HORARIO_FALLBACK, slotMin: 30, anticipMinHoras: 2, anticipMaxDias: 60, bufferDefault: 10 };
  }
}

// Fecha y hora actuales en la zona horaria del spa (Bogotá)
function ahoraBogota() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  const fecha = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return { fecha, minutos: now.getHours() * 60 + now.getMinutes() };
}

// ¿El slot cumple la anticipación mínima (horas) respecto al momento actual?
function cumpleAnticipacion(fecha, horaSlot, anticipMinHoras) {
  const ahora = ahoraBogota();
  if (fecha > ahora.fecha) return true;
  if (fecha < ahora.fecha) return false;
  return timeToMin(horaSlot) >= ahora.minutos + anticipMinHoras * 60;
}

// ¿La fecha está dentro del máximo de días de anticipación permitidos?
function dentroDeAnticipacionMaxima(fecha, anticipMaxDias) {
  const ahora = ahoraBogota();
  const limite = new Date(`${ahora.fecha}T00:00:00`);
  limite.setDate(limite.getDate() + anticipMaxDias);
  const limiteStr = `${limite.getFullYear()}-${String(limite.getMonth() + 1).padStart(2, '0')}-${String(limite.getDate()).padStart(2, '0')}`;
  return fecha <= limiteStr;
}

const ESTADOS_OCUPAN_SLOT = '(cancelada_cliente,cancelada_admin,no_asistio)';

async function getCandidatas(servicioId) {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('empleado_servicios')
    .select('empleado_id, empleados(id, nombre, apellido, activo)')
    .eq('servicio_id', servicioId)
    .eq('empresa_id', EMPRESA_ID);

  if (!data?.length) return [];
  return data.map(a => a.empleados).filter(e => e && e.activo === true);
}

async function getCitasPorEmpleada(fecha, empleadaIds) {
  if (!empleadaIds.length) return {};
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('citas')
    .select('empleado_id, hora_inicio, hora_fin')
    .eq('fecha', fecha)
    .eq('empresa_id', EMPRESA_ID)
    .not('estado', 'in', ESTADOS_OCUPAN_SLOT)
    .in('empleado_id', empleadaIds);

  const mapa = {};
  empleadaIds.forEach(id => { mapa[id] = []; });
  (data || []).forEach(c => {
    if (c.empleado_id && mapa[c.empleado_id]) mapa[c.empleado_id].push(c);
  });
  return mapa;
}

async function getBloqueosPorEmpleada(fecha, empleadaIds) {
  if (!empleadaIds.length) return {};
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('bloqueos')
    .select('empleado_id, hora_inicio, hora_fin')
    .eq('empresa_id', EMPRESA_ID)
    .lte('fecha_inicio', fecha)
    .gte('fecha_fin', fecha);

  const mapa = {};
  empleadaIds.forEach(id => { mapa[id] = []; });
  (data || []).forEach(b => {
    if (b.empleado_id === null) {
      empleadaIds.forEach(id => mapa[id].push(b));
    } else if (mapa[b.empleado_id] !== undefined) {
      mapa[b.empleado_id].push(b);
    }
  });
  return mapa;
}

function empleadaEstaLibre(citasEmpleada, bloqueosEmpleada, slotStart, slotEnd) {
  if (citasEmpleada.some(c => cruzan(slotStart, slotEnd, c.hora_inicio, c.hora_fin))) return false;
  return !bloqueosEmpleada.some(b => {
    if (!b.hora_inicio) return true;
    return cruzan(slotStart, slotEnd, b.hora_inicio.slice(0, 5), (b.hora_fin || '23:59').slice(0, 5));
  });
}

function fechaLegible(fecha) {
  const d = new Date(fecha + 'T12:00:00');
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}
function horaLegible(hora) {
  const [h, m] = hora.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

async function sugerirHorarios(servicioId, fechaBase, max = 3) {
  const supabase = getSupabaseClient();
  const { data: svc } = await supabase
    .from('servicios')
    .select('duracion_min, buffer_min')
    .eq('id', servicioId)
    .eq('empresa_id', EMPRESA_ID)
    .single();
  if (!svc) return [];

  const candidatas = await getCandidatas(servicioId);
  if (!candidatas.length) return [];

  const { horario, bufferDefault } = await getHorarioSpa();
  const totalMin = svc.duracion_min + (svc.buffer_min ?? bufferDefault);
  const empleadaIds = candidatas.map(e => e.id);
  const sugerencias = [];
  const base = new Date(fechaBase + 'T12:00:00');

  for (let i = 1; i <= 14 && sugerencias.length < max; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const fecha = d.toISOString().split('T')[0];
    const diaKey = DIA_KEYS[d.getDay()];
    const diaConf = horario[diaKey];
    if (!diaConf?.activo) continue;

    const [citas, bloqueos] = await Promise.all([
      getCitasPorEmpleada(fecha, empleadaIds),
      getBloqueosPorEmpleada(fecha, empleadaIds),
    ]);

    let cursor = timeToMin(diaConf.open);
    const fin = timeToMin(diaConf.close);

    while (cursor + totalMin <= fin && sugerencias.length < max) {
      const slotStart = minToTime(cursor);
      const slotEnd = minToTime(cursor + totalMin);
      const hayLibre = candidatas.some(e =>
        empleadaEstaLibre(citas[e.id] || [], bloqueos[e.id] || [], slotStart, slotEnd)
      );
      if (hayLibre) {
        sugerencias.push({
          fecha,
          hora: slotStart,
          label: `${fechaLegible(fecha)} a las ${horaLegible(slotStart)}`,
        });
      }
      cursor += totalMin;
    }
  }
  return sugerencias;
}

// GET /api/slots?servicio=id&fecha=YYYY-MM-DD
router.get('/', async (req, res) => {
  const supabase = getSupabaseClient();
  const { servicio, fecha, empleadaId } = req.query;
  if (!servicio || !fecha) {
    return res.status(400).json({ error: 'Parámetros requeridos: servicio, fecha' });
  }

  const { data: svc } = await supabase
    .from('servicios')
    .select('id, duracion_min, buffer_min')
    .eq('id', servicio)
    .eq('empresa_id', EMPRESA_ID)
    .single();
  if (!svc) return res.status(404).json({ error: 'Servicio no encontrado' });

  const config = await getHorarioSpa();
  const totalMin = svc.duracion_min + (svc.buffer_min ?? config.bufferDefault);
  const date = new Date(fecha + 'T12:00:00');
  const diaKey = DIA_KEYS[date.getDay()];
  const diaConf = config.horario[diaKey];
  if (!diaConf?.activo) {
    res.set('Cache-Control', 'no-store');
    return res.json({ cerrado: true, slots: [] });
  }
  if (!dentroDeAnticipacionMaxima(fecha, config.anticipMaxDias)) {
    res.set('Cache-Control', 'no-store');
    return res.json({ cerrado: false, slots: [] });
  }

  let candidatas = await getCandidatas(servicio);
  // Reserva manual desde el admin: restringe la consulta a una sola
  // empleada específica en vez de "cualquiera asignada al servicio",
  // reutilizando exactamente la misma lógica de horario/buffer/anticipación.
  if (empleadaId) candidatas = candidatas.filter(e => e.id === empleadaId);
  if (!candidatas.length) {
    res.set('Cache-Control', 'no-store');
    return res.json({ cerrado: false, slots: [] });
  }

  const empleadaIds = candidatas.map(e => e.id);
  const [citas, bloqueos] = await Promise.all([
    getCitasPorEmpleada(fecha, empleadaIds),
    getBloqueosPorEmpleada(fecha, empleadaIds),
  ]);

  const slots = [];
  let cursor = timeToMin(diaConf.open);
  const finDia = timeToMin(diaConf.close);

  while (cursor + totalMin <= finDia) {
    const slotStart = minToTime(cursor);
    const slotEnd = minToTime(cursor + totalMin);
    const libres = candidatas.filter(e =>
      empleadaEstaLibre(citas[e.id] || [], bloqueos[e.id] || [], slotStart, slotEnd)
    ).length;
    const disponible = libres > 0 && cumpleAnticipacion(fecha, slotStart, config.anticipMinHoras);
    slots.push({ hora: slotStart, disponible, capacidad: libres });
    cursor += totalMin;
  }

  res.set('Cache-Control', 'no-store');
  res.json({ cerrado: false, slots });
});

// POST /api/bookings
router.post('/', async (req, res) => {
  const supabase = getSupabaseClient();
  const { nombre, telefono, email, servicio_id, fecha, hora_inicio, notas, origen } = req.body;

  if (!nombre || !telefono || !servicio_id || !fecha || !hora_inicio) {
    return res.status(400).json({
      error: 'Campos requeridos: nombre, telefono, servicio_id, fecha, hora_inicio',
    });
  }

  const { data: svc } = await supabase
    .from('servicios')
    .select('*')
    .eq('id', servicio_id)
    .eq('activo', true)
    .eq('empresa_id', EMPRESA_ID)
    .single();
  if (!svc) return res.status(404).json({ error: 'Servicio no encontrado o inactivo' });

  const configSpa = await getHorarioSpa();

  // Regla de anticipación mínima (configurable desde el dashboard, por defecto 2 horas).
  // Aplica también a reservas del mismo día.
  if (!cumpleAnticipacion(fecha, hora_inicio, configSpa.anticipMinHoras)) {
    return res.status(422).json({
      error: `Las reservas requieren mínimo ${configSpa.anticipMinHoras} horas de anticipación. Por favor elige un horario más tarde u otro día.`,
      horarios_sugeridos: [],
    });
  }

  // Regla de anticipación máxima (configurable, por defecto 60 días).
  if (!dentroDeAnticipacionMaxima(fecha, configSpa.anticipMaxDias)) {
    return res.status(422).json({
      error: `Las reservas solo pueden hacerse hasta con ${configSpa.anticipMaxDias} días de anticipación.`,
      horarios_sugeridos: [],
    });
  }

  // El día debe estar abierto según el horario configurado en el dashboard
  const diaConfReserva = configSpa.horario[DIA_KEYS[new Date(fecha + 'T12:00:00').getDay()]];
  if (!diaConfReserva?.activo) {
    return res.status(422).json({ error: 'El spa está cerrado ese día. Por favor elige otra fecha.', horarios_sugeridos: [] });
  }

  const duracion_total = svc.duracion_min + (svc.buffer_min ?? configSpa.bufferDefault);
  const hora_fin = minToTime(timeToMin(hora_inicio) + duracion_total);

  const candidatas = await getCandidatas(servicio_id);
  if (!candidatas.length) {
    return res.status(409).json({
      error: 'Este servicio no tiene personal disponible en este momento. Por favor contáctanos directamente.',
      horarios_sugeridos: [],
    });
  }

  const empleadaIds = candidatas.map(e => e.id);
  const [citasDia, bloqueosDia] = await Promise.all([
    getCitasPorEmpleada(fecha, empleadaIds),
    getBloqueosPorEmpleada(fecha, empleadaIds),
  ]);

  const disponibles = candidatas.filter(e =>
    empleadaEstaLibre(citasDia[e.id] || [], bloqueosDia[e.id] || [], hora_inicio, hora_fin)
  );

  if (!disponibles.length) {
    const sugerencias = await sugerirHorarios(servicio_id, fecha);
    const textoSug = sugerencias.length
      ? ` Te sugerimos: ${sugerencias.map(s => s.label).join(' · ')}.`
      : ' Por favor elige otra fecha o contáctanos.';
    return res.status(409).json({
      error: `No hay disponibilidad para ${svc.nombre} el ${fechaLegible(fecha)} a las ${horaLegible(hora_inicio)}.${textoSug}`,
      horarios_sugeridos: sugerencias,
    });
  }

  // ── Balanceo de carga ─────────────────────────────────────
  // Se asigna a la empleada con MENOS citas de ESTE servicio en los
  // últimos 30 días (excluyendo canceladas y no asistió).
  // Si hay empate, se elige al azar entre las empatadas.
  const hace30 = new Date();
  hace30.setDate(hace30.getDate() - 30);
  const fecha30 = hace30.toISOString().split('T')[0];

  const disponiblesIds = disponibles.map(e => e.id);
  const { data: cargaMes } = await supabase
    .from('citas')
    .select('empleado_id')
    .in('empleado_id', disponiblesIds)
    .eq('servicio_id', servicio_id)
    .eq('empresa_id', EMPRESA_ID)
    .not('estado', 'in', ESTADOS_OCUPAN_SLOT)
    .gte('fecha', fecha30);

  const cargaMesMap = {};
  disponiblesIds.forEach(id => { cargaMesMap[id] = 0; });
  (cargaMes || []).forEach(c => { if (cargaMesMap[c.empleado_id] !== undefined) cargaMesMap[c.empleado_id]++; });

  const conCarga = disponibles.map(e => ({
    ...e,
    citas_servicio_mes: cargaMesMap[e.id] || 0,
  }));
  const minCarga = Math.min(...conCarga.map(e => e.citas_servicio_mes));
  const empatadas = conCarga.filter(e => e.citas_servicio_mes === minCarga);
  const asignada = empatadas[Math.floor(Math.random() * empatadas.length)];

  // ── Deduplicación de clientes ─────────────────────────────
  // Busca coincidencia por teléfono O email antes de crear un registro.
  // Si teléfono y email apuntan a registros distintos, se usa el más
  // completo (más campos con datos) y la reserva se vincula a ese perfil.
  const emailNorm = email ? email.toLowerCase().trim() : '';
  const telDigits = telefono.replace(/\D/g, '');
  // Los números locales tienen 10 dígitos; si vienen más (código de país
  // pegado, ej. "+57 300 123 4567" -> "573001234567"), nos quedamos con
  // los últimos 10 para que distintos formatos del mismo número coincidan.
  const telNorm = telDigits.length > 10 ? telDigits.slice(-10) : telDigits;
  let cliente_id = null;

  const filtros = [`telefono.eq.${telNorm}`];
  if (emailNorm) filtros.push(`email.eq.${emailNorm}`);

  const { data: coincidencias } = await supabase
    .from('clientes')
    .select('id, nombre, telefono, email, fecha_nacimiento, alergias, notas')
    .eq('empresa_id', EMPRESA_ID)
    .or(filtros.join(','));

  if (coincidencias?.length) {
    const completitud = c =>
      ['nombre', 'telefono', 'email', 'fecha_nacimiento', 'alergias', 'notas']
        .filter(k => c[k] != null && String(c[k]).trim() !== '').length;
    const elegido = [...coincidencias].sort((a, b) => completitud(b) - completitud(a))[0];
    cliente_id = elegido.id;

    // Completar datos faltantes del perfil existente sin sobrescribir los que ya tiene
    const patch = {};
    if (emailNorm && !elegido.email) patch.email = emailNorm;
    if (telNorm && !elegido.telefono) patch.telefono = telNorm;
    if (Object.keys(patch).length) {
      await supabase.from('clientes').update(patch).eq('id', cliente_id).eq('empresa_id', EMPRESA_ID);
    }
  } else {
    const { data: nuevoC, error: cErr } = await supabase
      .from('clientes')
      .insert({ nombre, telefono: telNorm, email: emailNorm, origen: origen ?? 'web', empresa_id: EMPRESA_ID })
      .select()
      .single();
    if (cErr) return res.status(500).json({ error: 'Error al registrar cliente' });
    cliente_id = nuevoC.id;
  }

  const { data: citasFinales } = await supabase
    .from('citas')
    .select('hora_inicio, hora_fin')
    .eq('fecha', fecha)
    .eq('empleado_id', asignada.id)
    .eq('empresa_id', EMPRESA_ID)
    .not('estado', 'in', ESTADOS_OCUPAN_SLOT);

  const yaOcupado = (citasFinales || []).some(c =>
    cruzan(hora_inicio, hora_fin, c.hora_inicio, c.hora_fin)
  );

  if (yaOcupado) {
    const sugerencias = await sugerirHorarios(servicio_id, fecha);
    return res.status(409).json({
      error: 'Este horario acaba de ser reservado. Por favor elige otro.',
      horarios_sugeridos: sugerencias,
    });
  }

  const { data: cita, error: citaError } = await supabase
    .from('citas')
    .insert({
      cliente_id,
      servicio_id,
      empleado_id: asignada.id,
      fecha,
      hora_inicio,
      hora_fin,
      duracion_total,
      estado: 'confirmada',
      origen: origen ?? 'web',
      notas: notas ?? '',
      empresa_id: EMPRESA_ID,
    })
    .select()
    .single();

  if (citaError) {
    console.error('Error al insertar cita:', citaError);
    return res.status(500).json({ error: 'Error al crear la reserva. Intenta de nuevo.' });
  }

  res.status(201).json({
    ...cita,
    cliente: { nombre, telefono, email },
    servicio: svc.nombre,
    empleada: { nombre: asignada.nombre, apellido: asignada.apellido },
    message: '¡Reserva confirmada!',
  });
});

// GET /api/bookings/all (admin)
router.get('/all', requireAdmin, async (req, res) => {
  const supabase = getSupabaseClient();
  const { fecha } = req.query;
  let query = supabase
    .from('citas')
    .select('*, clientes(nombre,telefono,email), servicios(nombre,precio), empleados(nombre,apellido)')
    .eq('empresa_id', EMPRESA_ID)
    .order('fecha', { ascending: false })
    .order('hora_inicio', { ascending: true });
  if (fecha) query = query.eq('fecha', fecha);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/bookings/:id/status (admin)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  const supabase = getSupabaseClient();
  const { estado } = req.body;
  const validos = ['pendiente','confirmada','completada','no_asistio','cancelada_cliente','cancelada_admin'];
  if (!validos.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Usa: ${validos.join(', ')}` });
  }
  const { data, error } = await supabase
    .from('citas')
    .update({ estado })
    .eq('id', req.params.id)
    .eq('empresa_id', EMPRESA_ID)
    .select()
    .single();
  if (error) return res.status(404).json({ error: 'Cita no encontrada' });
  res.json(data);
});

export default router;
