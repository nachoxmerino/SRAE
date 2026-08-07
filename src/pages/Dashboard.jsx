import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardCheck, History, BarChart3, AlertTriangle, ChevronRight, BookOpen, Clock, MapPin } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { getCursos } from '../services/api';
import { getGreeting, getTodayDate } from '../utils/helpers';
import SkeletonLoader from '../components/SkeletonLoader';

export default function Dashboard({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCursos(user.id);
        setCursos(data.slice(0, 3));
      } catch { /* noop */ }
      setLoading(false);
    };
    load();
  }, [user.id]);

  const acciones = [
    { icon: ClipboardCheck, label: 'Tomar asistencia', color: '#F47C20', onClick: () => navigate('/cursos') },
    { icon: History, label: 'Historial', color: '#4CAF50', onClick: () => navigate('/historial-docente') },
    { icon: BarChart3, label: 'Reportes', color: '#2196F3', onClick: () => navigate('/reportes') },
    { icon: AlertTriangle, label: 'Alertas', color: '#E53935', onClick: () => navigate('/alertas') },
  ];

  return (
    <div>
      <Header title={`${getGreeting()}, ${user?.nombre?.split(' ')[0] || 'Profe'}.`} onMenuClick={onMenuClick} />
      <div className="page-content">
        <p className="page-padding" style={{ margin: '0 0 16px', fontSize: 13, color: '#888' }}>{getTodayDate()}</p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ background: 'linear-gradient(135deg, #F47C20, #FCA147)', color: 'white', border: 'none', marginLeft: 16, marginRight: 16 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <BookOpen size={16} />
            <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.9 }}>Próxima clase</span>
          </div>
          {cursos.length > 0 ? (
            <>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>{cursos[0]?.nombre}</h3>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, opacity: 0.85 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {cursos[0]?.turno}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> Aula 101</span>
              </div>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>No hay clases próximas</p>
          )}
        </motion.div>

        <div className="section-group" style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px', padding: '0 4px' }}>Mis cursos</h3>
          {loading ? <SkeletonLoader count={3} height={70} /> : (
            <div className="card-grid">
              {cursos.map((curso, i) => (
                <motion.div
                  key={curso.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card"
                  onClick={() => navigate(`/asistencia/${curso.id}`)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div style={{
                    width: 4, height: 40, borderRadius: 2,
                    background: ['#F47C20', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722', '#607D8B'][i % 6]
                  }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{curso.nombre}</h4>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>{curso.alumnos?.length || 0} alumnos</p>
                  </div>
                  <ChevronRight size={18} color="#CCC" />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="section-group">
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px', padding: '0 4px' }}>Acciones rápidas</h3>
          <div className="acciones-grid">
            {acciones.map((accion, i) => {
              const Icon = accion.icon;
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={accion.onClick}
                  style={{
                    background: 'white', border: 'none', borderRadius: 16, padding: '16px 8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: `${accion.color}15`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color={accion.color} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 500, color: '#666', textAlign: 'center', lineHeight: 1.2 }}>
                    {accion.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
