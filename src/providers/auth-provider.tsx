'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api/auth';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({ isLoading: true, isAuthenticated: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const { token, setUser, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await authApi.me();
          setUser(response.data);
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token, setUser, logout]);

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
