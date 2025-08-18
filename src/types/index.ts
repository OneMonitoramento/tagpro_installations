// Path: ./src/types/index.ts

// Tipos básicos
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Placa {
  id: string;
  numeroPlaca: string;
  modelo: string;
  empresa: 'lw_sim' | 'binsat';
  status: 'pending' | 'installed' | 'inactive';
  instalado: boolean; // deprecated, mantido para compatibilidade
  dataInstalacao?: string;
  dataUltimaAtualizacao: string;
  vin?: string;
  renavam?: string;
}

export interface Estatisticas {
  total: number;
  instaladas: number;
  pendentes: number;
  inativas: number;
  totalGeral?: number;
}

export interface SyncOperation {
  date: string;
  status: string;
  details: {
    operation: string;
    failureCount: number;
    successCount: number;
  };
  totalProcessed: number;
  vehiclesSynchronized?: number;
  clientsSynchronized?: number;
}

export interface SyncState {
  newVehicles: {
    currentSync: SyncOperation;
    lastSuccessfulSync: SyncOperation;
  };
  updatedClients: {
    currentSync: SyncOperation;
    lastSuccessfulSync: SyncOperation;
  };
  updatedVehicles: {
    currentSync: SyncOperation;
    lastSuccessfulSync: SyncOperation;
  };
}

export interface DashboardStats {
  totalization: {
    totalVehicles: number;
    totalClients: number;
    totalInstalled: number;
    totalPending: number;
    totalInactive: number;
  };
  companies: {
    lw_sim: {
      total: number;
      installed: number;
      pending: number;
      inactive: number;
    };
    binsat: {
      total: number;
      installed: number;
      pending: number;
      inactive: number;
    };
  };
  syncInfo: {
    lastSyncDate: string;
    newVehicles: number;
    updatedVehicles: number;
    updatedClients: number;
  };
  situationStats: {
    ativo: number;
    inativo: number;
    inativoP: number;
    inadimplente: number;
    ativoBoasVindas: number;
    inadimplenteBoasVindas: number;
  };
}

// Tipos para filtros
export interface FiltrosPlacas {
  empresa?: 'lw_sim' | 'binsat' | 'todos';
  status?: 'installed' | 'pending' | 'inactive' | 'todos';
  pesquisa?: string;
}

// Tipos para API responses
export interface PlacasResponse {
  data: Placa[];
  nextCursor?: string;
  hasNextPage: boolean;
  totalCount: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Tipos para mutations
export interface UpdateStatusParams {
  id: string;
  instalado: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Tipos para Ordens de Serviço
export interface ServiceOrder {
  id: string;
  sgaVehicleId?: string;
  sgaClientId?: string;
  lightServiceOrderId?: string;
  lightVehicleId?: string;
  company?: string;
  serviceOrderNumber?: string;
  description?: string;
  serviceType?: string;
  priority?: string;
  status: string;
  scheduledDate?: string;
  completedDate?: string;
  sgaEvent?: string;
  sgaEventDate?: string;
  createdAt: string;
  updatedAt: string;
  // Vehicle data
  vehiclePlate?: string;
  vehicleManufacturer?: string;
  vehicleModel?: string;
  vehicleModelYear?: string;
  // Client data
  clientName?: string;
  clientCpf?: string;
}

// Tipos para filtros de ordens de serviço
export interface FiltrosServiceOrders {
  empresa?: 'lw_sim' | 'binsat' | 'todos';
  status?: string;
  pesquisa?: string;
  tipoInstalacao?: 'installation' | 'uninstallation' | 'todos';
}

// Tipos para API responses de ordens de serviço
export interface ServiceOrdersResponse {
  data: ServiceOrder[];
  nextCursor?: string;
  hasNextPage: boolean;
  totalCount: number;
}