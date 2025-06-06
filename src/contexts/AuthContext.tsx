// Path: ./src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dados mock de usuários para demonstração
const mockUsers = [
  { id: '1', username: 'admin', password: 'admin123', name: 'Administrador', email: 'admin@empresa.com', role: 'admin' },
  { id: '2', username: 'user', password: 'user123', name: 'Usuário Padrão', email: 'user@empresa.com', role: 'user' },
  { id: '3', username: 'lwsim', password: 'lwsim123', name: 'LW SIM', email: 'lwsim@empresa.com', role: 'lwsim' },
  { id: '4', username: 'tagpro', password: 'tagpro123', name: 'TagPro User', email: 'tagpro@empresa.com', role: 'tagpro' },
  { id: '5', username: 'binsat', password: 'binsat123', name: 'Binsat User', email: 'binsat@empresa.com', role: 'binsat' },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se há usuário salvo no localStorage ao inicializar
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('auth_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simular delay de autenticação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar credenciais
      const foundUser = mockUsers.find(
        u => u.username === credentials.username && u.password === credentials.password
      );

      if (!foundUser) {
        throw new Error('Credenciais inválidas');
      }

      // Criar objeto de usuário (sem senha)
      const { password, username, ...userWithoutPassword } = foundUser;
      const authenticatedUser: User = userWithoutPassword;

      setUser(authenticatedUser);
      localStorage.setItem('auth_user', JSON.stringify(authenticatedUser));
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};