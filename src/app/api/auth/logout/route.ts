// Path: ./src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Em produção, aqui você pode:
    // - Invalidar o token no banco de dados
    // - Adicionar token em blacklist
    // - Log da ação de logout

    return NextResponse.json({
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}