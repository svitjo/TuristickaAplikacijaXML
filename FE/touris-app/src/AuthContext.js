import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  const login = (authResponse) => {
    localStorage.setItem('token', authResponse.token);
    const next = {
      userId: authResponse.userId,
      userName: authResponse.userName,
      email: authResponse.email,
      userRole: authResponse.userRole,
    };
    localStorage.setItem('user', JSON.stringify(next));
    setUser(next);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout, isAuthenticated: !!user }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
