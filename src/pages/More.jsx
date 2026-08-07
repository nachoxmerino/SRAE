import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, AlertTriangle, Settings, User, FileText, Wifi } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

export default function More({ onMenuClick }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const items = [
    { icon: Users, label: 'Gestión de Alumnos', desc: 'CRUD de alumnos', path: '/alumnos', roles: ['directivo', 'docente'] },
    { icon: BookOpen, label: 'Gestión de Cursos', desc: 'CRUD de cursos', path: '/cursos-gestion', roles: ['directivo'] },
    { icon: AlertTriangle, label: 'Alertas', desc: 'Ver alertas del sistema', path: '/alertas', roles: ['docente', 'directivo'] },
    { icon: Settings, label: 'Configurar Alertas', desc: 'Umbral y notificaciones', path: '/config-alertas', roles: ['docente', 'directivo'] },
    { icon: User, label: 'Mi Perfil', desc: 'Información personal', path: '/perfil', roles: ['docente', 'alumno', 'directivo'] },
    { icon: FileText, label: 'Reportes', desc: 'Generar y exportar', path: '/reportes', roles: ['docente', 'directivo'] },
  ];

  const filtered = items.filter(item => item.roles.includes(user?.rol));

  return (
    <div>
      <Header title="Más" onMenuClick={onMenuClick} />
      <div className="page-content">
        {filtered.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card"
              style={{
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer',
              }}
              onClick={() => navigate(item.path)}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: '#FFF3E0', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color="#F47C20" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{item.desc}</div>
              </div>
            </motion.div>
          );
        })}

        <div style={{ marginTop: 24, padding: '0 16px' }}>
          <div className="card" style={{ background: '#FFF8F0', border: '1px solid #FFE0B2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Wifi size={16} color="#F47C20" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F47C20' }}>Sincronización</span>
            </div>
            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
              Última sincronización: {new Date().toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
