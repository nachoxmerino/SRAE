import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart3, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const items = [
  { path: '/dashboard', label: 'Inicio', icon: Home },
  { path: '/cursos', label: 'Cursos', icon: BookOpen },
  { path: '/reportes', label: 'Reportes', icon: BarChart3 },
  { path: '/more', label: 'Más', icon: MoreHorizontal },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user || user.rol === 'alumno') return null;

  return (
    <nav className="bottom-nav">
      <div className="nav-inner">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
