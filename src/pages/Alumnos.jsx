import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { useApp } from '../contexts/AppContext';
import { getAlumnosAll, createAlumno, updateAlumno, deleteAlumno } from '../services/api';
import { getInitials, getInitialsColor } from '../utils/helpers';
import SkeletonLoader from '../components/SkeletonLoader';

export default function Alumnos({ onMenuClick }) {
  const { showToast } = useApp();
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', correo: '' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await getAlumnosAll();
      setAlumnos(data);
    } catch { /* noop */ }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) { showToast('El nombre es obligatorio', 'error'); return; }
    try {
      if (editando) {
        await updateAlumno(editando.id, form);
        showToast('Alumno actualizado', 'success');
      } else {
        await createAlumno(form);
        showToast('Alumno creado', 'success');
      }
      setModalOpen(false);
      setEditando(null);
      setForm({ nombre: '', correo: '' });
      load();
    } catch {
      showToast('Error al guardar', 'error');
    }
  };

  const handleEdit = (al) => {
    setEditando(al);
    setForm({ nombre: al.nombre, correo: al.correo });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este alumno?')) return;
    try {
      await deleteAlumno(id);
      showToast('Alumno eliminado', 'success');
      load();
    } catch {
      showToast('Error al eliminar', 'error');
    }
  };

  const filtered = alumnos.filter(a =>
    !busqueda || a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <Header title="Gestión de Alumnos" onMenuClick={onMenuClick} />
      <div className="page-content">
        <div className="page-padding" style={{ marginBottom: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#B0B0B0' }} />
            <input
              className="input-field"
              placeholder="Buscar alumno..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ paddingLeft: 40, height: 42, fontSize: 14 }}
            />
          </div>
        </div>

        {loading ? (
          <SkeletonLoader count={6} />
        ) : (
          <div className="alumno-list page-padding">
            {filtered.map((al, i) => (
              <motion.div
                key={al.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card"
                style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: getInitialsColor(al.nombre),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 14, fontWeight: 600, flexShrink: 0,
                }}>
                  {getInitials(al.nombre)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{al.nombre}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{al.correo}</div>
                </div>
                <button onClick={() => handleEdit(al)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F47C20', padding: 6 }}>
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(al.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E53935', padding: 6 }}>
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <button className="fab" onClick={() => { setEditando(null); setForm({ nombre: '', correo: '' }); setModalOpen(true); }}>
          <Plus size={24} />
        </button>

        <Modal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditando(null); }}
          title={editando ? 'Editar Alumno' : 'Agregar Alumno'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="input-field" placeholder="Nombre completo" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
            <input className="input-field" placeholder="Correo electrónico" type="email" value={form.correo} onChange={e => setForm(p => ({ ...p, correo: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn-secondary ripple" style={{ margin: 0, flex: 1 }} onClick={() => { setModalOpen(false); setEditando(null); }}>Cancelar</button>
              <button className="btn-primary ripple" style={{ margin: 0, flex: 1 }} onClick={handleSave}>{editando ? 'Actualizar' : 'Crear'}</button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
