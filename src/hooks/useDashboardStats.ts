"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "@/types";

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch('/api/dashboard');
  
  if (!response.ok) {
    throw new Error(`Erro ao carregar estatísticas: ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || "Erro ao carregar estatísticas do dashboard");
  }

  return result.data;
};

export const useDashboardStats = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount) => {
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  return {
    // Dados
    stats: data,
    
    // Estados de loading
    isLoading,
    isError,
    error: error?.message || "Erro desconhecido",
    
    // Ações
    refetch,
  };
};