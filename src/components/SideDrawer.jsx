import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, AlertTriangle, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getInitials, getInitialsColor } from '../utils/helpers';

export default function SideDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const items = [
    { icon: User, label: 'Mi Perfil', onClick: () => { navigate('/perfil'); onClose(); } },
    { icon: Settings, label: 'Configuración', onClick: () => { navigate('/config-alertas'); onClose(); } },
    { icon: AlertTriangle, label: 'Alertas', onClick: () => { navigate('/alertas'); onClose(); } },
    { icon: LogOut, label: 'Cerrar Sesión', onClick: handleLogout },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <button
              onClick={onClose}
              style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
            >
              <X size={20} />
            </button>
            <div className="drawer-header">
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: getInitialsColor(user?.nombre),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 24, fontWeight: 700, margin: '0 auto 12px'
              }}>
                {getInitials(user?.nombre)}
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{user?.nombre}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>
                {user?.rol === 'docente' ? 'Docente' : user?.rol === 'directivo' ? 'Directivo' : 'Alumno'}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button key={i} className="drawer-item" onClick={item.onClick}>
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
