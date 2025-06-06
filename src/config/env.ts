// Path: ./src/config/env.ts

/**
 * Configuração centralizada de variáveis de ambiente
 * Validação e tipagem das variáveis de ambiente
 */

// Função para validar variáveis obrigatórias
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Função para obter variável opcional com valor padrão
function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

// Configuração do ambiente
export const env = {
  // Ambiente atual
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  
  // URLs
  NEXT_PUBLIC_APP_URL: getEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  NEXT_PUBLIC_API_URL: getEnv('NEXT_PUBLIC_API_URL', '/api'),
  
  // Configurações da aplicação
  APP_NAME: getEnv('NEXT_PUBLIC_APP_NAME', 'Dashboard de Placas'),
  APP_VERSION: getEnv('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
  
  // Configurações do banco de dados (para futuro uso)
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Configurações de autenticação (para futuro uso)
  JWT_SECRET: process.env.JWT_SECRET,
  
  // Configurações de APIs externas (para futuro uso)
  EXTERNAL_API_KEY: process.env.EXTERNAL_API_KEY,
  EXTERNAL_API_URL: process.env.EXTERNAL_API_URL,
  
  // Configurações de desenvolvimento
  ENABLE_DEVTOOLS: getEnv('NEXT_PUBLIC_ENABLE_DEVTOOLS', 'true') === 'true',
  DEBUG_MODE: getEnv('NEXT_PUBLIC_DEBUG_MODE', 'false') === 'true',
  
  // Configurações de performance
  PAGINATION_LIMIT: parseInt(getEnv('NEXT_PUBLIC_PAGINATION_LIMIT', '10')),
  MAX_RETRY_ATTEMPTS: parseInt(getEnv('NEXT_PUBLIC_MAX_RETRY_ATTEMPTS', '3')),
  REQUEST_TIMEOUT: parseInt(getEnv('NEXT_PUBLIC_REQUEST_TIMEOUT', '10000')),
} as const;

// Validação das configurações críticas
export function validateEnvironment() {
  try {
    // Validar configurações obrigatórias aqui quando necessário
    // Por exemplo:
    // if (env.NODE_ENV === 'production') {
    //   requireEnv('DATABASE_URL');
    // }
    
    console.log('✅ Environment configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Environment configuration error:', error);
    return false;
  }
}

// Configurações específicas por ambiente
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Configurações de features por ambiente
export const features = {
  enableDevtools: isDevelopment && env.ENABLE_DEVTOOLS,
  enableDebugMode: env.DEBUG_MODE,
  enableAnalytics: isProduction,
  enableErrorReporting: isProduction,
} as const;

// Log das configurações em desenvolvimento
if (isDevelopment) {
  console.log('🔧 Environment configuration:', {
    NODE_ENV: env.NODE_ENV,
    APP_NAME: env.APP_NAME,
    APP_VERSION: env.APP_VERSION,
    PAGINATION_LIMIT: env.PAGINATION_LIMIT,
    features,
  });
}