import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Clock, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { getCursos } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';

const cursoColors = ['#F47C20', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722', '#607D8B'];

export default function MisCursos({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCursos(user.id);
        setCursos(data);
      } catch { /* noop */ }
      setLoading(false);
    };
    load();
  }, [user.id]);

  if (loading) {
    return (
      <div>
        <Header title="Mis Cursos" onMenuClick={onMenuClick} />
        <div className="page-content">
          <SkeletonLoader count={4} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Mis Cursos" onMenuClick={onMenuClick} />
      <div className="page-content">
        {cursos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <Users size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
            <p>No hay cursos asignados</p>
          </div>
        ) : (
          <div className="curso-list">
            {cursos.map((curso, i) => (
              <motion.div
                key={curso.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card"
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', cursor: 'pointer',
                  borderLeft: `4px solid ${cursoColors[i % cursoColors.length]}`,
                }}
                onClick={() => navigate(`/asistencia/${curso.id}`)}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${cursoColors[i % cursoColors.length]}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Users size={20} color={cursoColors[i % cursoColors.length]} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{curso.nombre}</h4>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12, color: '#888' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {curso.turno}
                    </span>
                    <span>{curso.alumnos?.length || 0} alumnos</span>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  style={{ width: 'auto', margin: 0, padding: '8px 14px', fontSize: 12, borderRadius: 10, whiteSpace: 'nowrap' }}
                  onClick={e => { e.stopPropagation(); navigate(`/asistencia/${curso.id}`); }}
                >
                  Tomar asistencia
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
