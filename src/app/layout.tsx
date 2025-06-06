// Path: ./src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Dashboard de Placas - Empresa One & Binsat',
  description: 'Sistema de gerenciamento de instalação de placas veiculares',
  keywords: ['dashboard', 'placas', 'veículos', 'gestão', 'instalação'],
  authors: [{ name: 'Sistema de Placas' }],
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}