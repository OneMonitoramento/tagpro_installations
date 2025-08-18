import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sgaServiceOrders } from '@/lib/db/sgaServiceOrders';
import { sgaHinovaVehicle } from '@/lib/db/sgaHinovaVehicle';
import { sgaHinovaClient } from '@/lib/db/sgaHinovaClient';
import { eq, desc, and, like, or } from 'drizzle-orm';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresa = searchParams.get('empresa') as 'lw_sim' | 'binsat' | 'todos';
    const status = searchParams.get('status') as 'pending' | 'done' | 'todos';
    const pesquisa = searchParams.get('pesquisa') || '';
    const tipoInstalacao = searchParams.get('tipoInstalacao') as 'installation' | 'uninstallation' | 'todos';

    // Build query conditions
    const conditions = [];
    
    if (empresa && empresa !== 'todos') {
      conditions.push(eq(sgaServiceOrders.company, empresa));
    }
    
    if (status && status !== 'todos') {
      conditions.push(eq(sgaServiceOrders.status, status));
    }

    if (tipoInstalacao && tipoInstalacao !== 'todos') {
      conditions.push(like(sgaServiceOrders.serviceType, `%${tipoInstalacao}%`));
    }
    
    if (pesquisa.trim()) {
      conditions.push(
        or(
          like(sgaServiceOrders.serviceOrderNumber, `%${pesquisa}%`),
          like(sgaServiceOrders.description, `%${pesquisa}%`),
        )
      );
    }

    // Fetch service orders with joins to get vehicle and client data
    const serviceOrders = await db
      .select({
        // Service Order fields
        id: sgaServiceOrders.id,
        serviceType: sgaServiceOrders.serviceType,
        company: sgaServiceOrders.company,
        completedDate: sgaServiceOrders.completedDate,
        createdAt: sgaServiceOrders.createdAt,
        // Vehicle fields
        vehiclePlate: sgaHinovaVehicle.plate,
        vehicleModel: sgaHinovaVehicle.model,
        vehicleManufacturer: sgaHinovaVehicle.manufacturer,
        vehicleYear: sgaHinovaVehicle.modelYear,
        vehicleVin: sgaHinovaVehicle.vin,
        vehicleCreatedAt: sgaHinovaVehicle.createdAt,
        // Client fields
        clientName: sgaHinovaClient.name,
        clientCpf: sgaHinovaClient.cpf,
      })
      .from(sgaServiceOrders)
      .leftJoin(sgaHinovaVehicle, eq(sgaServiceOrders.sgaVehicleId, sgaHinovaVehicle.sgaVehicleId))
      .leftJoin(sgaHinovaClient, eq(sgaServiceOrders.sgaClientId, sgaHinovaClient.sgaClientId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(sgaServiceOrders.createdAt), desc(sgaServiceOrders.id));

    // Map data for export - apenas os campos solicitados
    const exportData = serviceOrders.map((order, index) => ({
      'Número Ordem de Serviço': order.id,
      'Tipo de Serviço': order.serviceType || 'Não informado',
      'Empresa': order.company === 'lw_sim' ? 'LW SIM' :
                 order.company === 'binsat' ? 'Binsat' : order.company || 'Não informado',
      'Placa': order.vehiclePlate || 'Não informado',
      'Modelo': order.vehicleModel || 'Não informado',
      'Fabricante': order.vehicleManufacturer || 'Não informado',
      'Ano': order.vehicleYear || 'Não informado',
      'Chassi': order.vehicleVin || 'Não informado',
      'Nome do Cliente': order.clientName || 'Não informado',
      'CPF': order.clientCpf || 'Não informado',
      'Data Criação': order.createdAt ? 
        new Date(order.createdAt).toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Não informado',
      'Data da Sincronização': order.vehicleCreatedAt ? 
        new Date(order.vehicleCreatedAt).toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Não informado',
      'Data Conclusão': order.completedDate ? 
        new Date(order.completedDate).toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Não concluído'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns if there's data
    if (exportData.length > 0) {
      const headers = Object.keys(exportData[0]);
      const colWidths: Array<{ width: number }> = [];
      
      headers.forEach((header) => {
        const maxLength = Math.max(
          header.length,
          ...exportData.map(row => String((row as any)[header] || '').length)
        );
        colWidths.push({ width: Math.min(maxLength + 2, 50) });
      });
      worksheet['!cols'] = colWidths;
    }

    // Add worksheet to workbook
    const sheetName = 'Ordens de Serviço';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Define filename with current date and filters
    const currentDate = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const empresaFilter = empresa === 'todos' ? 'todas' : 
                         empresa === 'lw_sim' ? 'lwsim' : empresa;
    const statusFilter = status === 'todos' ? 'todos' : 
                        status === 'pending' ? 'pendentes' : 'concluidas';
    const tipoFilter = tipoInstalacao === 'todos' ? 'todos' :
                      tipoInstalacao === 'installation' ? 'instalacao' : 'remocao';
    const fileName = `ordens_servico_${empresaFilter}_${statusFilter}_${tipoFilter}_${currentDate}.xlsx`;

    // Return file as response
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
    console.error('💥 Erro na exportação de ordens de serviço:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao exportar ordens de serviço para Excel'
      },
      { status: 500 }
    );
  }
}