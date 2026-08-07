import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { getDocenteHistorial, getCursos } from '../services/api';
import { getInitials, getInitialsColor } from '../utils/helpers';
import SkeletonLoader from '../components/SkeletonLoader';

export default function HistorialDocente({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const cursosData = await getCursos(user.id);
        setCursos(cursosData);
        const data = await getDocenteHistorial(user.id);
        setAlumnos(data);
      } catch { /* noop */ }
      setLoading(false);
    };
    load();
  }, [user.id]);

  const filtered = alumnos.filter(a => {
    if (busqueda && !a.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtroCurso && a.cursoId !== filtroCurso) return false;
    return true;
  });

  const getEstadoStyle = (estado) => {
    const map = {
      bueno: { label: 'Bueno', bg: '#E8F5E9', color: '#4CAF50' },
      regular: { label: 'Regular', bg: '#FFF8E1', color: '#F9A825' },
      riesgo: { label: 'Riesgo', bg: '#FFEBEE', color: '#E53935' },
    };
    return map[estado] || map.riesgo;
  };

  return (
    <div>
      <Header title="Historial" onMenuClick={onMenuClick} />
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

        <div className="page-padding" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 180px', position: 'relative' }}>
              <select
                value={filtroCurso}
                onChange={e => setFiltroCurso(e.target.value)}
                className="input-field"
                style={{ height: 40, fontSize: 13, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Todos los cursos</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }} />
            </div>
            <div style={{ flex: '1 1 180px', position: 'relative' }}>
              <select
                value={filtroPeriodo}
                onChange={e => setFiltroPeriodo(e.target.value)}
                className="input-field"
                style={{ height: 40, fontSize: 13, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Todo el período</option>
                <option value="30">Últimos 30 días</option>
                <option value="60">Últimos 60 días</option>
                <option value="90">Últimos 90 días</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }} />
            </div>
          </div>
        </div>

        {loading ? (
          <SkeletonLoader count={5} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <p>No se encontraron alumnos</p>
          </div>
        ) : (
          <div className="page-padding">
            {filtered.map((al, i) => {
              const estadoStyle = getEstadoStyle(al.estado || 'riesgo');
              return (
                <motion.div
                  key={al.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card"
                  style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                  onClick={() => navigate(`/editar-asistencia/${al.cursoId}/${al.id}`)}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: getInitialsColor(al.nombre),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 14, fontWeight: 600, flexShrink: 0,
                  }}>
                    {getInitials(al.nombre)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{al.nombre}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{al.cursoNombre}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>{al.pct}%</div>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 6,
                      fontSize: 11, fontWeight: 600,
                      background: estadoStyle.bg, color: estadoStyle.color,
                    }}>
                      {estadoStyle.label}
                    </span>
                  </div>
                  <ChevronRight size={16} color="#CCC" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
