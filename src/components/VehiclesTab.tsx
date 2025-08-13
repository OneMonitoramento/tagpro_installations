// Path: ./src/components/VehiclesTab.tsx
"use client";

import React from "react";
import { usePlacas } from "@/hooks/usePlacas";
import { FiltrosPlacas } from "@/types";
import InfiniteScrollList from "./InfiniteScrollList";
import FiltrosPlacasComponent from "./FiltrosPlacas";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";

interface VehiclesTabProps {
  filtros: FiltrosPlacas;
  onFiltrosChange: (novosFiltros: FiltrosPlacas) => void;
}

const VehiclesTab: React.FC<VehiclesTabProps> = ({
  filtros,
  onFiltrosChange,
}) => {
  const queryPlacasLista = usePlacas(filtros);

  return (
    <>
      {/* Barra de Pesquisa e Filtros */}
      <FiltrosPlacasComponent
        filtros={filtros}
        onFiltrosChange={onFiltrosChange}
        totalResultados={queryPlacasLista.estatisticas.totalGeral || 0}
        isLoading={queryPlacasLista.isLoading}
      />

      {/* Mensagem de Erro */}
      {queryPlacasLista.isError && (
        <ErrorMessage
          message={
            queryPlacasLista.error || "Erro ao carregar dados das placas"
          }
          onRetry={() => queryPlacasLista.refetch()}
        />
      )}

      {/* Loading inicial apenas se não houver dados carregados */}
      {queryPlacasLista.isLoading && queryPlacasLista.placas.length === 0 && (
        <Loading message="Carregando placas..." size="lg" />
      )}

      {/* Lista de Placas */}
      {(queryPlacasLista.placas.length > 0 ||
        !queryPlacasLista.isLoading) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Lista de Veículos
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
    </>
  );
};

export default VehiclesTab;