// Path: ./src/hooks/usePlacas.ts
'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Placa, PaginatedResponse } from '@/types';
import { api } from '@/lib/axios';

// Função para buscar placas com paginação usando Axios
const fetchPlacas = async ({ 
  pageParam = '0', 
  empresa 
}: { 
  pageParam?: string; 
  empresa?: 'One' | 'Binsat' 
}): Promise<PaginatedResponse<Placa>> => {
  const params: any = {
    cursor: pageParam,
    limit: '10',
  };
  
  if (empresa) {
    params.empresa = empresa;
  }

  const response = await api.get('/placas', { params });
  return response.data;
};

// Função para atualizar status da placa usando Axios
const updatePlacaStatus = async ({ 
  id, 
  instalado 
}: { 
  id: string; 
  instalado: boolean 
}) => {
  const response = await api.put('/placas', { id, instalado });
  return response.data;
};

export const usePlacas = (empresa?: 'One' | 'Binsat') => {
  const queryClient = useQueryClient();
  
  // Query para buscar placas com infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['placas', empresa],
    queryFn: ({ pageParam }) => fetchPlacas({ pageParam, empresa }),
    initialPageParam: '0',
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextCursor : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // Não retry em erros 4xx
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry até 2 vezes para outros erros
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // Mutation para atualizar status com optimistic updates
  const updateStatusMutation = useMutation({
    mutationFn: updatePlacaStatus,
    onMutate: async ({ id, instalado }) => {
      // Cancelar queries em andamento
      const queryKey = ['placas', empresa];
      await queryClient.cancelQueries({ queryKey });

      // Snapshot dos dados atuais
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistic update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: PaginatedResponse<Placa>) => ({
            ...page,
            data: page.data.map((placa: Placa) =>
              placa.id === id
                ? {
                    ...placa,
                    instalado,
                    dataInstalacao: instalado 
                      ? new Date().toISOString().split('T')[0] 
                      : undefined,
                  }
                : placa
            ),
          })),
        };
      });

      return { previousData, queryKey };
    },
    onError: (error, variables, context) => {
      // Reverter em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Invalidar queries relacionadas para garantir sincronização
      queryClient.invalidateQueries({ queryKey: ['placas'] });
    },
  });

  // Flatten dos dados paginados
  const placas = data?.pages.flatMap(page => page.data) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  // Estatísticas calculadas
  const estatisticas = {
    total: placas.length,
    instaladas: placas.filter(p => p.instalado).length,
    pendentes: placas.filter(p => !p.instalado).length,
    totalGeral: totalCount,
  };

  // Função para toggle status
  const toggleStatus = (id: string) => {
    const placa = placas.find(p => p.id === id);
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
      console.error('Erro ao atualizar dados:', error);
    }
  };

  // Verificar se está carregando (inicial ou refetch)
  const isLoadingAny = isLoading || isFetching;

  // Formatar mensagem de erro
  const errorMessage = error?.message || 'Erro desconhecido';

  return {
    // Dados
    placas,
    estatisticas,
    
    // Estados de loading
    isLoading: isLoadingAny,
    isError,
    error: errorMessage,
    isFetchingNextPage,
    
    // Paginação
    hasNextPage,
    fetchNextPage,
    
    // Ações
    refetch: refresh,
    toggleStatus,
    
    // Estados de mutation
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};

// Hook para estatísticas gerais (todas as empresas) usando Axios
export const useEststatisticasGerais = () => {
  const queryOne = usePlacas('One');
  const queryBinsat = usePlacas('Binsat');

  const todasPlacas = [...queryOne.placas, ...queryBinsat.placas];
  
  return {
    // Estatísticas gerais
    totalVeiculos: todasPlacas.length,
    totalInstalados: todasPlacas.filter(p => p.instalado).length,
    totalPendentes: todasPlacas.filter(p => !p.instalado).length,
    
    // Estatísticas por empresa
    estatisticasOne: queryOne.estatisticas,
    estatisticasBinsat: queryBinsat.estatisticas,
    
    // Estados de loading
    isLoading: queryOne.isLoading || queryBinsat.isLoading,
    isError: queryOne.isError || queryBinsat.isError,
    
    // Ações combinadas
    refetchAll: async () => {
      await Promise.all([
        queryOne.refetch(),
        queryBinsat.refetch(),
      ]);
    },
  };
};