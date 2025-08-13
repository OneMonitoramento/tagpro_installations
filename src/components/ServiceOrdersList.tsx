// Path: ./src/components/ServiceOrdersList.tsx
'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { FileText, Calendar, Clock, CheckCircle, AlertCircle, Car, User, Check } from 'lucide-react';
import { ServiceOrder } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

interface ServiceOrdersListProps {
  serviceOrders: ServiceOrder[];
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  onStatusUpdate?: (id: string, status: string) => void;
}

// Função para obter configuração da empresa
const getEmpresaConfig = (empresa: string) => {
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
  
  return configs[empresa as keyof typeof configs] || {
    name: empresa || 'N/A',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-600',
  };
};

// Função para obter configuração do status
const getStatusConfig = (status: string) => {
  const configs = {
    pending: {
      label: 'Pendente',
      icon: Clock,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-600',
    },
    done: {
      label: 'Concluído',
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
    },
  };
  
  return configs[status as keyof typeof configs] || {
    label: status || 'Desconhecido',
    icon: AlertCircle,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    iconColor: 'text-gray-600',
  };
};

// Função para mapear eventos SGA
const getEventLabel = (sgaEvent: string) => {
  const eventMap = {
    'new-vehicle': 'Novo veículo cadastrado',
    'reactivated_vehicle': 'Veículo reativado',
    'inactivated_vehicle': 'Veículo inativado',
  };
  
  return eventMap[sgaEvent as keyof typeof eventMap] || sgaEvent;
};

// Função para traduzir tipos de serviço
const getServiceTypeLabel = (serviceType: string) => {
  const serviceTypeMap = {
    'installation': 'Instalação',
    'uninstallation': 'Remoção',
  };
  
  return serviceTypeMap[serviceType as keyof typeof serviceTypeMap] || serviceType;
};

