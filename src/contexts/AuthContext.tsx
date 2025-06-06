// Path: ./src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/axios';
import { User, AuthContextData } from '@/types';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Verificar se usuário está logado ao carregar a aplicação
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('🔍 No token found');
        setIsLoading(false);
        return;
      }

      console.log('🔍 Checking auth with token:', token.substring(0, 20) + '...');

      // Verificar se token é válido
      const response = await api.get('/auth/me');
      console.log('✅ Auth check successful:', response.data.user);
      setUser(response.data.user);
    } catch (error: any) {
      console.log('❌ Auth check failed:', error.response?.data?.message || error.message);
      // Token inválido, remover
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', username);
      
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      console.log('✅ Login successful:', response.data);

      const { token, user: userData } = response.data;

      // Salvar token
      localStorage.setItem('auth_token', token);
      console.log('💾 Token saved to localStorage');
      
      // Salvar usuário
      setUser(userData);
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Erro ao fazer login';
      throw new Error(message);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    
    // Remover token
    localStorage.removeItem('auth_token');
    
    // Limpar usuário
    setUser(null);
    
    // Redirecionar para login
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};