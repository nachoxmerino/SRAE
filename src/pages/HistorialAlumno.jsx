import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Clock, X, Filter, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import { getAlumnoHistorial } from '../services/api';
import PieChart from '../components/PieChart';
import { formatDateShort, getDayName } from '../utils/helpers';
import SkeletonLoader from '../components/SkeletonLoader';

const statusStyles = {
  presente: { color: '#4CAF50', bg: '#E8F5E9', icon: Check },
  tarde: { color: '#F9A825', bg: '#FFF8E1', icon: Clock },
  ausente: { color: '#E53935', bg: '#FFEBEE', icon: X },
};

export default function HistorialAlumno({ onMenuClick }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getAlumnoHistorial('al1');
        setData(result);
      } catch { /* noop */ }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = data?.list?.filter(a => {
    if (filtroMes && !a.fecha.startsWith(filtroMes)) return false;
    if (filtroEstado && a.estado !== filtroEstado) return false;
    return true;
  }) || [];

  if (loading) return <div><Header title="Mi Historial" onMenuClick={onMenuClick} /><SkeletonLoader count={5} /></div>;

  return (
    <div>
      <Header title="Mi Historial" onMenuClick={onMenuClick} />
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ textAlign: 'center' }}>
          <PieChart pct={data?.pct || 0} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: '#4CAF50' }}>
                <Check size={14} /> <span style={{ fontSize: 16, fontWeight: 700 }}>{data?.presentes}</span>
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>Presentes</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: '#F9A825' }}>
                <Clock size={14} /> <span style={{ fontSize: 16, fontWeight: 700 }}>{data?.tardes}</span>
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>Tardanzas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: '#E53935' }}>
                <X size={14} /> <span style={{ fontSize: 16, fontWeight: 700 }}>{data?.ausentes}</span>
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>Ausentes</div>
            </div>
          </div>
        </motion.div>

        <div className="page-padding" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 180px', position: 'relative' }}>
              <select
                value={filtroMes}
                onChange={e => setFiltroMes(e.target.value)}
                className="input-field"
                style={{ height: 40, fontSize: 13, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Todos los meses</option>
                {['2025-01','2025-02','2025-03','2025-04','2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }} />
            </div>
            <div style={{ flex: '1 1 180px', position: 'relative' }}>
              <select
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                className="input-field"
                style={{ height: 40, fontSize: 13, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Todos los estados</option>
                <option value="presente">Presente</option>
                <option value="tarde">Tarde</option>
                <option value="ausente">Ausente</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }} />
            </div>
          </div>
        </div>

        <div className="page-padding">
          {filtered.map((a, i) => {
            const style = statusStyles[a.estado];
            const Icon = style.icon;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card"
                style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={style.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{getDayName(a.fecha)}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{formatDateShort(a.fecha)}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: style.color, textTransform: 'capitalize' }}>
                  {a.estado}
                </span>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>No hay registros</p>
          )}
        </div>
      </div>
    </div>
  );
}
