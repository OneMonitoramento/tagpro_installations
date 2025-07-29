// Path: ./src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt';
import { findUserById } from '@/lib/auth/users';

export async function GET(request: NextRequest) {
  console.log('🔐 Auth check endpoint called');
  
  try {
    // Obter token do header Authorization
    const authHeader = request.headers.get('authorization');
    console.log('📋 Auth header:', authHeader?.substring(0, 20) + '...');
    
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      console.log('❌ No valid auth header');
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    // Validar token JWT
    const payload = verifyToken(token);

    if (!payload) {
      console.log('❌ Invalid token');
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Buscar dados completos do usuário
    const user = findUserById(payload.userId);

    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json(
        { message: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;

    console.log('✅ Auth check successful');
    return NextResponse.json({
      message: 'Usuário autenticado',
      user: userWithoutPassword,
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