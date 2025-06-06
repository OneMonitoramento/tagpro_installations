// Path: ./src/hooks/usePlacas.ts
'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Placa, PlacasResponse, UpdateStatusParams, Estatisticas } from '@/types';

// Simulação de API calls
const fetchPlacas = async ({ pageParam = '0', empresa }: { pageParam?: string; empresa: 'One' | 'Binsat' }): Promise<PlacasResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simular delay

  const pageSize = 20;
  const startIndex = parseInt(pageParam) * pageSize;
  
  // Dados mock mais realistas
  const generatePlacas = (empresa: 'One' | 'Binsat', start: number, count: number): Placa[] => {
    return Array.from({ length: count }, (_, i) => {
      const index = start + i;
      const empresaPrefix = empresa === 'One' ? 'TAG' : 'BIN';
      return {
        id: `${empresa.toLowerCase()}_${index + 1}`,
        numeroPlaca: `${empresaPrefix}${String(index + 1).padStart(4, '0')}`,
        modelo: `Modelo ${empresa} ${Math.floor(Math.random() * 10) + 1}`,
        empresa,
        instalado: Math.random() > 0.3, // 70% instaladas
        dataInstalacao: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        dataUltimaAtualizacao: new Date().toISOString(),
      };
    });
  };

  const totalItems = empresa === 'One' ? 156 : 89; // Diferentes totais por empresa
  const items = generatePlacas(empresa, startIndex, Math.min(pageSize, totalItems - startIndex));
  const hasNextPage = startIndex + pageSize < totalItems;

  if (Math.random() > 0.95) { // 5% chance de erro para simulação
    throw new Error(`Erro ao carregar dados da empresa ${empresa}`);
  }

  return {
    data: items,
    nextCursor: hasNextPage ? String(parseInt(pageParam) + 1) : undefined,
    hasNextPage,
    totalCount: totalItems,
  };
};

const updatePlacaStatus = async ({ id, instalado }: UpdateStatusParams): Promise<Placa> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay

  if (Math.random() > 0.9) { // 10% chance de erro
    throw new Error('Erro ao atualizar status da placa');
  }

  // Simular resposta da API
  return {
    id,
    numeroPlaca: `MOCK${id.slice(-4)}`,
    modelo: 'Modelo Updated',
    empresa: id.startsWith('one') ? 'One' : 'Binsat',
    instalado,
    dataInstalacao: instalado ? new Date().toISOString() : undefined,
    dataUltimaAtualizacao: new Date().toISOString(),
  };
};

// Hook principal para placas
export const usePlacas = (empresa: 'One' | 'Binsat') => {
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
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: updatePlacaStatus,
    onSuccess: (updatedPlaca) => {
      // Atualizar cache otimisticamente
      queryClient.setQueryData(['placas', empresa], (oldData: any) => {
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
      console.error('Erro ao atualizar status:', error);
    },
  });

  // Flatten dos dados paginados
  const placas = data?.pages.flatMap(page => page.data) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  // Estatísticas calculadas
  const estatisticas: Estatisticas = {
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

  // Verificar se está carregando (apenas carregamento inicial, não infinite scroll)
  const isLoadingInitial = isLoading && placas.length === 0;

  // Formatar mensagem de erro
  const errorMessage = error?.message || 'Erro desconhecido';

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

// Hook para estatísticas gerais (todas as empresas)
export const useEstatisticasGerais = () => {
  const queryOne = usePlacas('One');
  const queryBinsat = usePlacas('Binsat');

  // Combinar dados de ambas as empresas
  const todasPlacas = [...queryOne.placas, ...queryBinsat.placas];
  
  return {
    // Estatísticas gerais
    totalVeiculos: todasPlacas.length,
    totalInstalados: todasPlacas.filter(p => p.instalado).length,
    totalPendentes: todasPlacas.filter(p => !p.instalado).length,
    
    // Estatísticas por empresa
    estatisticasOne: queryOne.estatisticas,
    estatisticasBinsat: queryBinsat.estatisticas,
    
    // Estados de loading - apenas se não houver dados ainda
    isLoading: (queryOne.isLoading || queryBinsat.isLoading) && todasPlacas.length === 0,
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