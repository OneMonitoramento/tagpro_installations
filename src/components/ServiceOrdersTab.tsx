// Path: ./src/components/ServiceOrdersTab.tsx
"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { useServiceOrders } from "@/hooks/useServiceOrders";
import { FiltrosServiceOrders } from "@/types";
import ServiceOrdersList from "./ServiceOrdersList";
import FiltrosServiceOrdersComponent from "./FiltrosServiceOrders";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";
import { useToast } from "@/contexts/ToastContext";

interface ServiceOrdersTabProps {
  filtros: FiltrosServiceOrders;
  onFiltrosChange: (novosFiltros: FiltrosServiceOrders) => void;
}

const ServiceOrdersTab: React.FC<ServiceOrdersTabProps> = ({
  filtros,
  onFiltrosChange,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const queryServiceOrders = useServiceOrders(filtros);
  const { showSuccess, showError } = useToast();

  const handleStatusUpdate = (id: string, status: string) => {
    // Invalidate and refetch the service orders query to update the list
    queryServiceOrders.refetch();
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      
      // Build query params based on current filters
      const params = new URLSearchParams();
      if (filtros.empresa) params.set('empresa', filtros.empresa);
      if (filtros.status) params.set('status', filtros.status);
      if (filtros.pesquisa) params.set('pesquisa', filtros.pesquisa);
      if (filtros.tipoInstalacao) params.set('tipoInstalacao', filtros.tipoInstalacao);
      
      const response = await fetch(`/api/export-service-orders?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao exportar dados');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Extract filename from response header or create default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'ordens_servico_export.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess('Ordens de serviço exportadas com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      showError('Erro ao exportar ordens de serviço');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Barra de Pesquisa e Filtros */}
      <FiltrosServiceOrdersComponent
        filtros={filtros}
        onFiltrosChange={onFiltrosChange}
        totalResultados={queryServiceOrders.estatisticas.totalGeral || 0}
        isLoading={queryServiceOrders.isLoading}
      />

      {/* Mensagem de Erro */}
      {queryServiceOrders.isError && (
        <ErrorMessage
          message={
            queryServiceOrders.error || "Erro ao carregar ordens de serviço"
          }
          onRetry={() => queryServiceOrders.refetch()}
        />
      )}

      {/* Loading inicial apenas se não houver dados carregados */}
      {queryServiceOrders.isLoading && queryServiceOrders.serviceOrders.length === 0 && (
        <Loading message="Carregando ordens de serviço..." size="lg" />
      )}

      {/* Lista de Ordens de Serviço */}
      {(queryServiceOrders.serviceOrders.length > 0 ||
        !queryServiceOrders.isLoading) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Lista de Ordens de Serviço
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleExportExcel}
                  disabled={isExporting || queryServiceOrders.isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Exportar ordens de serviço para Excel"
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? 'Exportando...' : 'Exportar Excel'}
                </button>
                <div className="text-sm text-gray-600">
                  {queryServiceOrders.estatisticas.total} de{" "}
                  {queryServiceOrders.estatisticas.totalGeral} carregadas
                  {queryServiceOrders.hasNextPage && (
                    <span className="ml-2 text-blue-600">
                      (scroll para mais)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Lista com Infinite Scroll */}
            <ServiceOrdersList
              serviceOrders={queryServiceOrders.serviceOrders}
              hasNextPage={queryServiceOrders.hasNextPage}
              isFetchingNextPage={queryServiceOrders.isFetchingNextPage}
              fetchNextPage={queryServiceOrders.fetchNextPage}
              onStatusUpdate={handleStatusUpdate}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceOrdersTab;