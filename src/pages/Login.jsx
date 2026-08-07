import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CloudOff, FolderCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { offline } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!correo || !password) { setError('Todos los campos son obligatorios'); return; }
    setLoading(true);
    try {
      const user = await login(correo, password);
      if (user.rol === 'alumno') navigate('/historial-alumno');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F47C20' }}>
      <div className="login-top">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <FolderCheck size={36} />
        </motion.div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Asistencia Escolar</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, opacity: 0.9 }}>UTN</p>
      </div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', damping: 20 }}
        style={{
          flex: 1, background: 'white', borderRadius: '24px 24px 0 0',
          padding: '32px 20px', display: 'flex', flexDirection: 'column',
        }}
      >
        <div className="login-form-wrap">
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#333' }}>¡Bienvenido!</h2>
        <p style={{ margin: '6px 0 24px', fontSize: 14, color: '#888' }}>Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#B0B0B0' }} />
            <input
              className="input-field"
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              style={{ paddingLeft: 44 }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#B0B0B0' }} />
            <input
              className="input-field"
              type={showPass ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ paddingLeft: 44, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#B0B0B0' }}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#E53935', fontSize: 13, margin: 0, textAlign: 'center' }}>
              {error}
            </motion.p>
          )}

          <button type="submit" className="btn-primary ripple" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#F47C20', cursor: 'pointer', margin: 0, fontWeight: 500 }}>
            ¿Olvidaste tu contraseña?
          </p>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#B0B0B0', marginTop: 'auto' }}>
            ¿No tienes cuenta? Contacta al administrador
          </p>

          {offline && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#E53935', fontSize: 13, marginTop: 12 }}>
              <CloudOff size={16} />
              <span>Sin conexión</span>
            </div>
          )}
        </form>
        </div>
      </motion.div>
    </div>
  );
}
