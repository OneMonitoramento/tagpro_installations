// Path: ./src/components/InfiniteScrollList.tsx
'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Car, CheckCircle, XCircle } from 'lucide-react';
import { Placa } from '@/types';

interface InfiniteScrollListProps {
  placas: Placa[];
  onToggleStatus: (id: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

// Função para obter configuração da empresa
const getEmpresaConfig = (empresa: 'lwsim' | 'binsat') => {
  const configs = {
    lwsim: {
      name: 'LW SIM',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      dotColor: 'bg-blue-600',
    },
    binsat: {
      name: 'Binsat',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      dotColor: 'bg-purple-600',
    },
  };
  
  return configs[empresa];
};

// Componente para cada card de placa
const PlacaCard = ({ 
  placa, 
  onToggleStatus
}: { 
  placa: Placa; 
  onToggleStatus: (id: string) => void;
}) => {
  const empresaConfig = getEmpresaConfig(placa.empresa);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-gray-600" />
          <span className="font-semibold text-gray-900">{placa.numeroPlaca}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${empresaConfig.bgColor} ${empresaConfig.textColor}`}>
            {empresaConfig.name}
          </span>
        </div>
        
        {/* Botão de Status */}
        <button
          onClick={() => onToggleStatus(placa.id)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            placa.instalado 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
          title={`Clique para ${placa.instalado ? 'marcar como pendente' : 'marcar como instalado'}`}
        >
          {placa.instalado ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {placa.instalado ? 'Instalado' : 'Pendente'}
        </button>
      </div>
      
      <div className="text-sm text-gray-600">
        <p className="mb-1">Modelo: {placa.modelo}</p>
        {placa.instalado && placa.dataInstalacao && (
          <p>Instalado em: {new Date(placa.dataInstalacao).toLocaleDateString('pt-BR')}</p>
        )}
      </div>
    </div>
  );
};

const InfiniteScrollList: React.FC<InfiniteScrollListProps> = ({
  placas,
  onToggleStatus,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Callback para intersection observer
  const lastElementRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (isFetchingNextPage) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  if (placas.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg">Nenhuma placa encontrada</p>
        <p className="text-gray-500 text-sm mt-2">
          Tente ajustar os filtros de pesquisa para encontrar as placas desejadas
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Lista de placas */}
      <div className="space-y-4">
        {placas.map((placa, index) => (
          <div
            key={placa.id}
            ref={index === placas.length - 1 ? lastElementRefCallback : null}
          >
            <PlacaCard
              placa={placa}
              onToggleStatus={onToggleStatus}
            />
          </div>
        ))}
      </div>

      {/* Indicador de loading para infinite scroll */}
      {isFetchingNextPage && (
        <div className="mt-6 flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Carregando mais placas...</span>
          </div>
        </div>
      )}

      {/* Indicador de fim da lista */}
      {!hasNextPage && placas.length > 0 && (
        <div className="mt-6 text-center py-4 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Todas as placas foram carregadas ({placas.length} total)
          </p>
        </div>
      )}
    </>
  );
};

export default InfiniteScrollList;