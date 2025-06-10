// Path: ./src/app/page.tsx
'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/components/Dashboard';
import LoginForm from '@/components/LoginForm';
import Loading from '@/components/Loading';

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
      console.log('🚀 ~ error:', error)
     
        return failureCount < 2;
      },
    },
  },
});

// Componente principal da aplicação
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Carregando aplicação..." size="lg" />
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LoginForm />;
};

// Componente raiz com todos os providers
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="app">
          <AppContent />
        </div>
        {/* React Query DevTools - apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools 
            initialIsOpen={false} 
            buttonPosition="bottom-right"
          />
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}