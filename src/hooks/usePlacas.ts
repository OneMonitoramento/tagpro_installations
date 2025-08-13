// Path: ./src/hooks/usePlacas.ts
"use client";

import { useMemo } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Placa,
  PlacasResponse,
  UpdateStatusParams,
  Estatisticas,
  FiltrosPlacas,
} from "@/types";

// Chamada real para a API de placas
const fetchPlacas = async ({
  pageParam,
  filtros,
}: {
  pageParam?: number;
  filtros: FiltrosPlacas;
}): Promise<PlacasResponse> => {
  const params = new URLSearchParams({
    limit: "20",
    ...(filtros.empresa && { empresa: filtros.empresa }),
    ...(filtros.status && { status: filtros.status }),
    ...(filtros.pesquisa && { pesquisa: filtros.pesquisa }),
  });

  // Adicionar page apenas se existir (não na primeira página)
  if (pageParam !== undefined) {
    params.append('page', pageParam.toString());
  }

  const response = await fetch(`/api/placas?${params}`);
  
  if (!response.ok) {
    throw new Error(`Erro ao carregar placas: ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || "Erro ao carregar placas");
  }

  return {
    data: result.data,
    nextCursor: result.nextPage,
    hasNextPage: result.hasNextPage,
    totalCount: result.totalCount,
  };
};

const updatePlacaStatus = async ({
  id,
  instalado,
}: UpdateStatusParams): Promise<Placa> => {
  const response = await fetch('/api/placas', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, instalado }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao atualizar status: ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || "Erro ao atualizar status da placa");
  }

  return result.data;
};

// Hook principal para placas com filtros
export const usePlacas = (filtros: FiltrosPlacas = {}) => {
  const queryClient = useQueryClient();

  // Query para buscar placas com infinite scroll e filtros
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["placas", filtros],
    queryFn: ({ pageParam = "0" }) => fetchPlacas({ pageParam: parseInt(pageParam), filtros }),
    initialPageParam: "0", // Primeira página é "0"
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextCursor?.toString() : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount) => {
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: updatePlacaStatus,
    onSuccess: (updatedPlaca) => {
      // Atualizar cache otimisticamente
      queryClient.setQueryData(["placas", filtros], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((placa: Placa) =>
              placa.id === updatedPlaca.id ? updatedPlaca : placa
            ),
          })),
        };
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar status:", error);
    },
  });

  // Flatten dos dados paginados (mantendo duplicatas)
  const placas = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  // Estatísticas calculadas com useMemo para evitar recálculos desnecessários
  const estatisticas: Estatisticas = useMemo(() => ({
    total: placas.length,
    instaladas: placas.filter((p) => p.status === 'installed').length,
    pendentes: placas.filter((p) => p.status === 'pending').length,
    inativas: placas.filter((p) => p.status === 'inactive').length,
    totalGeral: totalCount, // Usar total real da API
  }), [placas, totalCount]);

  // Função para toggle status
  const toggleStatus = (id: string) => {
    const placa = placas.find((p) => p.id === id);
    if (placa) {
      updateStatusMutation.mutate({
        id,
        instalado: !placa.instalado,
      });
    }
  };

  // Função para refresh manual
  const refresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    }
  };

  // Verificar se está carregando (apenas carregamento inicial, não infinite scroll)
  const isLoadingInitial = isLoading && placas.length === 0;

  // Formatar mensagem de erro
  const errorMessage = error?.message || "Erro desconhecido";

  return {
    // Dados
    placas,
    estatisticas,

    // Estados de loading
    isLoading: isLoadingInitial,
    isError,
    error: errorMessage,
    isFetchingNextPage,

    // Paginação
    hasNextPage,
    fetchNextPage,

    // Ações
    refetch: refresh,
    toggleStatus,
  };
};

// Função para buscar todas as estatísticas sem paginação
const fetchEstatisticasGerais = async () => {
  const response = await fetch('/api/placas?limit=1000'); // Limite alto para pegar todos
  
  if (!response.ok) {
    throw new Error(`Erro ao carregar estatísticas: ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || "Erro ao carregar estatísticas");
  }

  return result.data;
};

// Hook separado para estatísticas gerais (SEMPRE dados totais, sem filtros)
export const useEstatisticasGerais = () => {
  const { data: dadosApi = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["estatisticas-gerais"],
    queryFn: fetchEstatisticasGerais,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Manter todas as placas (incluindo duplicatas)
  const placas = dadosApi;

  // Separar estatísticas por empresa (dados totais)
  const estatisticasLwsim = {
    total: placas.filter((p: Placa) => p.empresa === "lw_sim").length,
    instaladas: placas.filter(
      (p: Placa) => p.empresa === "lw_sim" && p.status === "installed"
    ).length,
    pendentes: placas.filter(
      (p: Placa) => p.empresa === "lw_sim" && p.status === "pending"
    ).length,
    inativas: placas.filter(
      (p: Placa) => p.empresa === "lw_sim" && p.status === "inactive"
    ).length,
  };

  const estatisticasBinsat = {
    total: placas.filter((p: Placa) => p.empresa === "binsat").length,
    instaladas: placas.filter(
      (p: Placa) => p.empresa === "binsat" && p.status === "installed"
    ).length,
    pendentes: placas.filter(
      (p: Placa) => p.empresa === "binsat" && p.status === "pending"
    ).length,
    inativas: placas.filter(
      (p: Placa) => p.empresa === "binsat" && p.status === "inactive"
    ).length,
  };

  return {
    // Estatísticas gerais (SEMPRE TOTAIS)
    totalVeiculos: placas.length,
    totalInstalados: placas.filter((p: Placa) => p.status === "installed").length,
    totalPendentes: placas.filter((p: Placa) => p.status === "pending").length,
    totalInativos: placas.filter((p: Placa) => p.status === "inactive").length,

    // Estatísticas por empresa (SEMPRE TOTAIS)
    estatisticasLwsim,
    estatisticasBinsat,

    // Estados de loading
    isLoading,
    isError,

    // Ações
    refetchAll: refetch,
  };
};
