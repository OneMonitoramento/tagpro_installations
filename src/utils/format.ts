// Path: ./src/utils/format.ts

/**
 * Utilitários de formatação para o dashboard
 */

// Formatação de data e hora
export const formatDate = {
  // Formato brasileiro: dd/mm/aaaa
  toBrazilian: (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
  },

  // Formato brasileiro com hora: dd/mm/aaaa hh:mm
  toBrazilianWithTime: (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('pt-BR');
  },

  // Formato relativo: "há 2 horas", "ontem", etc.
  toRelative: (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'ontem';
    if (diffDays < 30) return `há ${diffDays} dias`;
    
    return formatDate.toBrazilian(d);
  },

  // Formato ISO para APIs: yyyy-mm-dd
  toISO: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  // Validar se é uma data válida
  isValid: (date: string | Date): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d instanceof Date && !isNaN(d.getTime());
  },
};

// Formatação de números
export const formatNumber = {
  // Formato brasileiro: 1.234,56
  toBrazilian: (num: number): string => {
    return num.toLocaleString('pt-BR');
  },

  // Porcentagem: 75%
  toPercentage: (value: number, total: number, decimals = 0): string => {
    if (total === 0) return '0%';
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimals)}%`;
  },

  // Porcentagem simples: 75%
  asPercentage: (percentage: number, decimals = 0): string => {
    return `${percentage.toFixed(decimals)}%`;
  },

  // Formato compacto: 1.2k, 1.5M
  toCompact: (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
    return `${(num / 1000000).toFixed(1)}M`;
  },
};

// Formatação de texto
export const formatText = {
  // Capitalizar primeira letra
  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  // Truncar texto com ellipsis
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },

  // Limpar e formatar placa (XXX-0000)
  formatPlaca: (placa: string): string => {
    const cleaned = placa.replace(/[^A-Za-z0-9]/g, '');
    if (cleaned.length !== 7) return placa;
    
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`.toUpperCase();
  },

  // Validar formato de placa brasileira
  isValidPlaca: (placa: string): boolean => {
    const placaRegex = /^[A-Za-z]{3}-?\d{4}$/;
    return placaRegex.test(placa.replace(/\s/g, ''));
  },

  // Pluralizar palavras em português
  pluralize: (count: number, singular: string, plural?: string): string => {
    if (count === 1) return `${count} ${singular}`;
    return `${count} ${plural || singular + 's'}`;
  },
};

// Formatação de status
export const formatStatus = {
  // Traduzir status booleano para português
  toPortuguese: (instalado: boolean): string => {
    return instalado ? 'Instalado' : 'Pendente';
  },

  // Obter classe CSS baseada no status
  getStatusClass: (instalado: boolean): string => {
    return instalado 
      ? 'bg-green-100 text-green-700 hover:bg-green-200'
      : 'bg-red-100 text-red-700 hover:bg-red-200';
  },

  // Obter cor do ícone baseada no status
  getIconClass: (instalado: boolean): string => {
    return instalado ? 'text-green-600' : 'text-red-600';
  },
};

// Formatação de empresa
export const formatEmpresa = {
  // Obter configuração de cores da empresa
  getConfig: (empresa: 'One' | 'Binsat') => {
    const configs = {
      One: {
        name: 'Empresa One',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-500',
        dotColor: 'bg-blue-600',
      },
      Binsat: {
        name: 'Empresa Binsat',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-500',
        dotColor: 'bg-purple-600',
      },
    };
    
    return configs[empresa];
  },
};

// Utilitários para URLs e queries
export const formatUrl = {
  // Construir query string
  buildQuery: (params: Record<string, string | number | boolean | undefined>): string => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    return searchParams.toString();
  },

  // Extrair parâmetros da URL
  parseQuery: (search: string): Record<string, string> => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    
    params.forEach((value, key) => {
      result[key] = value;
    });
    
    return result;
  },
};

// Validações comuns
export const validate = {
  // Validar email
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar se string não está vazia
  notEmpty: (value: string): boolean => {
    return value.trim().length > 0;
  },

  // Validar se número está dentro de um range
  inRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },
};

// Debug helpers
export const debug = {
  // Log formatado para desenvolvimento
  log: (label: string, data: any): void => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 ${label}:`, data);
    }
  },

  // Log de performance
  time: (label: string): void => {
    if (process.env.NODE_ENV === 'development') {
      console.time(`⏱️ ${label}`);
    }
  },

  timeEnd: (label: string): void => {
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd(`⏱️ ${label}`);
    }
  },
};