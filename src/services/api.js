import {
  usuarios, cursos, alumnos, asistencias, alertas,
  configAlertas, auditoria, cursosAsignados, motivos
} from './mockData';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

function getFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(`srae_${key}`);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(`srae_${key}`, JSON.stringify(data));
  } catch { /* noop */ }
}

function getData(key, fallback) {
  const stored = getFromStorage(key, null);
  if (stored) return stored;
  saveToStorage(key, fallback);
  return fallback;
}

export async function login(correo, password) {
  await delay(300);
  const users = getData('usuarios', usuarios);
  const user = users.find(u => u.correo === correo && u.password === password);
  if (!user) throw new Error('Credenciales inválidas');
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export async function getCursos(docenteId) {
  await delay(150);
  const allCursos = getData('cursos', cursos);
  const allAlumnos = getData('alumnos', alumnos);
  const asignacion = getData('cursosAsignados', cursosAsignados);
  const ids = asignacion[docenteId] || allCursos.map(c => c.id);
  return ids.map(id => {
    const curso = allCursos.find(c => c.id === id);
    if (!curso) return null;
    const alumnosCurso = (curso.alumnos || []).map(aid => allAlumnos.find(a => a.id === aid)).filter(Boolean);
    return { ...curso, alumnos: alumnosCurso };
  }).filter(Boolean);
}

export async function getAlumnos(cursoId) {
  await delay(150);
  const allAlumnos = getData('alumnos', alumnos);
  const allCursos = getData('cursos', cursos);
  const curso = allCursos.find(c => c.id === cursoId);
  if (!curso) return [];
  const ids = curso.alumnos || [];
  return ids.map(id => allAlumnos.find(a => a.id === id)).filter(Boolean);
}

export async function getAsistencias(cursoId, fecha) {
  await delay(200);
  const all = getData('asistencias', asistencias);
  const filtered = all.filter(a =>
    a.cursoId === cursoId &&
    (!fecha || a.fecha === fecha)
  );
  return filtered;
}

export async function saveAsistencias(registros) {
  await delay(300);
  const all = getData('asistencias', asistencias);
  const now = new Date().toISOString();
  registros.forEach(r => {
    const idx = all.findIndex(a => a.id === r.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...r, updatedAt: now };
    } else {
      all.push({ ...r, id: `as_${Date.now()}_${Math.random()}`, createdAt: now, updatedAt: null });
    }
  });
  saveToStorage('asistencias', all);
  const user = JSON.parse(localStorage.getItem('srae_user') || '{}');
  const log = {
    id: `aud_${Date.now()}`,
    userId: user.id,
    action: 'GUARDAR_ASISTENCIA',
    detalle: `Guardadas ${registros.length} asistencias`,
    fecha: now,
  };
  const logs = getData('auditoria', auditoria);
  logs.push(log);
  saveToStorage('auditoria', logs);
  return true;
}

export async function getAlumnoHistorial(alumnoId) {
  await delay(200);
  const all = getData('asistencias', asistencias);
  const list = all.filter(a => a.alumnoId === alumnoId).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const total = list.length;
  const presentes = list.filter(a => a.estado === 'presente').length;
  const tardes = list.filter(a => a.estado === 'tarde').length;
  const ausentes = list.filter(a => a.estado === 'ausente').length;
  const pct = total > 0 ? Math.round((presentes / total) * 100) : 0;
  return { list, total, presentes, tardes, ausentes, pct };
}

