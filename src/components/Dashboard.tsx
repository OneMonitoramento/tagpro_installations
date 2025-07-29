// Path: ./src/components/Dashboard.tsx
"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Car,
  CheckCircle,
  XCircle,
  BarChart3,
  LogOut,
  User,
  Download,
} from "lucide-react";
import { usePlacas } from "@/hooks/usePlacas";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuth } from "@/contexts/AuthContext";
import { FiltrosPlacas, Estatisticas } from "@/types";
import InfiniteScrollList from "./InfiniteScrollList";
import FiltrosPlacasComponent from "./FiltrosPlacas";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";

// Componente para cards de estatísticas
const EstatisticasCard = ({
  titulo,
  stats,
  cor,
  empresa,
}: {
  titulo: string;
  stats: Estatisticas;
  cor: string;
  empresa: 'lwsim' | 'binsat';
}) => {
  console.log(`Rendering EstatisticasCard for ${titulo}`, stats);

  const handleExportExcel = async () => {
    try {
      const response = await fetch(`/api/export?empresa=${empresa}`);
      
      if (!response.ok) {
        throw new Error('Erro ao exportar dados');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `veiculos_${empresa}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados para Excel');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className={`h-6 w-6 ${cor}`} />
          <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          title={`Exportar dados da ${titulo} para Excel`}
        >
          <Download className="h-4 w-4" />
          Excel
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.instaladas}
          </div>
          <div className="text-sm text-gray-600">Instaladas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pendentes}
          </div>
          <div className="text-sm text-gray-600">Pendentes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {stats.inativas}
          </div>
          <div className="text-sm text-gray-600">Inativas</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                stats.total > 0 ? (stats.instaladas / stats.total) * 100 : 0
              }%`,
            }}
          ></div>
        </div>
        <div className="text-sm text-gray-600 mt-1 text-center">
          {stats.total > 0
            ? Math.round((stats.instaladas / stats.total) * 100)
            : 0}
          % concluído
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

const Dashboard = () => {
  const logout = () =>{}
  const user = {
    email: "admin@empresa.com",
    id: "1",
    name: "Administrador",
    role: "admin",
  };
  console.log("Rendering Dashboard", user);
  // Estado dos filtros
  const [filtros, setFiltros] = useState<FiltrosPlacas>({
    empresa: "todos",
    status: "todos",
    pesquisa: "",
  });

  // Queries separadas:
  // - dashboardStats: estatísticas gerais e informações de sincronização (incluindo dados por empresa)
  // - queryPlacasLista: dados filtrados apenas para a lista de placas
  const dashboardStats = useDashboardStats();
  const queryPlacasLista = usePlacas(filtros); // Apenas para a lista com filtros

  console.log("dashboardStats", dashboardStats);
  console.log("queryPlacasLista", queryPlacasLista);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard de Placas
              </h1>
              <p className="text-sm text-gray-600">
                Gerenciamento unificado de instalações
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {user?.role || "Usuário"}
                </span>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => {
                  dashboardStats.refetch();
                  queryPlacasLista.refetch();
                }}
                disabled={dashboardStats.isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    dashboardStats.isLoading ? "animate-spin" : ""
                  }`}
                />
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
        {/* Seção de Totalização */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Totalização Geral</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Total de Veículos */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total de Veículos</div>
                <div className="font-semibold text-gray-900">
                  {dashboardStats.stats?.totalization.totalVehicles || 0} veículos
                </div>
              </div>
            </div>

            {/* Total de Clientes */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total de Clientes</div>
                <div className="font-semibold text-gray-900">
                  {dashboardStats.stats?.totalization.totalClients || 0} clientes
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
                  {dashboardStats.stats?.totalization.totalInstalled || 0} placas
                </div>
              </div>
            </div>

            {/* Total Pendentes */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Pendentes</div>
                <div className="font-semibold text-gray-900">
                  {dashboardStats.stats?.totalization.totalPending || 0} placas
                </div>
              </div>
            </div>

            {/* Total Inativos */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Inativos</div>
                <div className="font-semibold text-gray-900">
                  {dashboardStats.stats?.totalization.totalInactive || 0} placas
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Status Geral */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progresso Geral
              </span>
              <span className="text-sm text-gray-600">
                {dashboardStats.stats?.totalization.totalVehicles && dashboardStats.stats.totalization.totalVehicles > 0
                  ? Math.round(
                      (dashboardStats.stats.totalization.totalInstalled /
                        dashboardStats.stats.totalization.totalVehicles) *
                        100
                    )
                  : 0}
                % concluído
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    dashboardStats.stats?.totalization.totalVehicles && dashboardStats.stats.totalization.totalVehicles > 0
                      ? (dashboardStats.stats.totalization.totalInstalled /
                          dashboardStats.stats.totalization.totalVehicles) *
                        100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Seção de Sincronização */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Informações de Sincronização</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Última Sincronização */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  Última Sincronização
                </div>
                <div className="font-semibold text-gray-900">
                  {dashboardStats.stats?.syncInfo.lastSyncDate 
                    ? new Date(dashboardStats.stats.syncInfo.lastSyncDate).toLocaleString("pt-BR")
                    : "Não disponível"
                  }
                </div>
              </div>
            </div>

            {/* Novos Veículos */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Novos Veículos</div>
                <div className="font-semibold text-gray-900">
                  {dashboardStats.stats?.syncInfo.newVehicles || 0} sincronizados
                </div>
              </div>
            </div>

            {/* Veículos Alterados */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Veículos Alterados</div>
                <div className="font-semibold text-gray-900">
                  {dashboardStats.stats?.syncInfo.updatedVehicles || 0} sincronizados
                </div>
              </div>
            </div>

            {/* Clientes Alterados */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Clientes Alterados</div>
                <div className="font-semibold text-gray-900">
                  {dashboardStats.stats?.syncInfo.updatedClients || 0} sincronizados
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagens de Erro */}
        {dashboardStats.isError && (
          <ErrorMessage
            message={
              dashboardStats.error || "Erro ao carregar estatísticas do dashboard"
            }
            onRetry={() => dashboardStats.refetch()}
          />
        )}
        {queryPlacasLista.isError && (
          <ErrorMessage
            message={
              queryPlacasLista.error || "Erro ao carregar dados das placas"
            }
            onRetry={() => queryPlacasLista.refetch()}
          />
        )}

        {/* Estatísticas por Empresa - SEMPRE DADOS TOTAIS (não afetadas pelos filtros) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <EstatisticasCard
            titulo="LW SIM"
            stats={{
              total: dashboardStats.stats?.companies.lwsim.total || 0,
              instaladas: dashboardStats.stats?.companies.lwsim.installed || 0,
              pendentes: dashboardStats.stats?.companies.lwsim.pending || 0,
              inativas: dashboardStats.stats?.companies.lwsim.inactive || 0
            }}
            cor="text-blue-600"
            empresa="lwsim"
          />
          <EstatisticasCard
            titulo="Binsat"
            stats={{
              total: dashboardStats.stats?.companies.binsat.total || 0,
              instaladas: dashboardStats.stats?.companies.binsat.installed || 0,
              pendentes: dashboardStats.stats?.companies.binsat.pending || 0,
              inativas: dashboardStats.stats?.companies.binsat.inactive || 0
            }}
            cor="text-purple-600"
            empresa="binsat"
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
        {(queryPlacasLista.placas.length > 0 ||
          !queryPlacasLista.isLoading) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Lista de Placas
                </h2>
                <div className="text-sm text-gray-600">
                  {queryPlacasLista.estatisticas.instaladas} de{" "}
                  {queryPlacasLista.estatisticas.total} instaladas
                  {queryPlacasLista.hasNextPage && (
                    <span className="ml-2 text-blue-600">
                      (scroll para mais)
                    </span>
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
