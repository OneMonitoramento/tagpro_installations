// Path: ./src/components/Dashboard.tsx
'use client';

import React, { useState } from 'react';
import { RefreshCw, Car, CheckCircle, XCircle, BarChart3, LogOut, User } from 'lucide-react';
import { usePlacas, useEstatisticasGerais } from '@/hooks/usePlacas';
import { useAuth } from '@/contexts/AuthContext';
import { FiltrosPlacas, Estatisticas } from '@/types';
import InfiniteScrollList from './InfiniteScrollList';
import FiltrosPlacasComponent from './FiltrosPlacas';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  // Estado dos filtros
  const [filtros, setFiltros] = useState<FiltrosPlacas>({
    empresa: 'todos',
    status: 'todos',
    pesquisa: '',
  });

  // Queries separadas: 
  // - estatisticasGerais: SEMPRE dados totais (sem filtros) para os cards do dashboard
  // - queryPlacasLista: dados filtrados apenas para a lista de placas
  const estatisticasGerais = useEstatisticasGerais(); // SEMPRE dados totais
  const queryPlacasLista = usePlacas(filtros); // Apenas para a lista com filtros

  // Componente para cards de estatísticas
  const EstatisticasCard = ({ titulo, stats, cor }: { 
    titulo: string; 
    stats: Estatisticas;
    cor: string;
  }) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className={`h-6 w-6 ${cor}`} />
          <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Carregados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.instaladas}</div>
            <div className="text-sm text-gray-600">Instaladas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.pendentes}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.instaladas / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 mt-1 text-center">
            {stats.total > 0 ? Math.round((stats.instaladas / stats.total) * 100) : 0}% concluído
          </div>
        </div>
        
        {/* Indicador de total geral se disponível */}
        {stats.totalGeral && stats.totalGeral > stats.total && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            {stats.total} de {stats.totalGeral} placas carregadas
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard de Placas</h1>
              <p className="text-sm text-gray-600">Gerenciamento unificado de instalações</p>
            </div>
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {user?.role || 'Usuário'}
                </span>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={() => {
                  estatisticasGerais.refetchAll();
                  queryPlacasLista.refetch();
                }}
                disabled={estatisticasGerais.isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${estatisticasGerais.isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              
              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações Gerais - SEMPRE DADOS TOTAIS (não afetadas pelos filtros) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Última Sincronização */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Última Sincronização</div>
                <div className="font-semibold text-gray-900">
                  {new Date().toLocaleString('pt-BR')}
                </div>
              </div>
            </div>

            {/* Total de Veículos */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Veículos Encontrados</div>
                <div className="font-semibold text-gray-900">
                  {estatisticasGerais.totalVeiculos} veículos
                </div>
              </div>
            </div>

            {/* Total Instalados */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Instalados</div>
                <div className="font-semibold text-gray-900">
                  {estatisticasGerais.totalInstalados} placas
                </div>
              </div>
            </div>

            {/* Total Pendentes */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Pendentes</div>
                <div className="font-semibold text-gray-900">
                  {estatisticasGerais.totalPendentes} placas
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Status Geral */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
              <span className="text-sm text-gray-600">
                {estatisticasGerais.totalVeiculos > 0 ? 
                  Math.round((estatisticasGerais.totalInstalados / estatisticasGerais.totalVeiculos) * 100) : 0
                }% concluído
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${estatisticasGerais.totalVeiculos > 0 ? 
                    (estatisticasGerais.totalInstalados / estatisticasGerais.totalVeiculos) * 100 : 0
                  }%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Mensagens de Erro */}
        {queryPlacasLista.isError && (
          <ErrorMessage 
            message={queryPlacasLista.error || 'Erro ao carregar dados das placas'} 
            onRetry={() => queryPlacasLista.refetch()}
          />
        )}

        {/* Estatísticas por Empresa - SEMPRE DADOS TOTAIS (não afetadas pelos filtros) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <EstatisticasCard 
            titulo="LW SIM" 
            stats={estatisticasGerais.estatisticasLwsim}
            cor="text-blue-600"
          />
          <EstatisticasCard 
            titulo="Binsat" 
            stats={estatisticasGerais.estatisticasBinsat}
            cor="text-purple-600"
          />
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <FiltrosPlacasComponent
          filtros={filtros}
          onFiltrosChange={setFiltros}
          totalResultados={queryPlacasLista.estatisticas.totalGeral || 0}
          isLoading={queryPlacasLista.isLoading}
        />

        {/* Loading inicial apenas se não houver dados carregados */}
        {queryPlacasLista.isLoading && queryPlacasLista.placas.length === 0 && (
          <Loading message="Carregando placas..." size="lg" />
        )}

        {/* Lista de Placas - AFETADA PELOS FILTROS */}
        {(queryPlacasLista.placas.length > 0 || !queryPlacasLista.isLoading) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Lista de Placas
                </h2>
                <div className="text-sm text-gray-600">
                  {queryPlacasLista.estatisticas.instaladas} de {queryPlacasLista.estatisticas.total} instaladas
                  {queryPlacasLista.hasNextPage && (
                    <span className="ml-2 text-blue-600">(scroll para mais)</span>
                  )}
                </div>
              </div>

              {/* Lista com Infinite Scroll */}
              <InfiniteScrollList
                placas={queryPlacasLista.placas}
                onToggleStatus={queryPlacasLista.toggleStatus}
                hasNextPage={queryPlacasLista.hasNextPage}
                isFetchingNextPage={queryPlacasLista.isFetchingNextPage}
                fetchNextPage={queryPlacasLista.fetchNextPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;