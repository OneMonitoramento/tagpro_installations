// Path: ./src/components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Se não está autenticado, redirecionar para login
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Se requer admin mas usuário não é admin
      if (requireAdmin && user?.role !== 'admin') {
        // Aqui você pode redirecionar para uma página de "sem permissão"
        // ou mostrar uma mensagem de erro
        router.push('/');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router, requireAdmin]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Verificando autenticação..." />
      </div>
    );
  }

  // Se não está autenticado, não renderizar nada (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  // Se requer admin mas usuário não é admin
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  // Se tudo OK, renderizar children
  return <>{children}</>;
}