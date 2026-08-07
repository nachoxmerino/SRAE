import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import { useApp } from '../contexts/AppContext';
import { getAlertas, marcarAlertaLeida } from '../services/api';
import { formatDate, formatTime } from '../utils/helpers';
import SkeletonLoader from '../components/SkeletonLoader';

export default function Alertas({ onMenuClick }) {
  const { showToast } = useApp();
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await getAlertas();
      setAlertas(data);
    } catch { /* noop */ }
    setLoading(false);
  };

  const handleLeida = async (id) => {
    try {
      await marcarAlertaLeida(id);
      setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a));
    } catch { /* noop */ }
  };

  return (
    <div>
      <Header title="Alertas" onMenuClick={onMenuClick} />
      <div className="page-content">
        {loading ? <SkeletonLoader count={4} /> : (
          alertas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <CheckCircle size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p>No hay alertas pendientes</p>
            </div>
          ) : (
            alertas.map((alerta, i) => (
              <motion.div
                key={alerta.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card"
                style={{
                  padding: '14px 16px',
                  display: 'flex', gap: 12,
                  position: 'relative',
                  background: alerta.leida ? 'white' : '#FFF8F0',
                }}
                onClick={() => handleLeida(alerta.id)}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: '#FFEBEE', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <AlertTriangle size={20} color="#E53935" />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{alerta.alumnoNombre}</h4>
                  <p style={{ margin: '2px 0', fontSize: 12, color: '#888' }}>{alerta.cursoNombre}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{
                      background: '#FFEBEE', color: '#E53935',
                      padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    }}>
                      {alerta.porcentaje}% ausencias
                    </span>
                    <span style={{ fontSize: 11, color: '#999' }}>
                      {formatDate(alerta.fecha)} {formatTime(alerta.fecha)}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#E53935' }}>{alerta.motivo}</p>
                </div>
                {!alerta.leida && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E53935', position: 'absolute', top: 14, right: 14 }} />
                )}
              </motion.div>
            ))
          )
        )}
      </div>
    </div>
  );
}