export async function getDocenteHistorial(docenteId, filtros = {}) {
  await delay(200);
  const allCursos = await getCursos(docenteId);
  const allAsistencias = getData('asistencias', asistencias);
  const allAlumnos = getData('alumnos', alumnos);

  let alumnosData = [];
  allCursos.forEach(curso => {
    (curso.alumnos || []).forEach(al => {
      const asis = allAsistencias.filter(a => a.alumnoId === al.id);
      const total = asis.length;
      const presentes = asis.filter(a => a.estado === 'presente').length;
      const pct = total > 0 ? Math.round((presentes / total) * 100) : 0;
      let estado = 'riesgo';
      if (pct >= 85) estado = 'bueno';
      else if (pct >= 70) estado = 'regular';
      const yaExiste = alumnosData.find(a => a.id === al.id);
      if (!yaExiste) {
        alumnosData.push({ ...al, pct, estado, cursoNombre: curso.nombre, cursoId: curso.id });
      }
    });
  });

  if (filtros.cursoId) {
    alumnosData = alumnosData.filter(a => a.cursoId === filtros.cursoId);
  }
  if (filtros.estado) {
    alumnosData = alumnosData.filter(a => a.estado === filtros.estado);
  }
  if (filtros.busqueda) {
    const q = filtros.busqueda.toLowerCase();
    alumnosData = alumnosData.filter(a => a.nombre.toLowerCase().includes(q));
  }

  return alumnosData.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function getAlertas(docenteId) {
  await delay(200);
  const all = getData('alertas', alertas);
  return all.filter(a => !a.leida || true);
}

export async function marcarAlertaLeida(alertaId) {
  await delay(100);
  const all = getData('alertas', alertas);
  const idx = all.findIndex(a => a.id === alertaId);
  if (idx >= 0) { all[idx].leida = true; saveToStorage('alertas', all); }
  return true;
}

export async function saveConfigAlertas(config) {
  await delay(150);
  saveToStorage('configAlertas', config);
  return config;
}

export async function getConfigAlertas() {
  await delay(100);
  return getData('configAlertas', configAlertas);
}

export async function createAlumno(data) {
  await delay(200);
  const all = getData('alumnos', alumnos);
  const id = `al_${Date.now()}`;
  const nuevo = {
    id,
    ...data,
    correo: `${data.nombre.toLowerCase().replace(/\s+/g, '.')}@alumno.srae.com`,
    password: '123456',
    rol: 'alumno',
    foto: null,
    iniciales: data.nombre.split(' ').map(n => n[0]).join(''),
    cursos: []
  };
  all.push(nuevo);
  saveToStorage('alumnos', all);
  return nuevo;
}

export async function updateAlumno(id, data) {
  await delay(200);
  const all = getData('alumnos', alumnos);
  const idx = all.findIndex(a => a.id === id);
  if (idx < 0) throw new Error('Alumno no encontrado');
  all[idx] = { ...all[idx], ...data };
  saveToStorage('alumnos', all);
  return all[idx];
}

export async function deleteAlumno(id) {
  await delay(200);
  let all = getData('alumnos', alumnos);
  all = all.filter(a => a.id !== id);
  saveToStorage('alumnos', all);
  const allCursos = getData('cursos', cursos);
  allCursos.forEach(c => {
    c.alumnos = (c.alumnos || []).filter(aid => aid !== id);
  });
  saveToStorage('cursos', allCursos);
  return true;
}

export async function getAlumnosAll() {
  await delay(150);
  return getData('alumnos', alumnos);
}

export async function createCurso(data) {
  await delay(200);
  const all = getData('cursos', cursos);
  const id = `c_${Date.now()}`;
  const nuevo = { id, ...data, alumnos: [] };
  all.push(nuevo);
  saveToStorage('cursos', all);
  return nuevo;
}

export async function updateCurso(id, data) {
  await delay(200);
  const all = getData('cursos', cursos);
  const idx = all.findIndex(c => c.id === id);
  if (idx < 0) throw new Error('Curso no encontrado');
  all[idx] = { ...all[idx], ...data };
  saveToStorage('cursos', all);
  return all[idx];
}

export async function deleteCurso(id) {
  await delay(200);
  let all = getData('cursos', cursos);
  all = all.filter(c => c.id !== id);
  saveToStorage('cursos', all);
  return true;
}

export async function getCursosAll() {
  await delay(150);
  return getData('cursos', cursos);
}

export async function asignarAlumnosCurso(cursoId, alumnoIds) {
  await delay(200);
  const allCursos = getData('cursos', cursos);
  const curso = allCursos.find(c => c.id === cursoId);
  if (!curso) throw new Error('Curso no encontrado');
  curso.alumnos = [...new Set([...(curso.alumnos || []), ...alumnoIds])];
  saveToStorage('cursos', allCursos);
  const allAlumnos = getData('alumnos', alumnos);
  alumnoIds.forEach(aid => {
    const al = allAlumnos.find(a => a.id === aid);
    if (al && !al.cursos.includes(cursoId)) al.cursos.push(cursoId);
  });
  saveToStorage('alumnos', allAlumnos);
  return curso;
}

export async function getReporte(filtros = {}) {
  await delay(400);
  const allAsistencias = getData('asistencias', asistencias);
  const allAlumnos = getData('alumnos', alumnos);
  const allCursos = getData('cursos', cursos);

  let filtered = [...allAsistencias];

  if (filtros.cursoId) filtered = filtered.filter(a => a.cursoId === filtros.cursoId);
  if (filtros.alumnoId) filtered = filtered.filter(a => a.alumnoId === filtros.alumnoId);
  if (filtros.periodo === '30') {
    const d = new Date(); d.setDate(d.getDate() - 30);
    filtered = filtered.filter(a => new Date(a.fecha) >= d);
  } else if (filtros.periodo === '90') {
    const d = new Date(); d.setDate(d.getDate() - 90);
    filtered = filtered.filter(a => new Date(a.fecha) >= d);
  }

  const total = filtered.length;
  const presentes = filtered.filter(a => a.estado === 'presente').length;
  const tardes = filtered.filter(a => a.estado === 'tarde').length;
  const ausentes = filtered.filter(a => a.estado === 'ausente').length;
  const pct = total > 0 ? Math.round((presentes / total) * 100) : 0;

  const porAlumno = {};
  filtered.forEach(a => {
    if (!porAlumno[a.alumnoId]) porAlumno[a.alumnoId] = { total: 0, presentes: 0, tardes: 0, ausentes: 0 };
    porAlumno[a.alumnoId].total++;
    porAlumno[a.alumnoId][a.estado === 'tarde' ? 'tardes' : a.estado === 'ausente' ? 'ausentes' : 'presentes']++;
  });

  const detalle = Object.entries(porAlumno).map(([alumnoId, stats]) => {
    const al = allAlumnos.find(a => a.id === alumnoId);
    return {
      alumnoId,
      alumnoNombre: al?.nombre || 'Desconocido',
      iniciales: al?.iniciales || '??',
      pct: stats.total > 0 ? Math.round((stats.presentes / stats.total) * 100) : 0,
      ...stats,
    };
  }).sort((a, b) => a.alumnoNombre.localeCompare(b.alumnoNombre));

  return { total, presentes, tardes, ausentes, pct, detalle };
}

export async function exportReporte(tipo, data) {
  await delay(500);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_asistencia.${tipo === 'pdf' ? 'pdf' : tipo === 'csv' ? 'csv' : 'xlsx'}`;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

export async function syncOffline(registros) {
  await delay(500);
  if (registros && registros.length > 0) {
    await saveAsistencias(registros);
  }
  return { sincronizados: registros?.length || 0, fecha: new Date().toISOString() };
}

export async function getUsuario(id) {
  await delay(100);
  const users = getData('usuarios', usuarios);
  return users.find(u => u.id === id) || null;
}

export async function updatePassword(id, newPassword) {
  await delay(200);
  const all = getData('usuarios', usuarios);
  const idx = all.findIndex(u => u.id === id);
  if (idx < 0) throw new Error('Usuario no encontrado');
  all[idx].password = newPassword;
  saveToStorage('usuarios', all);
  return true;
}

export async function getAuditoria() {
  await delay(150);
  return getData('auditoria', auditoria);
}
