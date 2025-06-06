// Path: ./src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Usuários de demonstração - em produção, usar banco de dados
const users = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin' as const,
  },
  {
    id: '2',
    username: 'user',
    password: 'user123',
    name: 'Usuário',
    role: 'user' as const,
  },
  {
    id: '3',
    username: 'lwsim',
    password: 'lwsim123',
    name: 'LW SIM',
    role: 'lwsim' as const,
  },
  {
    id: '4',
    username: 'tagpro',
    password: 'tagpro123',
    name: 'TagPro',
    role: 'tagpro' as const,
  },
  {
    id: '5',
    username: 'binsat',
    password: 'binsat123',
    name: 'Binsat',
    role: 'binsat' as const,
  },
];

// Simular JWT token - em produção, usar biblioteca JWT real
const generateToken = (userId: string) => {
  return `token_${userId}_${Date.now()}`;
};

export async function POST(request: NextRequest) {
  console.log('🔐 Login endpoint called');
  
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('📝 Login attempt:', { username });

    // Validar campos obrigatórios
    if (!username || !password) {
      console.log('❌ Missing fields');
      return NextResponse.json(
        { message: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Simular delay da autenticação
    await new Promise(resolve => setTimeout(resolve, 800));

    // Buscar usuário
    const user = users.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      console.log('❌ Invalid credentials');
      return NextResponse.json(
        { message: 'Usuário ou senha inválidos' },
        { status: 401 }
      );
    }

    // Gerar token
    const token = generateToken(user.id);

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;

    console.log('✅ Login successful:', userWithoutPassword);

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Para debug, permitir GET também
export async function GET() {
  return NextResponse.json({
    message: 'Login endpoint is working',
    method: 'POST required',
    demo_users: [
      { username: 'admin', password: 'admin123', role: 'admin', description: 'Acesso total' },
      { username: 'user', password: 'user123', role: 'user', description: 'Usuário padrão (apenas visualização)' },
      { username: 'lwsim', password: 'lwsim123', role: 'lwsim', description: 'Edita status de ambas as empresas' },
      { username: 'tagpro', password: 'tagpro123', role: 'tagpro', description: 'Vê ambos, edita só Binsat' },
      { username: 'binsat', password: 'binsat123', role: 'binsat', description: 'Vê status só da Binsat' }
    ]
  });
}