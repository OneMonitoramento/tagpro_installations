import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sgaHinovaVehicle } from '@/lib/db/sgaHinovaVehicle';
import { eq, desc } from 'drizzle-orm';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresa = searchParams.get('empresa') as 'lwsim' | 'binsat';

    if (!empresa || !['lwsim', 'binsat'].includes(empresa)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Parâmetro empresa é obrigatório e deve ser "lwsim" ou "binsat"'
        },
        { status: 400 }
      );
    }

    // Mapear empresa para valor do banco
    const companyValue = empresa === 'lwsim' ? 'lw_sim' : 'binsat';

    // Buscar todos os veículos da empresa
    const vehicles = await db
      .select()
      .from(sgaHinovaVehicle)
      .where(eq(sgaHinovaVehicle.company, companyValue))
      .orderBy(desc(sgaHinovaVehicle.sgaCreatedAt), desc(sgaHinovaVehicle.id));

    // Mapear dados para formato de exportação
    const exportData = vehicles.map((vehicle, index) => ({
      'Nº': index + 1,
      'Placa': vehicle.plate,
      'Modelo': vehicle.model || 'Não informado',
      'Fabricante': vehicle.manufacturer || 'Não informado',
      'Ano Modelo': vehicle.modelYear || 'Não informado',
      'Ano Fabricação': vehicle.manufacturerYear || 'Não informado',
      'VIN': vehicle.vin || 'Não informado',
      'Renavam': vehicle.renavam || 'Não informado',
      'Status': vehicle.status === 'installed' ? 'Instalado' : 
                vehicle.status === 'pending' ? 'Pendente' : 
                vehicle.status === 'inactive' ? 'Inativo' : vehicle.status,
      'Status Sync': vehicle.statusSync || 'Não informado',
      'Data Criação SGA': vehicle.sgaCreatedAt ? new Date(vehicle.sgaCreatedAt).toLocaleDateString('pt-BR') : 'Não informado',
      'Data Atualização': vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleDateString('pt-BR') : 'Não informado'
    }));

    // Criar workbook e worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Adicionar worksheet ao workbook
    const sheetName = empresa === 'lwsim' ? 'LW SIM' : 'Binsat';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Gerar buffer do arquivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Definir nome do arquivo com data atual
    const currentDate = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const fileName = `veiculos_${empresa}_${currentDate}.xlsx`;

    // Retornar arquivo como resposta
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('💥 Erro na exportação:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao exportar dados para Excel'
      },
      { status: 500 }
    );
  }
}