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

// Componente para cada card de placa
const PlacaCard = ({ 
  placa, 
  onToggleStatus
}: { 
  placa: Placa; 
  onToggleStatus: (id: string) => void;
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-gray-600" />
          <span className="font-semibold text-gray-900">{placa.numeroPlaca}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            placa.empresa === 'One' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-purple-100 text-purple-700'
          }`}>
            {placa.empresa === 'One' ? 'TagPro' : 'Binsat'}
          </span>
        </div>
        
        {/* Botão de Status - sem spinner */}
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
  const observerRef = useRef<IntersectionObserver>();

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

      {/* Barra de loading simples */}
      {isFetchingNextPage && (
        <div className="mt-4">
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfiniteScrollList;