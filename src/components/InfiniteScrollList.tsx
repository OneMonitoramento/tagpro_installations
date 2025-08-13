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
const getEmpresaConfig = (empresa: 'lw_sim' | 'binsat') => {
  const configs = {
    lw_sim: {
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
  const empresaConfig = placa.empresa ? getEmpresaConfig(placa.empresa) : null;
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-gray-600" />
          <span className="font-semibold text-gray-900">{placa.numeroPlaca}</span>
          {placa.empresa && empresaConfig && (
            <span className={`text-xs px-2 py-1 rounded-full ${empresaConfig.bgColor} ${empresaConfig.textColor}`}>
              {empresaConfig.name}
            </span>
          )}
        </div>
        
        {/* Badge de Status */}
        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            placa.status === 'installed'
              ? 'bg-green-100 text-green-700'
              : placa.status === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {placa.status === 'installed' ? (
            <CheckCircle className="h-4 w-4" />
          ) : placa.status === 'pending' ? (
            <XCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {placa.status === 'installed' 
            ? 'Instalado' 
            : placa.status === 'pending'
            ? 'Pendente'
            : 'Inativo'
          }
        </div>
      </div>
      
      <div className="text-sm text-gray-600 space-y-1">
        <p>Modelo: {placa.modelo}</p>
        {placa.vin && (
          <p>VIN: <span className="font-mono text-xs">{placa.vin}</span></p>
        )}
        {placa.renavam && (
          <p>RENAVAM: <span className="font-mono text-xs">{placa.renavam}</span></p>
        )}
        {placa.status === 'installed' && placa.dataInstalacao && (
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
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
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
            key={placa.id} // Usar ID único do registro do banco
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