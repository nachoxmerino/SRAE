import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('srae_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('srae_user'); }
    }
    setLoading(false);
  }, []);

  const login = async (correo, password) => {
    const u = await apiLogin(correo, password);
    setUser(u);
    localStorage.setItem('srae_user', JSON.stringify(u));
    return u;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('srae_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
