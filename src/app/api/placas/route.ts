// Path: ./src/app/api/placas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Placa } from '@/types';

// Dados simulados expandidos - substitua por conexão com banco de dados
const generatePlacasSimuladas = (): Omit<Placa, 'empresa'>[] => {
  const modelos = [
    'Honda Civic', 'Toyota Corolla', 'Volkswagen Gol', 'Chevrolet Onix', 'Ford Ka',
    'Hyundai HB20', 'Nissan March', 'Renault Kwid', 'Fiat Argo', 'Peugeot 208',
    'Honda HR-V', 'Toyota Yaris', 'VW Polo', 'Chevrolet Tracker', 'Ford EcoSport',
    'Hyundai Creta', 'Nissan Kicks', 'Renault Captur', 'Fiat Toro', 'Peugeot 2008',
    'Honda City', 'Toyota Etios', 'VW T-Cross', 'Chevrolet Prisma', 'Ford Fiesta',
    'Hyundai i30', 'Nissan Versa', 'Renault Sandero', 'Fiat Cronos', 'Peugeot 3008'
  ];

  const placas = [];
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let i = 0; i < 100; i++) {
    const letra1 = letras[Math.floor(Math.random() * letras.length)];
    const letra2 = letras[Math.floor(Math.random() * letras.length)];
    const letra3 = letras[Math.floor(Math.random() * letras.length)];
    const numero = String(1000 + i).padStart(4, '0');
    
    const instalado = Math.random() > 0.4; // 60% chance de estar instalado
    const dataInstalacao = instalado 
      ? new Date(2025, 4, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0]
      : undefined;

    placas.push({
      id: String(i + 1),
      numeroPlaca: `${letra1}${letra2}${letra3}-${numero}`,
      instalado,
      dataInstalacao,
      modelo: modelos[Math.floor(Math.random() * modelos.length)]
    });
  }

  return placas;
};

const allPlacas = generatePlacasSimuladas().map((placa, index) => ({
  ...placa,
  empresa: (index % 2 === 0 ? 'One' : 'Binsat') as 'One' | 'Binsat'
}));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '10');
    const empresa = searchParams.get('empresa') as 'One' | 'Binsat' | null;

    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Filtrar por empresa se especificado
    const filteredPlacas = empresa 
      ? allPlacas.filter(placa => placa.empresa === empresa)
      : allPlacas;

    // Paginação
    const startIndex = cursor ? parseInt(cursor) : 0;
    const endIndex = startIndex + limit;
    const paginatedPlacas = filteredPlacas.slice(startIndex, endIndex);
    
    const hasNextPage = endIndex < filteredPlacas.length;
    const nextCursor = hasNextPage ? String(endIndex) : undefined;

    return NextResponse.json({
      data: paginatedPlacas,
      nextCursor,
      hasNextPage,
      totalCount: filteredPlacas.length,
      success: true,
      message: 'Placas carregadas com sucesso'
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: [],
        nextCursor: undefined,
        hasNextPage: false,
        totalCount: 0,
        success: false,
        message: 'Erro ao carregar placas'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, instalado } = await request.json();

    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Aqui você atualizaria no banco de dados
    // const updatedPlaca = await database.update(id, { instalado });

    // Atualizar na lista local para simulação
    const placaIndex = allPlacas.findIndex(p => p.id === id);
    if (placaIndex !== -1) {
      allPlacas[placaIndex] = {
        ...allPlacas[placaIndex],
        instalado,
        dataInstalacao: instalado ? new Date().toISOString().split('T')[0] : undefined
      };
    }

    return NextResponse.json({
      data: { id, instalado, dataInstalacao: instalado ? new Date().toISOString().split('T')[0] : undefined },
      message: 'Status atualizado com sucesso',
      success: true
    });
  } catch (error) {
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