import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CloudOff } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useApp } from './contexts/AppContext';
import SideDrawer from './components/SideDrawer';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MisCursos from './pages/MisCursos';
import RegistrarAsistencia from './pages/RegistrarAsistencia';
import EditarAsistencia from './pages/EditarAsistencia';
import HistorialAlumno from './pages/HistorialAlumno';
import HistorialDocente from './pages/HistorialDocente';
import Reportes from './pages/Reportes';
import Alumnos from './pages/Alumnos';
import GestionCursos from './pages/Cursos';
import Alertas from './pages/Alertas';
import ConfigAlertas from './pages/ConfigAlertas';
import Perfil from './pages/Perfil';
import More from './pages/More';

function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    if (user.rol === 'alumno') return <Navigate to="/historial-alumno" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppLayout({ children, title, onMenuClick, showBack, onBack }) {
  const { offline } = useApp();
  return (
    <div className="app-container">
      {offline && (
        <div className="offline-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <CloudOff size={14} />
          Sin conexión - Los cambios se guardarán localmente
        </div>
      )}
      {children}
    </div>
  );
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppLayout>
      <Toast />
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {user && user.rol !== 'alumno' && <BottomNav />}

      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={
            user ? (
              user.rol === 'alumno' ? <Navigate to="/historial-alumno" replace />
              : <Navigate to="/dashboard" replace />
            ) : <PageTransition><Login /></PageTransition>
          } />

          <Route path="/dashboard" element={
            <PrivateRoute allowedRoles={['docente', 'directivo']}>
              <PageTransition><Dashboard onMenuClick={() => setDrawerOpen(true)} /></PageTransition>
            </PrivateRoute>
          } />

          <Route path="/cursos" element={
            <PrivateRoute allowedRoles={['docente', 'directivo']}>
              <PageTransition><MisCursos onMenuClick={() => setDrawerOpen(true)} /></PageTransition>
            </PrivateRoute>
          } />

          <Route path="/asistencia/:cursoId" element={
            <PrivateRoute allowedRoles={['docente', 'directivo']}>
              <PageTransition><RegistrarAsistencia /></PageTransition>
            </PrivateRoute>
          } />

          <Route path="/editar-asistencia/:cursoId/:alumnoId" element={
            <PrivateRoute allowedRoles={['docente', 'directivo']}>
              <PageTransition><EditarAsistencia /></PageTransition>
            </PrivateRoute>
          } />

          <Route path="/historial-alumno" element={
            <PrivateRoute allowedRoles={['alumno', 'docente', 'directivo']}>
              <PageTransition><HistorialAlumno onMenuClick={() => setDrawerOpen(true)} /></PageTransition>
            </PrivateRoute>
          } />

          <Route path="/historial-docente" element={
            <PrivateRoute allowedRoles={['docente', 'directivo']}>
              <PageTransition><HistorialDocente onMenuClick={() => setDrawerOpen(true)} /></PageTransition>
            </PrivateRoute>
          } />

          <Route path="/reportes" element={
            <PrivateRoute allowedRoles={['docente', 'directivo']}>
              <PageTransition><Reportes onMenuClick={() => setDrawerOpen(true)} /></PageTransition>
            </PrivateRoute>
          } />

          <Route path="/alumnos" element={
            <PrivateRoute allowedRoles={['docente', 'directivo']}>
              <PageTransition><Alumnos onMenuClick={() => setDrawerOpen(true)} /></PageTransition>
            </PrivateRoute>
          } />

          <Route path="/cursos-gestion" element={
            <PrivateRoute allowedRoles={['directivo']}>
              <PageTransition><GestionCursos onMenuClick={() => setDrawerOpen(true)} /></PageTransition>
            </PrivateRoute>
          } />

          <Route path="/alertas" element={
            <PrivateRoute allowedRoles={['docente', 'directivo']}>
              <PageTransition><Alertas onMenuClick={() => setDrawerOpen(true)} /></PageTransition>
            </PrivateRoute>
          } />

          <Route path="/config-alertas" element={
            <PrivateRoute allowedRoles={['docente', 'directivo']}>
              <PageTransition><ConfigAlertas onMenuClick={() => setDrawerOpen(true)} /></PageTransition>
            </PrivateRoute>
          } />

          <Route path="/perfil" element={
            <PrivateRoute allowedRoles={['docente', 'alumno', 'directivo']}>
              <PageTransition><Perfil onMenuClick={() => setDrawerOpen(true)} /></PageTransition>
            </PrivateRoute>
          } />

          <Route path="/more" element={
            <PrivateRoute allowedRoles={['docente', 'directivo']}>
              <PageTransition><More onMenuClick={() => setDrawerOpen(true)} /></PageTransition>
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </AppLayout>
  );
}
