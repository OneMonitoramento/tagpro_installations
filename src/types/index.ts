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
  empresa: 'lwsim' | 'binsat';
  instalado: boolean;
  dataInstalacao?: string;
  dataUltimaAtualizacao: string;
}

export interface Estatisticas {
  total: number;
  instaladas: number;
  pendentes: number;
  totalGeral?: number;
}

// Tipos para filtros
export interface FiltrosPlacas {
  empresa?: 'lwsim' | 'binsat' | 'todos';
  status?: 'instalado' | 'pendente' | 'todos';
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