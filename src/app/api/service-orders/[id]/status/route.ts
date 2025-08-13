// Path: ./src/app/api/service-orders/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sgaServiceOrders } from '@/lib/db/sgaServiceOrders';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const resolvedParams = await params;
    const serviceOrderId = resolvedParams.id;

    // Validate status
    if (!['pending', 'done'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido. Use "pending" ou "done".' },
        { status: 400 }
      );
    }

    // Update service order status
    await db
      .update(sgaServiceOrders)
      .set({ 
        status,
        updatedAt: new Date(),
        // If completing, set completion date
        ...(status === 'done' && { completedDate: new Date() })
      })
      .where(eq(sgaServiceOrders.id, parseInt(serviceOrderId)));

    return NextResponse.json({ 
      success: true, 
      message: 'Status da ordem de serviço atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar status da ordem de serviço:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor ao atualizar status',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}