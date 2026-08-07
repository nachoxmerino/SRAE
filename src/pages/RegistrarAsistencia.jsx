import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Check, Clock, X, Save, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import { useApp } from '../contexts/AppContext';
import { getCursos, getAlumnos, getAsistencias, saveAsistencias } from '../services/api';
import { getTodayISO, getInitials, getInitialsColor } from '../utils/helpers';
import SkeletonLoader from '../components/SkeletonLoader';

export default function RegistrarAsistencia() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const { showToast, offline } = useApp();
  const [curso, setCurso] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const fecha = getTodayISO();

  useEffect(() => {
    const load = async () => {
      try {
        const [cursosData, alumnosData, asistenciasData] = await Promise.all([
          getCursos('d1'),
          getAlumnos(cursoId),
          getAsistencias(cursoId, fecha),
        ]);
        const cursoFound = cursosData.find(c => c.id === cursoId);
        setCurso(cursoFound);

        const asistMap = {};
        asistenciasData.forEach(a => { asistMap[a.alumnoId] = a; });

        setAlumnos(alumnosData);
        setAsistencias(alumnosData.map(al => ({
          id: asistMap[al.id]?.id || `new_${al.id}_${Date.now()}`,
          alumnoId: al.id,
          cursoId,
          fecha,
          estado: asistMap[al.id]?.estado || 'presente',
          motivo: asistMap[al.id]?.motivo || '',
          observacion: asistMap[al.id]?.observacion || '',
        })));
      } catch { /* noop */ }
      setLoading(false);
    };
    load();
  }, [cursoId, fecha]);

  const updateEstado = (alumnoId, estado) => {
    setAsistencias(prev => prev.map(a =>
      a.alumnoId === alumnoId ? { ...a, estado } : a
    ));
  };

  const resumen = useMemo(() => {
    const total = asistencias.length;
    const presentes = asistencias.filter(a => a.estado === 'presente').length;
    const tardes = asistencias.filter(a => a.estado === 'tarde').length;
    const ausentes = asistencias.filter(a => a.estado === 'ausente').length;
    return { total, presentes, tardes, ausentes };
  }, [asistencias]);

  const filtered = useMemo(() => {
    if (!busqueda) return alumnos;
    const q = busqueda.toLowerCase();
    return alumnos.filter(al => al.nombre.toLowerCase().includes(q));
  }, [alumnos, busqueda]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (offline) {
        const pendientes = JSON.parse(localStorage.getItem('srae_pendientes') || '[]');
        pendientes.push(...asistencias);
        localStorage.setItem('srae_pendientes', JSON.stringify(pendientes));
        showToast('Guardado localmente. Se sincronizará al recuperar conexión.', 'info');
      } else {
        await saveAsistencias(asistencias);
        showToast(`Asistencia guardada: ${resumen.presentes} presentes, ${resumen.tardes} tardes, ${resumen.ausentes} ausentes`, 'success');
      }
    } catch {
      showToast('Error al guardar asistencia', 'error');
    }
    setSaving(false);
  };

  const estadoOptions = [
    { value: 'presente', label: 'Presente', color: '#4CAF50', icon: Check },
    { value: 'tarde', label: 'Tarde', color: '#F9A825', icon: Clock },
    { value: 'ausente', label: 'Ausente', color: '#E53935', icon: X },
  ];

  if (loading) return <div><Header title="Registrar asistencia" showBack onBack={() => navigate(-1)} /><SkeletonLoader count={6} /></div>;

  return (
    <div>
      <Header title="Registrar asistencia" showBack onBack={() => navigate(-1)} />
      <div className="page-content">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#888' }}>Fecha</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{fecha}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#888' }}>Curso</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{curso?.nombre}</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: 8 }}>
            {estadoOptions.map(opt => {
              const Icon = opt.icon;
              const count = resumen[opt.value === 'presente' ? 'presentes' : opt.value === 'tarde' ? 'tardes' : 'ausentes'];
              const bgColor = opt.value === 'presente' ? '#E8F5E9' : opt.value === 'tarde' ? '#FFF8E1' : '#FFEBEE';
              return (
                <div key={opt.value} style={{
                  flex: 1, background: bgColor, borderRadius: 12, padding: '10px 8px',
                  textAlign: 'center'
                }}>
                  <Icon size={18} color={opt.color} style={{ margin: '0 auto 4px' }} />
                  <div style={{ fontSize: 18, fontWeight: 700, color: opt.color }}>{count}</div>
                  <div style={{ fontSize: 10, color: '#888' }}>{opt.label}</div>
                </div>
              );
            })}
          </div>
        </div>

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

        <div className="page-padding">
          <div className="alumno-list">
          {filtered.map((al, i) => {
            const asist = asistencias.find(a => a.alumnoId === al.id);
            const estado = asist?.estado || 'presente';
            const estadoInfo = estadoOptions.find(o => o.value === estado);
            return (
              <motion.div
                key={al.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card"
                style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: getInitialsColor(al.nombre),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 12, fontWeight: 600, flexShrink: 0,
                }}>
                  {getInitials(al.nombre)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {al.nombre}
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <select
                    value={estado}
                    onChange={e => updateEstado(al.id, e.target.value)}
                    style={{
                      appearance: 'none',
                      padding: '6px 28px 6px 10px',
                      border: `1.5px solid ${estadoInfo?.color || '#E0E0E0'}`,
                      borderRadius: 8,
                      background: estado === 'presente' ? '#E8F5E9' : estado === 'tarde' ? '#FFF8E1' : '#FFEBEE',
                      color: estadoInfo?.color || '#333',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="presente">Presente</option>
                    <option value="tarde">Tarde</option>
                    <option value="ausente">Ausente</option>
                  </select>
                  <ChevronDown size={14} style={{
                    position: 'absolute', right: 8, top: '50%',
                    transform: 'translateY(-50%)', pointerEvents: 'none',
                    color: estadoInfo?.color || '#999',
                  }} />
                </div>
              </motion.div>
            );
          })}
          </div>
        </div>

        <button
          className="btn-primary ripple"
          onClick={handleSave}
          disabled={saving || asistencias.length === 0}
          style={{ marginTop: 16, marginBottom: 16 }}
        >
          <Save size={18} />
          {saving ? 'Guardando...' : 'Guardar asistencia'}
        </button>
      </div>
    </div>
  );
}
