// Path: ./src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Usuários de demonstração - em produção, usar banco de dados
const users = [
  {
    id: '1',
    username: 'admin',
    name: 'Administrador',
    role: 'admin' as const,
  },
  {
    id: '2',
    username: 'user',
    name: 'Usuário',
    role: 'user' as const,
  },
];

// Simular validação de token - em produção, usar JWT real
const validateToken = (token: string) => {
  console.log('🔍 Validating token:', token?.substring(0, 20) + '...');
  
  if (!token || !token.startsWith('token_')) {
    return null;
  }

  // Extrair userId do token simulado
  const parts = token.split('_');
  if (parts.length !== 3) {
    return null;
  }

  const userId = parts[1];
  const user = users.find(u => u.id === userId);
  console.log('👤 User found:', user?.username);
  
  return user || null;
};

export async function GET(request: NextRequest) {
  console.log('🔐 Auth check endpoint called');
  
  try {
    // Obter token do header Authorization
    const authHeader = request.headers.get('authorization');
    console.log('📋 Auth header:', authHeader?.substring(0, 20) + '...');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header');
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Validar token
    const user = validateToken(token);

    if (!user) {
      console.log('❌ Invalid token');
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      );
    }

    console.log('✅ Auth check successful');
    return NextResponse.json({
      message: 'Usuário autenticado',
      user,
    });
  } catch (error) {
    console.error('💥 Auth check error:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Para debug
export async function POST() {
  return NextResponse.json({
    message: 'Use GET method for auth check',
    endpoint: '/api/auth/me'
  });
}