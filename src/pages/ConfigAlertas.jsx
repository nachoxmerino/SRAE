import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import Header from '../components/Header';
import { useApp } from '../contexts/AppContext';
import { getConfigAlertas, saveConfigAlertas } from '../services/api';

export default function ConfigAlertas({ onMenuClick }) {
  const { showToast } = useApp();
  const [config, setConfig] = useState({ umbral: 25, push: true, email: true, resumenDiario: false });

  useEffect(() => {
    const load = async () => {
      const data = await getConfigAlertas();
      setConfig(data);
    };
    load();
  }, []);

  const handleSave = async () => {
    try {
      await saveConfigAlertas(config);
      showToast('Configuración guardada', 'success');
    } catch {
      showToast('Error al guardar', 'error');
    }
  };

  return (
    <div>
      <Header title="Configurar Alertas" onMenuClick={onMenuClick} />
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h4 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Umbral de ausencias</h4>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: '#F47C20' }}>{config.umbral}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={config.umbral}
            onChange={e => setConfig(p => ({ ...p, umbral: parseInt(e.target.value) }))}
            className="range-slider"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginTop: 4 }}>
            <span>10%</span>
            <span>100%</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <h4 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Notificaciones</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'push', label: 'Notificaciones Push' },
              { key: 'email', label: 'Notificaciones por Email' },
              { key: 'resumenDiario', label: 'Resumen diario' },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14 }}>{item.label}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={config[item.key]}
                    onChange={e => setConfig(p => ({ ...p, [item.key]: e.target.checked }))}
                  />
                  <span className="slider-toggle" />
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        <button className="btn-primary ripple" onClick={handleSave} style={{ marginTop: 8 }}>
          <Save size={18} />
          Guardar configuración
        </button>
      </div>
    </div>
  );
}
