// Path: ./src/hooks/usePlacas.ts
'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Placa, PlacasResponse, UpdateStatusParams, Estatisticas } from '@/types';

interface FiltrosPlacas {
  empresa?: 'lwsim' | 'binsat' | 'todos';
  status?: 'instalado' | 'pendente' | 'todos';
  pesquisa?: string;
}

// Simulação de API calls com filtros
const fetchPlacas = async ({ 
  pageParam = '0', 
  filtros 
}: { 
  pageParam?: string; 
  filtros: FiltrosPlacas;
}): Promise<PlacasResponse> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simular delay

  const pageSize = 20;
  const startIndex = parseInt(pageParam) * pageSize;
  
  // Gerar dados mock de ambas as empresas
  const generateAllPlacas = (): Placa[] => {
    const todasPlacas: Placa[] = [];
    
    // Gerar placas da LW SIM (antiga "One")
    for (let i = 0; i < 156; i++) {
      todasPlacas.push({
        id: `lwsim_${i + 1}`,
        numeroPlaca: `LWS${String(i + 1).padStart(4, '0')}`,
        modelo: `Modelo LW SIM ${Math.floor(Math.random() * 10) + 1}`,
        empresa: 'lwsim' as const,
        instalado: Math.random() > 0.3, // 70% instaladas
        dataInstalacao: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        dataUltimaAtualizacao: new Date().toISOString(),
      });
    }
    
    // Gerar placas da Binsat
    for (let i = 0; i < 89; i++) {
      todasPlacas.push({
        id: `binsat_${i + 1}`,
        numeroPlaca: `BIN${String(i + 1).padStart(4, '0')}`,
        modelo: `Modelo Binsat ${Math.floor(Math.random() * 10) + 1}`,
        empresa: 'binsat' as const,
        instalado: Math.random() > 0.3, // 70% instaladas
        dataInstalacao: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        dataUltimaAtualizacao: new Date().toISOString(),
      });
    }
    
    return todasPlacas;
  };

  let placasFiltradas = generateAllPlacas();

  // Aplicar filtro de empresa
  if (filtros.empresa && filtros.empresa !== 'todos') {
    placasFiltradas = placasFiltradas.filter(placa => placa.empresa === filtros.empresa);
  }

  // Aplicar filtro de status
  if (filtros.status && filtros.status !== 'todos') {
    const statusBoolean = filtros.status === 'instalado';
    placasFiltradas = placasFiltradas.filter(placa => placa.instalado === statusBoolean);
  }

  // Aplicar filtro de pesquisa
  if (filtros.pesquisa && filtros.pesquisa.trim() !== '') {
    const termoPesquisa = filtros.pesquisa.toLowerCase();
    placasFiltradas = placasFiltradas.filter(placa => 
      placa.numeroPlaca.toLowerCase().includes(termoPesquisa) ||
      placa.modelo.toLowerCase().includes(termoPesquisa)
    );
  }

  // Paginação
  const totalItems = placasFiltradas.length;
  const items = placasFiltradas.slice(startIndex, startIndex + pageSize);
  const hasNextPage = startIndex + pageSize < totalItems;

  if (Math.random() > 0.98) { // 2% chance de erro para simulação
    throw new Error('Erro ao carregar dados das placas');
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

  // Determinar empresa baseada no ID
  const empresa = id.startsWith('lwsim') ? 'lwsim' : 'binsat';

  // Simular resposta da API
  return {
    id,
    numeroPlaca: `MOCK${id.slice(-4)}`,
    modelo: 'Modelo Updated',
    empresa,
    instalado,
    dataInstalacao: instalado ? new Date().toISOString() : undefined,
    dataUltimaAtualizacao: new Date().toISOString(),
  };
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
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['placas', filtros],
    queryFn: ({ pageParam }) => fetchPlacas({ pageParam, filtros }),
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
      queryClient.setQueryData(['placas', filtros], (oldData: any) => {
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

// Hook separado para estatísticas gerais (SEMPRE dados totais, sem filtros)
export const useEstatisticasGerais = () => {
  const queryTotais = usePlacas({}); // Sempre sem filtros para estatísticas
  
  // Separar estatísticas por empresa (dados totais)
  const estatisticasLwsim = {
    total: queryTotais.placas.filter(p => p.empresa === 'lwsim').length,
    instaladas: queryTotais.placas.filter(p => p.empresa === 'lwsim' && p.instalado).length,
    pendentes: queryTotais.placas.filter(p => p.empresa === 'lwsim' && !p.instalado).length,
  };

  const estatisticasBinsat = {
    total: queryTotais.placas.filter(p => p.empresa === 'binsat').length,
    instaladas: queryTotais.placas.filter(p => p.empresa === 'binsat' && p.instalado).length,
    pendentes: queryTotais.placas.filter(p => p.empresa === 'binsat' && !p.instalado).length,
  };
  
  return {
    // Estatísticas gerais (SEMPRE TOTAIS)
    totalVeiculos: queryTotais.placas.length,
    totalInstalados: queryTotais.placas.filter(p => p.instalado).length,
    totalPendentes: queryTotais.placas.filter(p => !p.instalado).length,
    
    // Estatísticas por empresa (SEMPRE TOTAIS)
    estatisticasLwsim,
    estatisticasBinsat,
    
    // Estados de loading
    isLoading: queryTotais.isLoading,
    isError: queryTotais.isError,
    
    // Ações
    refetchAll: queryTotais.refetch,
  };
};