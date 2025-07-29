// Path: ./src/app/api/placas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Placa } from '@/types';
import { db } from '@/lib/db';
import { sgaHinovaVehicle } from '@/lib/db/sgaHinovaVehicle';
import { and, eq, like, or, count, desc, lt } from 'drizzle-orm';

// Função para mapear dados do banco para o formato Placa
const mapVehicleToPlaca = (vehicle: any): Placa => {
  // Mapear status do banco para o formato esperado
  let status: 'pending' | 'installed' | 'inactive' = 'pending';
  if (vehicle.status === 'installed') {
    status = 'installed';
  } else if (vehicle.status === 'pending') {
    status = 'pending';
  } else if (vehicle.status === 'inactive') {
    status = 'inactive';
  }

  return {
    id: vehicle.id.toString(),
    numeroPlaca: vehicle.plate,
    modelo: vehicle.model || 'Modelo não informado',
    empresa: vehicle.company === 'lw_sim' ? 'lwsim' : 'binsat',
    status,
    instalado: status === 'installed', // mantido para compatibilidade
    dataInstalacao: status === 'installed' ? vehicle.updatedAt?.toISOString().split('T')[0] : undefined,
    dataUltimaAtualizacao: vehicle.updatedAt?.toISOString() || new Date().toISOString(),
    vin: vehicle.vin || undefined,
    renavam: vehicle.renavam || undefined,
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    const empresa = searchParams.get('empresa') as 'lwsim' | 'binsat' | 'todos' | null;
    const status = searchParams.get('status') as 'installed' | 'pending' | 'inactive' | 'todos' | null;
    const pesquisa = searchParams.get('pesquisa') || '';
    


    // Construir condições de filtro
    const conditions = [];

    // Filtro de empresa
    if (empresa && empresa !== 'todos') {
      const companyValue = empresa === 'lwsim' ? 'lw_sim' : 'binsat';
      conditions.push(eq(sgaHinovaVehicle.company, companyValue));
    }

    // Filtro de status
    if (status && status !== 'todos') {
      let statusValue = 'pending';
      if (status === 'installed') {
        statusValue = 'installed';
      } else if (status === 'pending') {
        statusValue = 'pending';
      } else if (status === 'inactive') {
        statusValue = 'inactive';
      }
      conditions.push(eq(sgaHinovaVehicle.status, statusValue));
    }

    // Filtro de pesquisa
    if (pesquisa && pesquisa.trim() !== '') {
      const termoPesquisa = `%${pesquisa.toLowerCase()}%`;
      conditions.push(
        or(
          like(sgaHinovaVehicle.plate, termoPesquisa),
          like(sgaHinovaVehicle.model, termoPesquisa),
          like(sgaHinovaVehicle.vin, termoPesquisa),
          like(sgaHinovaVehicle.renavam, termoPesquisa)
        )
      );
    }

    // Query principal para buscar veículos
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    console.log('🚀 ~ GET ~ whereClause:', whereClause)
    
    // Calcular offset
    const offset = page * limit;

    console.log('🔍 Filtros recebidos:', { empresa, status, pesquisa, page, limit,offset });

    
    // Buscar veículos com paginação simples
    const vehicles = await db
      .select()
      .from(sgaHinovaVehicle)
      .where(whereClause)
      .orderBy(desc(sgaHinovaVehicle.sgaCreatedAt), desc(sgaHinovaVehicle.id)) // Ordenar por sgaCreatedAt e ID decrescente
      .limit(limit + 1) // +1 para verificar se há próxima página
      .offset(offset);

      console.log('🚗 Veículos encontrados ultima pos', vehicles[vehicles.length -1]);

    // Verificar se há próxima página
    const hasNextPage = vehicles.length > limit;
    const paginatedVehicles = hasNextPage ? vehicles.slice(0, limit) : vehicles;
    const nextPage = hasNextPage ? page + 1 : undefined;

    // Contar total de registros para estatísticas
    const [{ total }] = await db
      .select({ total: count() })
      .from(sgaHinovaVehicle)
      .where(whereClause);

    // Mapear veículos para formato Placa
    const placas = paginatedVehicles.map(mapVehicleToPlaca);

    console.log('📊 Resultados:', {
      total: total,
      retornados: placas.length,
      filtros: { empresa, status, pesquisa }
    });

    return NextResponse.json({
      data: placas,
      nextPage,
      hasNextPage,
      totalCount: total,
      success: true,
      message: 'Placas carregadas com sucesso',
      filtros: { empresa, status, pesquisa }
    });
  } catch (error) {
    console.error('💥 Erro na API de placas:', error);
    return NextResponse.json(
      {
        data: [],
        nextPage: undefined,
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
    const { id, status: newStatus, instalado } = await request.json();

    console.log('🔄 Atualizando status:', { id, newStatus, instalado });

    const vehicleId = parseInt(id);
    if (isNaN(vehicleId)) {
      return NextResponse.json(
        {
          data: null,
          message: 'ID inválido',
          success: false
        },
        { status: 400 }
      );
    }

    // Determinar o status para o banco de dados
    let dbStatus = 'pending';
    if (newStatus) {
      // Usar novo formato de status
      if (newStatus === 'installed') {
        dbStatus = 'installed';
      } else if (newStatus === 'pending') {
        dbStatus = 'pending';
      } else if (newStatus === 'inactive') {
        dbStatus = 'inactive';
      }
    } else if (instalado !== undefined) {
      // Compatibilidade com formato antigo
      dbStatus = instalado ? 'installed' : 'pending';
    }

    // Atualizar no banco de dados
    await db
      .update(sgaHinovaVehicle)
      .set({
        status: dbStatus,
        updatedAt: new Date()
      })
      .where(eq(sgaHinovaVehicle.id, vehicleId));

    // Buscar o veículo atualizado
    const updatedVehicles = await db
      .select()
      .from(sgaHinovaVehicle)
      .where(eq(sgaHinovaVehicle.id, vehicleId));

    if (updatedVehicles.length === 0) {
      return NextResponse.json(
        {
          data: null,
          message: 'Veículo não encontrado',
          success: false
        },
        { status: 404 }
      );
    }

    const updatedVehicle = updatedVehicles[0];
    const placaAtualizada = mapVehicleToPlaca(updatedVehicle);

    console.log('✅ Status atualizado:', placaAtualizada);

    return NextResponse.json({
      data: placaAtualizada,
      message: 'Status atualizado com sucesso',
      success: true
    });
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