// Componente de diálogo de confirmação
const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  serviceOrder,
  isLoading = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serviceOrder: ServiceOrder;
  isLoading?: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Concluir Ordem de Serviço
            </h3>
          </div>
        </div>
        
        {/* Detalhes da Ordem de Serviço */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Número:</span>
              <span className="text-gray-900">
                {serviceOrder.serviceOrderNumber || `OS #${serviceOrder.id.slice(0, 8)}`}
              </span>
            </div>
            
            {serviceOrder.serviceType && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Tipo:</span>
                <span className="text-gray-900">
                  {getServiceTypeLabel(serviceOrder.serviceType)}
                </span>
              </div>
            )}
            
            {serviceOrder.vehiclePlate && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Placa:</span>
                <span className="text-gray-900 font-mono">
                  {serviceOrder.vehiclePlate}
                </span>
              </div>
            )}
            
            {serviceOrder.clientName && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Cliente:</span>
                <span className="text-gray-900">
                  {serviceOrder.clientName}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">
          Tem certeza que deseja marcar esta ordem de serviço como concluída? 
          Esta ação não pode ser desfeita.
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Concluindo...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Concluir
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to check if user can complete a service order
const canUserCompleteOrder = (userRole: string | undefined, serviceOrderCompany: string | undefined): boolean => {
  if (!userRole || !serviceOrderCompany) return false;
  
  // tagpro role cannot complete any orders
  if (userRole === 'tagpro') return false;
  
  // binsat role can only complete binsat orders
  if (userRole === 'binsat' && serviceOrderCompany === 'binsat') return true;
  
  // lwsim role can only complete lw_sim orders  
  if (userRole === 'lwsim' && serviceOrderCompany === 'lw_sim') return true;
  
  // admin can complete any order
  if (userRole === 'admin') return true;
  
  return false;
};

// Componente para cada card de ordem de serviço
const ServiceOrderCard = ({ 
  serviceOrder,
  onStatusUpdate
}: { 
  serviceOrder: ServiceOrder;
  onStatusUpdate?: (id: string, status: string) => void;
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  
  const empresaConfig = serviceOrder.company ? getEmpresaConfig(serviceOrder.company) : null;
  const statusConfig = getStatusConfig(serviceOrder.status);
  const StatusIcon = statusConfig.icon;

  const handleCompleteOrder = async () => {
    setIsUpdating(true);
    try {
      // Call API to update status
      const response = await fetch(`/api/service-orders/${serviceOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'done' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar status da ordem de serviço');
      }

      // Success
      const serviceOrderNumber = serviceOrder.serviceOrderNumber || `OS #${serviceOrder.id.slice(0, 8)}`;
      showSuccess(
        'Ordem de serviço concluída!',
        `${serviceOrderNumber} foi marcada como concluída com sucesso.`
      );

      // Call callback to update the list
      onStatusUpdate?.(serviceOrder.id, 'done');
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Erro ao concluir ordem de serviço:', error);
      showError(
        'Erro ao concluir ordem de serviço',
        error instanceof Error ? error.message : 'Tente novamente.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          <span className="font-semibold text-gray-900">
            {serviceOrder.serviceOrderNumber || `OS #${serviceOrder.id.slice(0, 8)}`}
          </span>
          {serviceOrder.company && empresaConfig && (
            <span className={`text-xs px-2 py-1 rounded-full ${empresaConfig.bgColor} ${empresaConfig.textColor}`}>
              {empresaConfig.name}
            </span>
          )}
          {serviceOrder.serviceType && (
            <span className="px-2 py-1 bg-indigo-600 text-white font-medium rounded-full text-xs">
              {getServiceTypeLabel(serviceOrder.serviceType)}
            </span>
          )}
        </div>
        
        {/* Badge de Status e Botão de Concluir */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
            <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
            {statusConfig.label}
          </div>
          
          {/* Botão Concluir para ordens pendentes - apenas para usuários com permissão */}
          {serviceOrder.status === 'pending' && canUserCompleteOrder(user?.role, serviceOrder.company) && (
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={isUpdating}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Marcar como concluído"
            >
              <Check className="h-3 w-3" />
              Concluir
            </button>
          )}
        </div>
      </div>
      
      {/* Informações do Veículo */}
      {(serviceOrder.vehiclePlate || serviceOrder.vehicleManufacturer || serviceOrder.vehicleModel || serviceOrder.sgaVehicleId) && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900">Veículo</span>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            {serviceOrder.vehiclePlate && (
              <div><span className="font-medium">Placa:</span> {serviceOrder.vehiclePlate}</div>
            )}
            {serviceOrder.vehicleManufacturer && (
              <div><span className="font-medium">Fabricante:</span> {serviceOrder.vehicleManufacturer}</div>
            )}
            {serviceOrder.vehicleModel && (
              <div><span className="font-medium">Modelo:</span> {serviceOrder.vehicleModel}</div>
            )}
            {serviceOrder.vehicleModelYear && (
              <div><span className="font-medium">Ano:</span> {serviceOrder.vehicleModelYear}</div>
            )}
            {serviceOrder.sgaVehicleId && (
              <div><span className="font-medium">ID SGA:</span> <span className="font-mono">{serviceOrder.sgaVehicleId}</span></div>
            )}
          </div>
        </div>
      )}
      
      {/* Informações do Cliente */}
      {(serviceOrder.clientName || serviceOrder.clientCpf || serviceOrder.sgaClientId) && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">Cliente</span>
          </div>
          <div className="text-sm text-blue-800 space-y-1">
            {serviceOrder.clientName && (
              <div><span className="font-medium">Nome:</span> {serviceOrder.clientName}</div>
            )}
            {serviceOrder.clientCpf && (
              <div><span className="font-medium">CPF:</span> {serviceOrder.clientCpf}</div>
            )}
            {serviceOrder.sgaClientId && (
              <div><span className="font-medium">ID SGA:</span> <span className="font-mono">{serviceOrder.sgaClientId}</span></div>
            )}
          </div>
        </div>
      )}
      
      {/* Informações da OS */}
      <div className="text-sm text-gray-600 space-y-2">
        {serviceOrder.description && (
          <p className="text-gray-900 font-medium">{serviceOrder.description}</p>
        )}
        
        {serviceOrder.sgaEvent && (
          <div className="bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
            <p className="font-medium text-yellow-800">Evento: {getEventLabel(serviceOrder.sgaEvent)}</p>
            {serviceOrder.sgaEventDate && (
              <p className="text-yellow-700 text-xs mt-1">
                Data: {new Date(serviceOrder.sgaEventDate).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        )}
        
        {serviceOrder.scheduledDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Agendado: {new Date(serviceOrder.scheduledDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        
        {serviceOrder.completedDate && (
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Concluído: {new Date(serviceOrder.completedDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>
      
      {/* Dados de identificação */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
        {serviceOrder.lightServiceOrderId && (
          <p>Light OS: <span className="font-mono">{serviceOrder.lightServiceOrderId}</span></p>
        )}
        <p>Data sincronização: {new Date(serviceOrder.createdAt).toLocaleString('pt-BR')}</p>
      </div>
      
      {/* Diálogo de Confirmação */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleCompleteOrder}
        serviceOrder={serviceOrder}
        isLoading={isUpdating}
      />
    </div>
  );
};

const ServiceOrdersList: React.FC<ServiceOrdersListProps> = ({
  serviceOrders,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onStatusUpdate,
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

  if (serviceOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg">Nenhuma ordem de serviço encontrada</p>
        <p className="text-gray-500 text-sm mt-2">
          Tente ajustar os filtros de pesquisa para encontrar as ordens de serviço desejadas
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Lista de ordens de serviço */}
      <div className="space-y-4">
        {serviceOrders.map((serviceOrder, index) => (
          <div
            key={serviceOrder.id}
            ref={index === serviceOrders.length - 1 ? lastElementRefCallback : null}
          >
            <ServiceOrderCard serviceOrder={serviceOrder} onStatusUpdate={onStatusUpdate} />
          </div>
        ))}
      </div>

      {/* Indicador de loading para infinite scroll */}
      {isFetchingNextPage && (
        <div className="mt-6 flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Carregando mais ordens de serviço...</span>
          </div>
        </div>
      )}

      {/* Indicador de fim da lista */}
      {!hasNextPage && serviceOrders.length > 0 && (
        <div className="mt-6 text-center py-4 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Todas as ordens de serviço foram carregadas ({serviceOrders.length} total)
          </p>
        </div>
      )}
    </>
  );
};

export default ServiceOrdersList;