// Path: ./src/components/ServiceOrdersTab.tsx
"use client";

import React from "react";
import { useServiceOrders } from "@/hooks/useServiceOrders";
import { FiltrosServiceOrders } from "@/types";
import ServiceOrdersList from "./ServiceOrdersList";
import FiltrosServiceOrdersComponent from "./FiltrosServiceOrders";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";

interface ServiceOrdersTabProps {
  filtros: FiltrosServiceOrders;
  onFiltrosChange: (novosFiltros: FiltrosServiceOrders) => void;
}

const ServiceOrdersTab: React.FC<ServiceOrdersTabProps> = ({
  filtros,
  onFiltrosChange,
}) => {
  const queryServiceOrders = useServiceOrders(filtros);

  const handleStatusUpdate = (id: string, status: string) => {
    // Invalidate and refetch the service orders query to update the list
    queryServiceOrders.refetch();
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