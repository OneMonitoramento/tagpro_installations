// Path: ./src/constants/index.ts

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_LIMIT: 20, // Aumentado para melhor UX
  MAX_LIMIT: 50,
  MIN_LIMIT: 5,
} as const;

// Configurações do React Query
export const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutos
  CACHE_TIME: 10 * 60 * 1000, // 10 minutos
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000, // 1 segundo
} as const;

// Chaves das queries
export const QUERY_KEYS = {
  PLACAS: 'placas',
  PLACAS_FILTERED: (filtros: any) => ['placas', filtros],
  PLACA_DETAIL: (id: string) => ['placas', 'detail', id],
} as const;

// Configurações das empresas
export const EMPRESAS = {
  LWSIM: {
    name: 'LW SIM',
    value: 'lwsim',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-500',
    iconColor: 'text-blue-600',
    dotColor: 'bg-blue-600',
  },
  BINSAT: {
    name: 'Binsat',
    value: 'binsat',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-500',
    iconColor: 'text-purple-600',
    dotColor: 'bg-purple-600',
  },
} as const;

// Status das placas
export const PLACA_STATUS = {
  INSTALADO: {
    label: 'Instalado',
    value: 'instalado',
    boolean: true,
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    hoverColor: 'hover:bg-green-200',
    iconColor: 'text-green-600',
  },
  PENDENTE: {
    label: 'Pendente',
    value: 'pendente',
    boolean: false,
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    hoverColor: 'hover:bg-red-200',
    iconColor: 'text-red-600',
  },
} as const;

// Opções de filtro
export const FILTRO_OPCOES = {
  EMPRESA: [
    { value: 'todos', label: 'Todas as empresas' },
    { value: 'lwsim', label: 'LW SIM' },
    { value: 'binsat', label: 'Binsat' },
  ],
  STATUS: [
    { value: 'todos', label: 'Todos os status' },
    { value: 'instalado', label: 'Instalado' },
    { value: 'pendente', label: 'Pendente' },
  ],
} as const;

// Configurações da API
export const API = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',
  TIMEOUT: 10000, // 10 segundos
  ENDPOINTS: {
    PLACAS: '/api/placas',
    PLACA_DETAIL: (id: string) => `/api/placas/${id}`,
  },
} as const;

// Modelos de veículos (para geração de dados simulados)
export const MODELOS_VEICULOS = [
  'Honda Civic', 'Toyota Corolla', 'Volkswagen Gol', 'Chevrolet Onix', 'Ford Ka',
  'Hyundai HB20', 'Nissan March', 'Renault Kwid', 'Fiat Argo', 'Peugeot 208',
  'Honda HR-V', 'Toyota Yaris', 'VW Polo', 'Chevrolet Tracker', 'Ford EcoSport',
  'Hyundai Creta', 'Nissan Kicks', 'Renault Captur', 'Fiat Toro', 'Peugeot 2008',
  'Honda City', 'Toyota Etios', 'VW T-Cross', 'Chevrolet Prisma', 'Ford Fiesta',
  'Hyundai i30', 'Nissan Versa', 'Renault Sandero', 'Fiat Cronos', 'Peugeot 3008'
] as const;

// Configurações de animação
export const ANIMATIONS = {
  LOADING_SPIN_DURATION: '1s',
  TRANSITION_DURATION: '300ms',
  PROGRESS_BAR_DURATION: '500ms',
} as const;

// Configurações de scroll
export const SCROLL_CONFIG = {
  THRESHOLD: 0.1, // 10% visibility para trigger
  ROOT_MARGIN: '100px', // Carregar 100px antes de chegar ao fim
} as const;

// Configurações de debounce
export const DEBOUNCE = {
  SEARCH: 300, // 300ms para busca
  STATUS_UPDATE: 500, // 500ms para updates de status
  FILTER_CHANGE: 200, // 200ms para mudanças de filtro
} as const;

// Configurações de toast/notificações (para futuro uso)
export const TOAST_CONFIG = {
  DURATION: 3000, // 3 segundos
  POSITION: 'top-right',
} as const;

// Breakpoints responsivos (matching Tailwind)
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

// Mensagens padrão
export const MESSAGES = {
  LOADING: {
    PLACAS: 'Carregando placas...',
    UPDATING: 'Atualizando...',
    SEARCHING: 'Pesquisando...',
  },
  ERROR: {
    LOAD_PLACAS: 'Erro ao carregar placas',
    UPDATE_STATUS: 'Erro ao atualizar status',
    NETWORK: 'Erro de conexão',
    GENERIC: 'Algo deu errado',
  },
  SUCCESS: {
    STATUS_UPDATED: 'Status atualizado com sucesso',
    DATA_REFRESHED: 'Dados atualizados',
  },
  EMPTY: {
    NO_PLACAS: 'Nenhuma placa encontrada',
    NO_RESULTS: 'Nenhum resultado encontrado para os filtros aplicados',
  },
} as const;