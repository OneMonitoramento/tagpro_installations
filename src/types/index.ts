// Path: ./src/types/index.ts
export interface Placa {
  id: string;
  numeroPlaca: string;
  instalado: boolean;
  empresa: 'One' | 'Binsat';
  dataInstalacao?: string;
  modelo?: string;
}

export interface Estatisticas {
  total: number;
  instaladas: number;
  pendentes: number;
  totalGeral?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasNextPage: boolean;
  totalCount: number;
  success: boolean;
  message?: string;
}

// Tipos de autenticação
export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}