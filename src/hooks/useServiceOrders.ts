// Path: ./src/hooks/useServiceOrders.ts
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { ServiceOrder, FiltrosServiceOrders, ServiceOrdersResponse } from '@/types';

// API call para buscar ordens de serviço com filtros e paginação
const fetchServiceOrders = async ({
  pageParam = undefined,
  filtros
}: {
  pageParam?: string;
  filtros: FiltrosServiceOrders;
}): Promise<ServiceOrdersResponse> => {
  const params = new URLSearchParams();
  
  // Adiciona filtros à query string
  if (filtros.empresa && filtros.empresa !== 'todos') {
    params.set('empresa', filtros.empresa);
  }
  if (filtros.status && filtros.status !== 'todos') {
    params.set('status', filtros.status);
  }
  if (filtros.pesquisa && filtros.pesquisa.trim()) {
    params.set('pesquisa', filtros.pesquisa);
  }
  if (filtros.tipoInstalacao && filtros.tipoInstalacao !== 'todos') {
    params.set('tipoInstalacao', filtros.tipoInstalacao);
  }
  if (pageParam) {
    params.set('cursor', pageParam);
  }
  
  const response = await fetch(`/api/service-orders?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar ordens de serviço: ${response.status}`);
  }
  
  return response.json();
};

export const useServiceOrders = (filtros: FiltrosServiceOrders) => {
  const query = useInfiniteQuery({
    queryKey: ['serviceOrders', filtros],
    queryFn: ({ pageParam }) => fetchServiceOrders({ pageParam: pageParam || undefined, filtros }),
    getNextPageParam: (lastPage) => 
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Flattened data para facilitar o uso
  const serviceOrders: ServiceOrder[] = query.data?.pages?.flatMap(page => page.data) || [];
  
  // Estatísticas baseadas nos dados carregados
  const estatisticas = {
    total: serviceOrders.length,
    totalGeral: query.data?.pages?.[0]?.totalCount || 0,
  };

  return {
    serviceOrders,
    estatisticas,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error?.message,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
};