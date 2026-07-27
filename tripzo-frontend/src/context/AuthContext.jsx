import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const stored = localStorage.getItem('tripzo_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    // Corrupted or stale localStorage value — don't crash the whole app on load.
    localStorage.removeItem('tripzo_user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('tripzo_token'));

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('tripzo_token', newToken);
    localStorage.setItem('tripzo_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tripzo_token');
    localStorage.removeItem('tripzo_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = { user, token, isAuthenticated: !!token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
