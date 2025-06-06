// Path: ./src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log requests em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 ${request.method} ${pathname}`);
  }

  // Permitir todas as rotas de API passarem sem verificação de auth
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // CORS headers para API routes
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login'];
  
  // Se é uma rota pública, permitir acesso
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Para rotas de páginas (não API), verificar autenticação apenas no cliente
  // O middleware não deve bloquear rotas de página, deixamos isso para o ProtectedRoute
  const response = NextResponse.next();

  // Cache headers para assets estáticos
  if (pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};