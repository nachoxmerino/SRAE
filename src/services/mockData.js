const usuarios = [
  { id: 'd1', nombre: 'Carlos Mendoza', correo: 'docente@srae.com', password: '123456', rol: 'docente', foto: null, iniciales: 'CM' },
  { id: 'd2', nombre: 'María García', correo: 'maria.garcia@srae.com', password: '123456', rol: 'docente', foto: null, iniciales: 'MG' },
  { id: 'd3', nombre: 'José López', correo: 'jose.lopez@srae.com', password: '123456', rol: 'docente', foto: null, iniciales: 'JL' },
  { id: 'd4', nombre: 'Ana Torres', correo: 'ana.torres@srae.com', password: '123456', rol: 'docente', foto: null, iniciales: 'AT' },
  { id: 'd5', nombre: 'Pedro Ramírez', correo: 'pedro.ramirez@srae.com', password: '123456', rol: 'docente', foto: null, iniciales: 'PR' },
  { id: 'a1', nombre: 'Luis Martínez', correo: 'alumno@srae.com', password: '123456', rol: 'alumno', foto: null, iniciales: 'LM' },
  { id: 'ad1', nombre: 'Roberto Sánchez', correo: 'directivo@srae.com', password: '123456', rol: 'directivo', foto: null, iniciales: 'RS' },
];

const cursos = [
  { id: 'c1', nombre: 'Matemáticas I', turno: 'Mañana', alumnos: [] },
  { id: 'c2', nombre: 'Matemáticas II', turno: 'Tarde', alumnos: [] },
  { id: 'c3', nombre: 'Lengua I', turno: 'Mañana', alumnos: [] },
  { id: 'c4', nombre: 'Lengua II', turno: 'Tarde', alumnos: [] },
  { id: 'c5', nombre: 'Ciencias I', turno: 'Mañana', alumnos: [] },
  { id: 'c6', nombre: 'Ciencias II', turno: 'Tarde', alumnos: [] },
];

const nombresAlumnos = [
  'Sofía Rodríguez', 'Mateo Fernández', 'Valentina López', 'Santiago Díaz',
  'Camila Pérez', 'Benjamín Torres', 'Isabella Gómez', 'Sebastián Ruiz',
  'Emma Castillo', 'Joaquín Morales', 'Mía Vargas', 'Lucas Ríos',
  'Abril Campos', 'Nicolás Herrera', 'Martina Medina', 'Felipe Ortiz',
  'Luciana Silva', 'Gabriel Vega', 'Victoria Méndez', 'Daniel Aguilar',
  'Renata Guerrero', 'Emilio Castro', 'Samantha Rivas', 'Julian Paredes',
  'Bianna Delgado', 'Dante Flores', 'Catalina Peña', 'Andrés Navarro',
  'Julieta Reyes', 'Facundo Molina'
];

const alumnos = nombresAlumnos.map((nombre, i) => ({
  id: `al${i + 1}`,
  nombre,
  correo: `${nombre.toLowerCase().replace(/\s+/g, '.')}@alumno.srae.com`,
  password: '123456',
  rol: 'alumno',
  foto: null,
  iniciales: nombre.split(' ').map(n => n[0]).join(''),
  cursos: []
}));

const cursosAsignados = {
  d1: ['c1', 'c2', 'c3'],
  d2: ['c4', 'c5'],
  d3: ['c6', 'c1'],
  d4: ['c2', 'c4'],
  d5: ['c3', 'c5', 'c6'],
};

alumnos.forEach((al, i) => {
  const cursoId = `c${(i % 6) + 1}`;
  al.cursos.push(cursoId);
  cursos.find(c => c.id === cursoId)?.alumnos.push(al.id);
});

const generarFecha = (diasAtras) => {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString().split('T')[0];
};

const estados = ['presente', 'tarde', 'ausente'];
const motivos = ['Justificado', 'Injustificado', 'Enfermedad', 'Permiso', 'Otro'];

const asistencias = [];
alumnos.forEach(al => {
  for (let i = 0; i < 60; i++) {
    const rand = Math.random();
    let estado;
    if (rand < 0.75) estado = 'presente';
    else if (rand < 0.85) estado = 'tarde';
    else estado = 'ausente';

    asistencias.push({
      id: `as${al.id}_${i}`,
      alumnoId: al.id,
      cursoId: al.cursos[0],
      fecha: generarFecha(i),
      estado,
      motivo: estado === 'ausente' ? motivos[Math.floor(Math.random() * motivos.length)] : '',
      observacion: '',
      registradoPor: 'd1',
      createdAt: new Date().toISOString(),
      updatedAt: null,
    });
  }
});

const alertas = [];
alumnos.slice(0, 8).forEach(al => {
  const ausencias = asistencias.filter(a => a.alumnoId === al.id && a.estado === 'ausente').length;
  const total = asistencias.filter(a => a.alumnoId === al.id).length;
  const pct = Math.round((ausencias / total) * 100);
  if (pct > 20) {
    alertas.push({
      id: `alt_${al.id}`,
      alumnoId: al.id,
      alumnoNombre: al.nombre,
      cursoId: al.cursos[0],
      cursoNombre: cursos.find(c => c.id === al.cursos[0])?.nombre,
      porcentaje: pct,
      umbral: 25,
      motivo: 'Exceso de ausencias',
      fecha: new Date().toISOString(),
      leida: false,
    });
  }
});

const configAlertas = {
  umbral: 25,
  push: true,
  email: true,
  resumenDiario: false,
};

const auditoria = [];

export {
  usuarios,
  cursos,
  alumnos,
  asistencias,
  alertas,
  configAlertas,
  auditoria,
  cursosAsignados,
  motivos,
  estados,
};
