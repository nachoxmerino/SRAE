import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, Users, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { useApp } from '../contexts/AppContext';
import { getCursosAll, createCurso, updateCurso, deleteCurso, getAlumnosAll, asignarAlumnosCurso } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';

const cursoColors = ['#F47C20', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722', '#607D8B'];

export default function GestionCursos({ onMenuClick }) {
  const { showToast } = useApp();
  const [cursos, setCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [asignarOpen, setAsignarOpen] = useState(false);
  const [asignarCursoId, setAsignarCursoId] = useState(null);
  const [selectedAlumnos, setSelectedAlumnos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', turno: 'Mañana' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [c, a] = await Promise.all([getCursosAll(), getAlumnosAll()]);
      setCursos(c);
      setAlumnos(a);
    } catch { /* noop */ }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) { showToast('El nombre es obligatorio', 'error'); return; }
    try {
      if (editando) {
        await updateCurso(editando.id, form);
        showToast('Curso actualizado', 'success');
      } else {
        await createCurso(form);
        showToast('Curso creado', 'success');
      }
      setModalOpen(false);
      setEditando(null);
      setForm({ nombre: '', turno: 'Mañana' });
      load();
    } catch {
      showToast('Error al guardar', 'error');
    }
  };

  const handleEdit = (c) => {
    setEditando(c);
    setForm({ nombre: c.nombre, turno: c.turno });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este curso?')) return;
    try {
      await deleteCurso(id);
      showToast('Curso eliminado', 'success');
      load();
    } catch {
      showToast('Error al eliminar', 'error');
    }
  };

  const handleAsignar = async () => {
    try {
      await asignarAlumnosCurso(asignarCursoId, selectedAlumnos);
      showToast('Alumnos asignados correctamente', 'success');
      setAsignarOpen(false);
      setSelectedAlumnos([]);
      load();
    } catch {
      showToast('Error al asignar', 'error');
    }
  };

  const openAsignar = (curso) => {
    setAsignarCursoId(curso.id);
    setSelectedAlumnos(curso.alumnos || []);
    setAsignarOpen(true);
  };

  const toggleAlumno = (alId) => {
    setSelectedAlumnos(prev =>
      prev.includes(alId) ? prev.filter(id => id !== alId) : [...prev, alId]
    );
  };

  const filtered = cursos.filter(c =>
    !busqueda || c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <Header title="Gestión de Cursos" onMenuClick={onMenuClick} />
      <div className="page-content">
          <div className="page-padding" style={{ marginBottom: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#B0B0B0' }} />
              <input
                className="input-field"
                placeholder="Buscar curso..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ paddingLeft: 40, height: 42, fontSize: 14 }}
              />
            </div>
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : (
            <div className="curso-list page-padding">
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card"
                  style={{ padding: '14px 16px', borderLeft: `4px solid ${cursoColors[i % cursoColors.length]}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `${cursoColors[i % cursoColors.length]}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Users size={20} color={cursoColors[i % cursoColors.length]} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{c.nombre}</h4>
                      <p style={{ margin: '2px 0', fontSize: 12, color: '#888' }}>Turno: {c.turno}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{c.alumnos?.length || 0} alumnos</p>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => openAsignar(c)} style={{ background: '#FFF3E0', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 600, color: '#F47C20', cursor: 'pointer' }}>
                        Asignar
                      </button>
                      <button onClick={() => handleEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F47C20', padding: 6 }}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E53935', padding: 6 }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        <button className="fab" onClick={() => { setEditando(null); setForm({ nombre: '', turno: 'Mañana' }); setModalOpen(true); }}>
          <Plus size={24} />
        </button>

        <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditando(null); }} title={editando ? 'Editar Curso' : 'Agregar Curso'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="input-field" placeholder="Nombre del curso" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
            <div style={{ position: 'relative' }}>
              <select className="input-field" value={form.turno} onChange={e => setForm(p => ({ ...p, turno: e.target.value }))} style={{ appearance: 'none', cursor: 'pointer' }}>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn-secondary ripple" style={{ margin: 0, flex: 1 }} onClick={() => { setModalOpen(false); setEditando(null); }}>Cancelar</button>
              <button className="btn-primary ripple" style={{ margin: 0, flex: 1 }} onClick={handleSave}>{editando ? 'Actualizar' : 'Crear'}</button>
            </div>
          </div>
        </Modal>

        <Modal open={asignarOpen} onClose={() => setAsignarOpen(false)} title="Asignar Alumnos" width="400px">
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#B0B0B0' }} />
              <input className="input-field" placeholder="Buscar alumno..." style={{ paddingLeft: 36, height: 38, fontSize: 13 }} />
            </div>
            {alumnos.map(al => (
              <label key={al.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 8px', borderBottom: '1px solid #F5F5F5',
                cursor: 'pointer', fontSize: 14,
              }}>
                <input
                  type="checkbox"
                  checked={selectedAlumnos.includes(al.id)}
                  onChange={() => toggleAlumno(al.id)}
                  style={{ accentColor: '#F47C20' }}
                />
                {al.nombre}
              </label>
            ))}
          </div>
          <button className="btn-primary ripple" style={{ marginTop: 12 }} onClick={handleAsignar}>
            Asignar alumnos
          </button>
        </Modal>
      </div>
    </div>
  );
}
