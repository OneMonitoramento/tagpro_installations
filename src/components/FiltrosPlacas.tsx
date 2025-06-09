// Path: ./src/components/FiltrosPlacas.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { FiltrosPlacas } from '@/types';

interface FiltrosPlacasProps {
  filtros: FiltrosPlacas;
  onFiltrosChange: (novosFiltros: FiltrosPlacas) => void;
  totalResultados: number;
  isLoading?: boolean;
}

const FiltrosPlacasComponent: React.FC<FiltrosPlacasProps> = ({
  filtros,
  onFiltrosChange,
  totalResultados,
  isLoading = false,
}) => {
  const [pesquisaLocal, setPesquisaLocal] = useState(filtros.pesquisa || '');
  const [showFiltrosAvancados, setShowFiltrosAvancados] = useState(false);

  // Debounce da pesquisa
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltrosChange({
        ...filtros,
        pesquisa: pesquisaLocal,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [pesquisaLocal]);

  const handleEmpresaChange = (empresa: 'lwsim' | 'binsat' | 'todos') => {
    onFiltrosChange({
      ...filtros,
      empresa,
    });
  };

  const handleStatusChange = (status: 'instalado' | 'pendente' | 'todos') => {
    onFiltrosChange({
      ...filtros,
      status,
    });
  };

  const limparFiltros = () => {
    setPesquisaLocal('');
    onFiltrosChange({
      empresa: 'todos',
      status: 'todos',
      pesquisa: '',
    });
  };

  const temFiltrosAtivos = () => {
    return (
      (filtros.empresa && filtros.empresa !== 'todos') ||
      (filtros.status && filtros.status !== 'todos') ||
      (filtros.pesquisa && filtros.pesquisa.trim() !== '')
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Barra de Pesquisa */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por número da placa ou modelo..."
            value={pesquisaLocal}
            onChange={(e) => setPesquisaLocal(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
        
        <button
          onClick={() => setShowFiltrosAvancados(!showFiltrosAvancados)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
            showFiltrosAvancados || temFiltrosAtivos()
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Filter className="h-5 w-5" />
          Filtros
          {temFiltrosAtivos() && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {[filtros.empresa !== 'todos' ? 1 : 0, filtros.status !== 'todos' ? 1 : 0, filtros.pesquisa ? 1 : 0].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>

        {temFiltrosAtivos() && (
          <button
            onClick={limparFiltros}
            className="flex items-center gap-2 px-3 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            title="Limpar filtros"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Filtros Avançados */}
      {showFiltrosAvancados && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro de Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <div className="space-y-2">
                {[
                  { value: 'todos', label: 'Todas as empresas' },
                  { value: 'lwsim', label: 'LW SIM' },
                  { value: 'binsat', label: 'Binsat' },
                ].map((opcao) => (
                  <label key={opcao.value} className="flex items-center">
                    <input
                      type="radio"
                      name="empresa"
                      value={opcao.value}
                      checked={filtros.empresa === opcao.value || (!filtros.empresa && opcao.value === 'todos')}
                      onChange={() => handleEmpresaChange(opcao.value as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">{opcao.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro de Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status de Instalação
              </label>
              <div className="space-y-2">
                {[
                  { value: 'todos', label: 'Todos os status' },
                  { value: 'instalado', label: 'Instalado' },
                  { value: 'pendente', label: 'Pendente' },
                ].map((opcao) => (
                  <label key={opcao.value} className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value={opcao.value}
                      checked={filtros.status === opcao.value || (!filtros.status && opcao.value === 'todos')}
                      onChange={() => handleStatusChange(opcao.value as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">{opcao.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resultado da Pesquisa */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {isLoading ? (
              'Carregando resultados...'
            ) : (
              `${totalResultados} resultado${totalResultados !== 1 ? 's' : ''} ${temFiltrosAtivos() ? 'encontrado' : 'disponível'}${totalResultados !== 1 ? 's' : ''}`
            )}
          </span>

          {temFiltrosAtivos() && (
            <span className="text-blue-600">
              Filtros aplicados
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FiltrosPlacasComponent;