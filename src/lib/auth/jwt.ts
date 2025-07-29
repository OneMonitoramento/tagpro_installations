import jwt from 'jsonwebtoken';
import { AuthUser } from './users';

// Chave secreta simples (em produção, usar variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '8h'; // Token expira em 8 horas

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Gerar token JWT
export const generateToken = (user: AuthUser): string => {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'tagpro-dashboard'
  });
};

// Verificar e decodificar token JWT
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token inválido:', error);
    return null;
  }
};

// Extrair token do header Authorization
export const extractTokenFromHeader = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer "
};