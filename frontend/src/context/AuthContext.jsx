import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.me();
        setUser(response.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (payload) => {
    const response = await api.login(payload);
    setUser(response.user);
    return response;
  };

  const register = async (payload) => {
    const response = await api.register(payload);
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const value = { user, setUser, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
