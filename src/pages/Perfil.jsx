import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Settings, RefreshCw, LogOut, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { getInitials, getInitialsColor } from '../utils/helpers';

export default function Perfil({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [passModal, setPassModal] = useState(false);
  const [passwords, setPasswords] = useState({ actual: '', nueva: '', confirmar: '' });

  const handleChangePass = () => {
    if (!passwords.nueva || passwords.nueva !== passwords.confirmar) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }
    showToast('Contraseña actualizada', 'success');
    setPassModal(false);
    setPasswords({ actual: '', nueva: '', confirmar: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const items = [
    { icon: User, label: 'Mi Perfil', desc: 'Ver información personal' },
    { icon: Lock, label: 'Cambiar contraseña', desc: 'Actualizar tu contraseña', onClick: () => setPassModal(true) },
    { icon: Settings, label: 'Configuración', desc: 'Preferencias de la app', onClick: () => navigate('/config-alertas') },
    { icon: RefreshCw, label: 'Sincronización', desc: 'Estado de sincronización' },
    { icon: LogOut, label: 'Cerrar sesión', desc: 'Salir de la aplicación', onClick: handleLogout, color: '#E53935' },
  ];

  return (
    <div>
      <Header title="Mi Perfil" onMenuClick={onMenuClick} />
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: getInitialsColor(user?.nombre),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 28, fontWeight: 700, margin: '0 auto 12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            {getInitials(user?.nombre)}
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{user?.nombre}</h2>
          <p style={{ margin: '4px 0', fontSize: 13, color: '#888' }}>
            {user?.rol === 'docente' ? 'Docente' : user?.rol === 'directivo' ? 'Directivo' : 'Alumno'}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: '#F47C20' }}>{user?.correo}</p>
        </motion.div>

        <div style={{ padding: '0 16px' }}>
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card"
                style={{
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  cursor: item.onClick ? 'pointer' : 'default',
                }}
                onClick={item.onClick}
              >
                <Icon size={20} color={item.color || '#F47C20'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: item.color || '#333' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{item.desc}</div>
                </div>
                <ChevronRight size={16} color="#CCC" />
              </motion.div>
            );
          })}
        </div>

        <Modal open={passModal} onClose={() => setPassModal(false)} title="Cambiar contraseña">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="input-field" type="password" placeholder="Contraseña actual" value={passwords.actual} onChange={e => setPasswords(p => ({ ...p, actual: e.target.value }))} />
            <input className="input-field" type="password" placeholder="Nueva contraseña" value={passwords.nueva} onChange={e => setPasswords(p => ({ ...p, nueva: e.target.value }))} />
            <input className="input-field" type="password" placeholder="Confirmar contraseña" value={passwords.confirmar} onChange={e => setPasswords(p => ({ ...p, confirmar: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn-secondary ripple" style={{ margin: 0, flex: 1 }} onClick={() => setPassModal(false)}>Cancelar</button>
              <button className="btn-primary ripple" style={{ margin: 0, flex: 1 }} onClick={handleChangePass}>Cambiar</button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
