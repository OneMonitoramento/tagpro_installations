// Path: ./src/components/InfiniteScrollList.tsx
'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Car, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Placa } from '@/types';

interface InfiniteScrollListProps {
  placas: Placa[];
  onToggleStatus: (id: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  isUpdatingStatus?: boolean;
}

const PlacaCard = ({ 
  placa, 
  onToggleStatus, 
  isUpdating 
}: { 
  placa: Placa; 
  onToggleStatus: (id: string) => void;
  isUpdating?: boolean;
}) => (
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
          {placa.empresa}
        </span>
      </div>
      <button
        onClick={() => onToggleStatus(placa.id)}
        disabled={isUpdating}
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
          placa.instalado 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'bg-red-100 text-red-700 hover:bg-red-200'
        }`}
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : placa.instalado ? (
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

const InfiniteScrollList = ({
  placas,
  onToggleStatus,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isUpdatingStatus
}: InfiniteScrollListProps) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // Trigger next page when sentinel comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && fetchNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (placas.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma placa encontrada</h3>
        <p className="mt-1 text-sm text-gray-500">Não há placas para esta empresa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lista de placas */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {placas.map((placa) => (
          <PlacaCard
            key={placa.id}
            placa={placa}
            onToggleStatus={onToggleStatus}
            isUpdating={isUpdatingStatus}
          />
        ))}
        
        {/* Sentinel para infinite scroll */}
        {hasNextPage && (
          <div ref={ref} className="flex justify-center py-4">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Carregando mais placas...</span>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Role para carregar mais</div>
            )}
          </div>
        )}
        
        {/* Indicador de fim da lista */}
        {!hasNextPage && placas.length > 0 && (
          <div className="text-center py-4">
            <div className="text-sm text-gray-500">
              ✅ Todas as placas foram carregadas ({placas.length} itens)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfiniteScrollList;