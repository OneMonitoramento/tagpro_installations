// Path: ./src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/users";
import { generateToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validar campos obrigatórios
    if (!username || !password) {
      console.log("❌ Missing fields");
      return NextResponse.json(
        { message: "Usuário e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Simular delay da autenticação
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Autenticar usuário
    const user = await authenticateUser(username, password);

    if (!user) {
      console.log("❌ Invalid credentials");
      return NextResponse.json(
        { message: "Usuário ou senha inválidos" },
        { status: 401 }
      );
    }

    // Gerar token JWT
    const token = generateToken(user);

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Login realizado com sucesso",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("💥 Login error:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Para debug, permitir GET também
export async function GET() {
  return NextResponse.json({
    message: "Login endpoint is working",
    method: "POST required",
    demo_users: [
      {
        username: "admin",
        password: "admin123",
        role: "admin",
        description: "Acesso total",
      },
      {
        username: "user",
        password: "user123",
        role: "user",
        description: "Usuário padrão (apenas visualização)",
      },
      {
        username: "lwsim",
        password: "lwsim123",
        role: "lwsim",
        description: "Edita status de ambas as empresas",
      },
      {
        username: "tagpro",
        password: "tagpro123",
        role: "tagpro",
        description: "Vê ambos, edita só Binsat",
      },
      {
        username: "binsat",
        password: "binsat123",
        role: "binsat",
        description: "Vê status só da Binsat",
      },
    ],
  });
}
