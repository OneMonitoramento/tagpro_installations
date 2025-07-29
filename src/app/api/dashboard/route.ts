import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sgaHinovaVehicle } from '@/lib/db/sgaHinovaVehicle';
import { sgaHinovaClient } from '@/lib/db/sgaHinovaClient';
import { sgaHinovaState } from '@/lib/db/sgaHinovaState';
import { count, eq, desc, and } from 'drizzle-orm';
import { SyncState } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Buscar estatísticas de veículos
    const [totalVehicles] = await db
      .select({ total: count() })
      .from(sgaHinovaVehicle);

    const [installedVehicles] = await db
      .select({ total: count() })
      .from(sgaHinovaVehicle)
      .where(eq(sgaHinovaVehicle.status, 'installed'));

    const [pendingVehicles] = await db
      .select({ total: count() })
      .from(sgaHinovaVehicle)
      .where(eq(sgaHinovaVehicle.status, 'pending'));

    const [inactiveVehicles] = await db
      .select({ total: count() })
      .from(sgaHinovaVehicle)
      .where(eq(sgaHinovaVehicle.status, 'inactive'));

    // Buscar estatísticas por empresa (LW SIM e Binsat)
    const [lwSimTotal] = await db
      .select({ total: count() })
      .from(sgaHinovaVehicle)
      .where(eq(sgaHinovaVehicle.company, 'lw_sim'));

    const [lwSimInstalled] = await db
      .select({ total: count() })
      .from(sgaHinovaVehicle)
      .where(and(
        eq(sgaHinovaVehicle.company, 'lw_sim'),
        eq(sgaHinovaVehicle.status, 'installed')
      ));

    const [lwSimPending] = await db
      .select({ total: count() })
      .from(sgaHinovaVehicle)
      .where(and(
        eq(sgaHinovaVehicle.company, 'lw_sim'),
        eq(sgaHinovaVehicle.status, 'pending')
      ));

    const [lwSimInactive] = await db
      .select({ total: count() })
      .from(sgaHinovaVehicle)
      .where(and(
        eq(sgaHinovaVehicle.company, 'lw_sim'),
        eq(sgaHinovaVehicle.status, 'inactive')
      ));

    const [binsatTotal] = await db
      .select({ total: count() })
      .from(sgaHinovaVehicle)
      .where(eq(sgaHinovaVehicle.company, 'binsat'));

    const [binsatInstalled] = await db
      .select({ total: count() })
      .from(sgaHinovaVehicle)
      .where(and(
        eq(sgaHinovaVehicle.company, 'binsat'),
        eq(sgaHinovaVehicle.status, 'installed')
      ));

    const [binsatPending] = await db
      .select({ total: count() })
      .from(sgaHinovaVehicle)
      .where(and(
        eq(sgaHinovaVehicle.company, 'binsat'),
        eq(sgaHinovaVehicle.status, 'pending')
      ));

    const [binsatInactive] = await db
      .select({ total: count() })
      .from(sgaHinovaVehicle)
      .where(and(
        eq(sgaHinovaVehicle.company, 'binsat'),
        eq(sgaHinovaVehicle.status, 'inactive')
      ));

    // Buscar estatísticas de clientes
    const [totalClients] = await db
      .select({ total: count() })
      .from(sgaHinovaClient);

    // Buscar informações de sincronização da tabela sgaHinovaState
    const syncStates = await db
      .select()
      .from(sgaHinovaState)
      .where(eq(sgaHinovaState.isActive, true))
      .orderBy(desc(sgaHinovaState.updatedAt))
      .limit(1);

    let syncInfo = {
      lastSyncDate: new Date().toISOString(),
      newVehicles: 0,
      updatedVehicles: 0,
      updatedClients: 0,
    };

    if (syncStates.length > 0 && syncStates[0].state) {
      try {
        const state = syncStates[0].state as SyncState;
        
        // Data da última sincronização (newVehicles.lastSuccessfulSync.date)
        if (state.newVehicles?.lastSuccessfulSync?.date) {
          syncInfo.lastSyncDate = state.newVehicles.lastSuccessfulSync.date;
        }

        // Novos veículos (newVehicles.lastSuccessfulSync.details.successCount)
        if (state.newVehicles?.lastSuccessfulSync?.details?.successCount) {
          syncInfo.newVehicles = state.newVehicles.lastSuccessfulSync.details.successCount;
        }

        // Veículos alterados (updatedVehicles.lastSuccessfulSync.details.successCount)
        if (state.updatedVehicles?.lastSuccessfulSync?.details?.successCount) {
          syncInfo.updatedVehicles = state.updatedVehicles.lastSuccessfulSync.details.successCount;
        }

        // Clientes alterados (updatedClients.lastSuccessfulSync.details.successCount)
        if (state.updatedClients?.lastSuccessfulSync?.details?.successCount) {
          syncInfo.updatedClients = state.updatedClients.lastSuccessfulSync.details.successCount;
        }
      } catch (error) {
        console.error('Erro ao processar estado de sincronização:', error);
        // Manter valores padrão em caso de erro
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalization: {
          totalVehicles: totalVehicles.total,
          totalClients: totalClients.total,
          totalInstalled: installedVehicles.total,
          totalPending: pendingVehicles.total,
          totalInactive: inactiveVehicles.total,
        },
        companies: {
          lwsim: {
            total: lwSimTotal.total,
            installed: lwSimInstalled.total,
            pending: lwSimPending.total,
            inactive: lwSimInactive.total,
          },
          binsat: {
            total: binsatTotal.total,
            installed: binsatInstalled.total,
            pending: binsatPending.total,
            inactive: binsatInactive.total,
          }
        },
        syncInfo
      }
    });
  } catch (error) {
    console.error('💥 Erro na API de dashboard:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao carregar estatísticas do dashboard',
        data: null
      },
      { status: 500 }
    );
  }
}