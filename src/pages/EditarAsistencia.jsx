import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import { useApp } from '../contexts/AppContext';
import { getAlumnos, getAsistencias, saveAsistencias } from '../services/api';
import { getInitials, getInitialsColor, formatDate } from '../utils/helpers';

const motivos = ['Justificado', 'Injustificado', 'Enfermedad', 'Permiso', 'Otro'];

export default function EditarAsistencia() {
  const { cursoId, alumnoId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [alumno, setAlumno] = useState(null);
  const [asistencia, setAsistencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState('presente');
  const [motivo, setMotivo] = useState('');
  const [observacion, setObservacion] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [alumnosData, asistenciasData] = await Promise.all([
          getAlumnos(cursoId),
          getAsistencias(cursoId),
        ]);
        const al = alumnosData.find(a => a.id === alumnoId);
        setAlumno(al);
        const asist = asistenciasData.find(a => a.alumnoId === alumnoId);
        if (asist) {
          setAsistencia(asist);
          setEstado(asist.estado);
          setMotivo(asist.motivo || '');
          setObservacion(asist.observacion || '');
        }
      } catch { /* noop */ }
      setLoading(false);
    };
    load();
  }, [cursoId, alumnoId]);

  const handleSave = async () => {
    if (!asistencia) return;
    try {
      await saveAsistencias([{
        ...asistencia,
        estado,
        motivo,
        observacion,
        updatedAt: new Date().toISOString(),
      }]);
      showToast('Asistencia actualizada correctamente', 'success');
      navigate(-1);
    } catch {
      showToast('Error al actualizar asistencia', 'error');
    }
  };

  if (loading) return <div><Header title="Editar asistencia" showBack onBack={() => navigate(-1)} /><div className="page-content" /></div>;

  return (
    <div>
      <Header title="Editar asistencia" showBack onBack={() => navigate(-1)} />
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <p style={{ fontSize: 12, color: '#888', margin: '0 0 4px' }}>Editando registro</p>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{alumno?.nombre}</h3>
          <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
            {asistencia?.fecha && formatDate(asistencia.fecha)}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Estado de asistencia</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['presente', 'tarde', 'ausente'].map(opt => (
              <label key={opt} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', borderRadius: 12,
                border: `1.5px solid ${estado === opt ? '#F47C20' : '#E0E0E0'}`,
                background: estado === opt ? '#FFF3E0' : 'white',
                cursor: 'pointer',
              }}>
                <input
                  type="radio"
                  name="estado"
                  value={opt}
                  checked={estado === opt}
                  onChange={e => setEstado(e.target.value)}
                  style={{ accentColor: '#F47C20' }}
                />
                <span style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{opt}</span>
              </label>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>Motivo</p>
          <div style={{ position: 'relative' }}>
            <select
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              className="input-field"
              style={{ appearance: 'none', cursor: 'pointer' }}
            >
              <option value="">Seleccionar motivo</option>
              {motivos.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>Observación</p>
          <textarea
            className="input-field"
            value={observacion}
            onChange={e => setObservacion(e.target.value)}
            placeholder="Agregar observación..."
            style={{ height: 80, padding: '12px 16px', resize: 'none' }}
          />
        </motion.div>

        <button className="btn-primary ripple" onClick={handleSave} style={{ marginTop: 16 }}>
          <Save size={18} />
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
