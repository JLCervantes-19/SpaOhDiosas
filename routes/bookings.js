import express from 'express';
import getSupabaseClient from '../config/supabase.js';

const router = express.Router();

function requireAdmin(req, res, next) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return res.status(403).json({ error: 'Admin no configurado' });
  const provided = req.headers['x-admin-token'] || req.query.admin_token;
  if (provided !== adminToken) return res.status(401).json({ error: 'Token inválido' });
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
      .select('horario_semana, slot_duracion_min')
      .limit(1)
      .single();
    return {
      horario: data?.horario_semana || HORARIO_FALLBACK,
      slotMin: data?.slot_duracion_min || 30,
    };
  } catch {
    return { horario: HORARIO_FALLBACK, slotMin: 30 };
  }
}

async function getCandidatas(servicioId) {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('empleado_servicios')
    .select('empleado_id, empleados(id, nombre, apellido, activo)')
    .eq('servicio_id', servicioId);

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
    .neq('estado', 'cancelada')
    .neq('estado', 'no_asistio')
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
    .single();
  if (!svc) return [];

  const candidatas = await getCandidatas(servicioId);
  if (!candidatas.length) return [];

  const { horario, slotMin } = await getHorarioSpa();
  const totalMin = svc.duracion_min + (svc.buffer_min ?? 10);
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
      cursor += slotMin;
    }
  }
  return sugerencias;
}

// GET /api/slots?servicio=id&fecha=YYYY-MM-DD
router.get('/', async (req, res) => {
  const supabase = getSupabaseClient();
  const { servicio, fecha } = req.query;
  if (!servicio || !fecha) {
    return res.status(400).json({ error: 'Parámetros requeridos: servicio, fecha' });
  }

  const { data: svc } = await supabase
    .from('servicios')
    .select('id, duracion_min, buffer_min')
    .eq('id', servicio)
    .single();
  if (!svc) return res.status(404).json({ error: 'Servicio no encontrado' });

  const totalMin = svc.duracion_min + (svc.buffer_min ?? 10);
  const { horario, slotMin } = await getHorarioSpa();
  const date = new Date(fecha + 'T12:00:00');
  const diaKey = DIA_KEYS[date.getDay()];
  const diaConf = horario[diaKey];
  if (!diaConf?.activo) return res.json([]);

  const candidatas = await getCandidatas(servicio);
  if (!candidatas.length) return res.json([]);

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
    const disponible = candidatas.some(e =>
      empleadaEstaLibre(citas[e.id] || [], bloqueos[e.id] || [], slotStart, slotEnd)
    );
    slots.push({ hora: slotStart, disponible });
    cursor += slotMin;
  }

  res.set('Cache-Control', 'no-store');
  res.json(slots);
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
    .single();
  if (!svc) return res.status(404).json({ error: 'Servicio no encontrado o inactivo' });

  const duracion_total = svc.duracion_min + (svc.buffer_min ?? 10);
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

  // Contar citas realizadas últimos 30 días para distribución justa
  const hace30 = new Date();
  hace30.setDate(hace30.getDate() - 30);
  const fecha30 = hace30.toISOString().split('T')[0];

  const disponiblesIds = disponibles.map(e => e.id);
  const { data: cargaMes } = await supabase
    .from('citas')
    .select('empleado_id')
    .in('empleado_id', disponiblesIds)
    .eq('estado', 'realizada')
    .gte('fecha', fecha30);

  const cargaMesMap = {};
  disponiblesIds.forEach(id => { cargaMesMap[id] = 0; });
  (cargaMes || []).forEach(c => { if (cargaMesMap[c.empleado_id] !== undefined) cargaMesMap[c.empleado_id]++; });

  const conCarga = disponibles.map(e => ({
    ...e,
    citas_mes: cargaMesMap[e.id] || 0,
    citas_hoy: (citasDia[e.id] || []).length,
  }));
  conCarga.sort((a, b) =>
    a.citas_mes - b.citas_mes ||
    a.citas_hoy - b.citas_hoy ||
    a.nombre.localeCompare(b.nombre)
  );
  const asignada = conCarga[0];

  const emailNorm = email ? email.toLowerCase().trim() : '';
  let cliente_id = null;

  const { data: cliEx } = await supabase
    .from('clientes')
    .select('id')
    .eq('telefono', telefono)
    .single();

  if (cliEx) {
    cliente_id = cliEx.id;
    if (emailNorm) {
      await supabase.from('clientes').update({ email: emailNorm }).eq('id', cliente_id);
    }
  } else {
    const { data: nuevoC, error: cErr } = await supabase
      .from('clientes')
      .insert({ nombre, telefono, email: emailNorm, origen: origen ?? 'web' })
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
    .neq('estado', 'cancelada')
    .neq('estado', 'no_asistio');

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
    })
    .select()
    .single();

  if (citaError) return res.status(500).json({ error: 'Error al crear la reserva. Intenta de nuevo.' });

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
  const validos = ['pendiente','confirmada','en_proceso','realizada','atrasada','no_asistio','cancelada','reagendada'];
  if (!validos.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Usa: ${validos.join(', ')}` });
  }
  const { data, error } = await supabase
    .from('citas')
    .update({ estado })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(404).json({ error: 'Cita no encontrada' });
  res.json(data);
});

export default router;
