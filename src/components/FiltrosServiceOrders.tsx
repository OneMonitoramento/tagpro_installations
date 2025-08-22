// Path: ./src/components/FiltrosServiceOrders.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { FiltrosServiceOrders } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface FiltrosServiceOrdersProps {
  filtros: FiltrosServiceOrders;
  onFiltrosChange: (novosFiltros: FiltrosServiceOrders) => void;
  totalResultados: number;
  isLoading?: boolean;
}

const FiltrosServiceOrdersComponent: React.FC<FiltrosServiceOrdersProps> = ({
  filtros,
  onFiltrosChange,
  totalResultados,
  isLoading = false,
}) => {
  const [pesquisaLocal, setPesquisaLocal] = useState(filtros.pesquisa || '');
  const { user } = useAuth();

  // Get user role-based company filter
  const getUserCompanyFilter = () => {
    if (user?.role === 'binsat') return 'binsat';
    if (user?.role === 'lwsim') return 'lw_sim';
    if (user?.role === 'tagpro') return 'todos';
    return 'todos'; // default for other roles like admin
  };

  // Check if company filter should be disabled
  const isCompanyFilterDisabled = () => {
    return user?.role === 'binsat'; // Only binsat role has disabled filter
  };

  // Set default filters based on user role
  useEffect(() => {
    if (user && (!filtros.empresa || !filtros.status || !filtros.tipoInstalacao)) {
      // Apply default filters when user is loaded and filters are not set
      const defaultFilters: FiltrosServiceOrders = {
        empresa: getUserCompanyFilter(),
        status: 'pending', // Always default to pending
        pesquisa: filtros.pesquisa || '',
        tipoInstalacao: 'todos', // Default to all types
        evento: 'todos', // Default to all events
      };

      onFiltrosChange(defaultFilters);
    }
  }, [user, filtros.empresa, filtros.status, filtros.tipoInstalacao]); // Run when user or filters change

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

  const handleEmpresaChange = (empresa: 'lw_sim' | 'binsat' | 'todos') => {
    onFiltrosChange({
      ...filtros,
      empresa,
    });
  };

  const handleStatusChange = (status: string) => {
    onFiltrosChange({
      ...filtros,
      status,
    });
  };

  const handleTipoInstalacaoChange = (tipoInstalacao: 'installation' | 'uninstallation' | 'todos') => {
    onFiltrosChange({
      ...filtros,
      tipoInstalacao,
    });
  };

  const handleEventoChange = (evento: 'new-vehicle' | 'inactivated_vehicle' | 'reactivated_vehicle' | 'todos') => {
    onFiltrosChange({
      ...filtros,
      evento,
    });
  };

  const limparFiltros = () => {
    setPesquisaLocal('');
    onFiltrosChange({
      empresa: getUserCompanyFilter(),
      status: 'pending', // Default to pending
      pesquisa: '',
      tipoInstalacao: 'todos',
      evento: 'todos',
    });
  };

  const temFiltrosAtivos = () => {
    return (
      (filtros.empresa && filtros.empresa !== 'todos') ||
      (filtros.status && filtros.status !== 'todos') ||
      (filtros.pesquisa && filtros.pesquisa.trim() !== '') ||
      (filtros.tipoInstalacao && filtros.tipoInstalacao !== 'todos') ||
      (filtros.evento && filtros.evento !== 'todos')
    );
  };

  const statusOptions = [
    { value: 'todos', label: 'Todos os status' },
    { value: 'pending', label: 'Pendente' },
    { value: 'done', label: 'Concluído' },
  ];

  const tipoInstalacaoOptions = [
    { value: 'todos', label: 'Todos os tipos' },
    { value: 'installation', label: 'Instalação' },
    { value: 'uninstallation', label: 'Remoção' },
  ];

  const eventoOptions = [
    { value: 'todos', label: 'Todos os eventos' },
    { value: 'new-vehicle', label: 'Novo veículo' },
    { value: 'inactivated_vehicle', label: 'Veículo inativado' },
    { value: 'reactivated_vehicle', label: 'Veículo reativado' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Barra de Pesquisa */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por ID, número da OS, placa, cliente ou descrição..."
            value={pesquisaLocal}
            onChange={(e) => setPesquisaLocal(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

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

      {/* Filtros - Sempre Visíveis */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro de Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa
            </label>
            <div className="space-y-2">
              {[
                { value: 'todos', label: 'Todas as empresas' },
                { value: 'lw_sim', label: 'LW SIM' },
                { value: 'binsat', label: 'Binsat' },
              ].map((opcao) => (
                <label key={opcao.value} className="flex items-center">
                  <input
                    type="radio"
                    name="empresa"
                    value={opcao.value}
                    checked={filtros.empresa === opcao.value || (!filtros.empresa && opcao.value === 'todos')}
                    onChange={() => handleEmpresaChange(opcao.value as "lw_sim" | "binsat" | "todos")}
                    disabled={user?.role === 'binsat' && opcao.value !== 'binsat'}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50"
                  />
                  <span className={`ml-2 text-sm ${user?.role === 'binsat' && opcao.value !== 'binsat' ? 'text-gray-400' : 'text-gray-700'}`}>{opcao.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtro de Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status da Ordem de Serviço
            </label>
            <div className="space-y-2">
              {statusOptions.map((opcao) => (
                <label key={opcao.value} className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={opcao.value}
                    checked={filtros.status === opcao.value || (!filtros.status && opcao.value === 'pending')}
                    onChange={() => handleStatusChange(opcao.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{opcao.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtro de Tipo de Instalação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Instalação
            </label>
            <div className="space-y-2">
              {tipoInstalacaoOptions.map((opcao) => (
                <label key={opcao.value} className="flex items-center">
                  <input
                    type="radio"
                    name="tipoInstalacao"
                    value={opcao.value}
                    checked={filtros.tipoInstalacao === opcao.value || (!filtros.tipoInstalacao && opcao.value === 'todos')}
                    onChange={() => handleTipoInstalacaoChange(opcao.value as 'installation' | 'uninstallation' | 'todos')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{opcao.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtro de Evento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evento
            </label>
            <div className="space-y-2">
              {eventoOptions.map((opcao) => (
                <label key={opcao.value} className="flex items-center">
                  <input
                    type="radio"
                    name="evento"
                    value={opcao.value}
                    checked={filtros.evento === opcao.value || (!filtros.evento && opcao.value === 'todos')}
                    onChange={() => handleEventoChange(opcao.value as 'new-vehicle' | 'inactivated_vehicle' | 'reactivated_vehicle' | 'todos')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{opcao.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

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

export default FiltrosServiceOrdersComponent;