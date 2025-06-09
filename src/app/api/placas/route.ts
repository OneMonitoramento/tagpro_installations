// Path: ./src/app/api/placas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Placa } from '@/types';

// Dados simulados expandidos - substitua por conexão com banco de dados
const generatePlacasSimuladas = (): Placa[] => {
  const modelos = [
    'Honda Civic', 'Toyota Corolla', 'Volkswagen Gol', 'Chevrolet Onix', 'Ford Ka',
    'Hyundai HB20', 'Nissan March', 'Renault Kwid', 'Fiat Argo', 'Peugeot 208',
    'Honda HR-V', 'Toyota Yaris', 'VW Polo', 'Chevrolet Tracker', 'Ford EcoSport',
    'Hyundai Creta', 'Nissan Kicks', 'Renault Captur', 'Fiat Toro', 'Peugeot 2008',
    'Honda City', 'Toyota Etios', 'VW T-Cross', 'Chevrolet Prisma', 'Ford Fiesta',
    'Hyundai i30', 'Nissan Versa', 'Renault Sandero', 'Fiat Cronos', 'Peugeot 3008'
  ];

  const placas = [];
  
  // Gerar placas para LW SIM (156 placas)
  for (let i = 0; i < 156; i++) {
    const instalado = Math.random() > 0.3; // 70% chance de estar instalado
    const dataInstalacao = instalado 
      ? new Date(2025, 4, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0]
      : undefined;

    placas.push({
      id: `lwsim_${i + 1}`,
      numeroPlaca: `LWS${String(i + 1).padStart(4, '0')}`,
      instalado,
      dataInstalacao,
      modelo: modelos[Math.floor(Math.random() * modelos.length)],
      empresa: 'lwsim' as const,
      dataUltimaAtualizacao: new Date().toISOString(),
    });
  }

  // Gerar placas para Binsat (89 placas)
  for (let i = 0; i < 89; i++) {
    const instalado = Math.random() > 0.3; // 70% chance de estar instalado
    const dataInstalacao = instalado 
      ? new Date(2025, 4, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0]
      : undefined;

    placas.push({
      id: `binsat_${i + 1}`,
      numeroPlaca: `BIN${String(i + 1).padStart(4, '0')}`,
      instalado,
      dataInstalacao,
      modelo: modelos[Math.floor(Math.random() * modelos.length)],
      empresa: 'binsat' as const,
      dataUltimaAtualizacao: new Date().toISOString(),
    });
  }

  return placas;
};

// Cache das placas geradas
let allPlacas: Placa[] | null = null;

const getAllPlacas = (): Placa[] => {
  if (!allPlacas) {
    allPlacas = generatePlacasSimuladas();
  }
  return allPlacas;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');
    const empresa = searchParams.get('empresa') as 'lwsim' | 'binsat' | 'todos' | null;
    const status = searchParams.get('status') as 'instalado' | 'pendente' | 'todos' | null;
    const pesquisa = searchParams.get('pesquisa') || '';

    console.log('🔍 Filtros recebidos:', { empresa, status, pesquisa });

    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Obter todas as placas
    let placasFiltradas = getAllPlacas();

    // Aplicar filtro de empresa
    if (empresa && empresa !== 'todos') {
      placasFiltradas = placasFiltradas.filter(placa => placa.empresa === empresa);
    }

    // Aplicar filtro de status
    if (status && status !== 'todos') {
      const statusBoolean = status === 'instalado';
      placasFiltradas = placasFiltradas.filter(placa => placa.instalado === statusBoolean);
    }

    // Aplicar filtro de pesquisa
    if (pesquisa && pesquisa.trim() !== '') {
      const termoPesquisa = pesquisa.toLowerCase();
      placasFiltradas = placasFiltradas.filter(placa => 
        placa.numeroPlaca.toLowerCase().includes(termoPesquisa) ||
        placa.modelo.toLowerCase().includes(termoPesquisa)
      );
    }

    console.log('📊 Resultados:', {
      total: getAllPlacas().length,
      filtradas: placasFiltradas.length,
      filtros: { empresa, status, pesquisa }
    });

    // Paginação
    const startIndex = cursor ? parseInt(cursor) : 0;
    const endIndex = startIndex + limit;
    const paginatedPlacas = placasFiltradas.slice(startIndex, endIndex);
    
    const hasNextPage = endIndex < placasFiltradas.length;
    const nextCursor = hasNextPage ? String(endIndex) : undefined;

    return NextResponse.json({
      data: paginatedPlacas,
      nextCursor,
      hasNextPage,
      totalCount: placasFiltradas.length,
      success: true,
      message: 'Placas carregadas com sucesso',
      filtros: { empresa, status, pesquisa }
    });
  } catch (error) {
    console.error('💥 Erro na API de placas:', error);
    return NextResponse.json(
      {
        data: [],
        nextCursor: undefined,
        hasNextPage: false,
        totalCount: 0,
        success: false,
        message: 'Erro ao carregar placas',
        filtros: null
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, instalado } = await request.json();

    console.log('🔄 Atualizando status:', { id, instalado });

    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Atualizar na lista local para simulação
    const placas = getAllPlacas();
    const placaIndex = placas.findIndex(p => p.id === id);
    
    if (placaIndex !== -1) {
      placas[placaIndex] = {
        ...placas[placaIndex],
        instalado,
        dataInstalacao: instalado ? new Date().toISOString().split('T')[0] : undefined,
        dataUltimaAtualizacao: new Date().toISOString(),
      };

      console.log('✅ Status atualizado:', placas[placaIndex]);

      return NextResponse.json({
        data: placas[placaIndex],
        message: 'Status atualizado com sucesso',
        success: true
      });
    } else {
      return NextResponse.json(
        {
          data: null,
          message: 'Placa não encontrada',
          success: false
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('💥 Erro ao atualizar status:', error);
    return NextResponse.json(
      {
        data: null,
        message: 'Erro ao atualizar status',
        success: false
      },
      { status: 500 }
    );
  }
}