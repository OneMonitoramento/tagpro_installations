// Path: ./src/app/api/service-orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sgaServiceOrders } from "@/lib/db/sgaServiceOrders";
import { sgaHinovaVehicle } from "@/lib/db/sgaHinovaVehicle";
import { sgaHinovaClient } from "@/lib/db/sgaHinovaClient";
import { and, or, like, desc, sql, gt, eq } from "drizzle-orm";
import type { ServiceOrder } from "@/types";

const ITEMS_PER_PAGE = 20;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresa = searchParams.get("empresa");
    const status = searchParams.get("status");
    const pesquisa = searchParams.get("pesquisa");
    const tipoInstalacao = searchParams.get("tipoInstalacao");
    const evento = searchParams.get("evento");
    const cursor = searchParams.get("cursor");

    // Build where conditions for filters (excluding pagination)
    const filterConditions = [];

    // Filter by company
    if (empresa && empresa !== "todos") {
      filterConditions.push(
        like(
          sgaServiceOrders.company,
          empresa === "lw_sim" ? "%lw_sim%" : "%binsat%"
        )
      );
    }

    // Filter by status
    if (status && status !== "todos") {
      filterConditions.push(like(sgaServiceOrders.status, `%${status}%`));
    }

    // Filter by installation type (serviceType)
    if (tipoInstalacao && tipoInstalacao !== "todos") {
      filterConditions.push(
        eq(sgaServiceOrders.serviceType, tipoInstalacao)
      );
    }

    // Filter by event (sgaEvent)
    if (evento && evento !== "todos") {
      filterConditions.push(
        eq(sgaServiceOrders.sgaEvent, evento)
      );
    }

    // Filter by search term
    if (pesquisa && pesquisa.trim()) {
      const searchTerm = `%${pesquisa.trim()}%`;
      const numericSearch = parseInt(pesquisa.trim());

      const searchConditions = [
        like(sgaServiceOrders.serviceOrderNumber, searchTerm),
        like(sgaServiceOrders.description, searchTerm),
        like(sgaServiceOrders.sgaVehicleId, searchTerm),
        like(sgaServiceOrders.lightServiceOrderId, searchTerm),
        like(sgaHinovaVehicle.plate, searchTerm),
        like(sgaHinovaClient.name, searchTerm),
      ];

      // If the search term is numeric, also search by ID
      if (!isNaN(numericSearch)) {
        searchConditions.push(eq(sgaServiceOrders.id, numericSearch));
      }

      filterConditions.push(or(...searchConditions));
    }

    // Build where clause for filters only (for total count)
    const filterWhereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Build complete where conditions including pagination
    const allWhereConditions = [...filterConditions];

    // Cursor-based pagination
    if (cursor) {
      // Parse cursor which should contain both createdAt and id for proper pagination
      try {
        const cursorData = JSON.parse(cursor);
        if (cursorData.createdAt && cursorData.id) {
          // Use composite cursor: records where createdAt < cursor.createdAt OR (createdAt = cursor.createdAt AND id < cursor.id)
          allWhereConditions.push(
            or(
              sql`${sgaServiceOrders.createdAt} < ${cursorData.createdAt}`,
              and(
                sql`${sgaServiceOrders.createdAt} = ${cursorData.createdAt}`,
                sql`${sgaServiceOrders.id} < ${cursorData.id}`
              )
            )
          );
        }
      } catch (e) {
        // Fallback to old cursor format for compatibility
        allWhereConditions.push(gt(sgaServiceOrders.id, parseInt(cursor)));
      }
    }

    // Build final where clause with all conditions (including pagination)
    const whereClause =
      allWhereConditions.length > 0 ? and(...allWhereConditions) : undefined;

    // Execute query with joins to get vehicle and client data
    const serviceOrders = await db
      .select({
        // Service order fields
        id: sgaServiceOrders.id,
        sgaVehicleId: sgaServiceOrders.sgaVehicleId,
        sgaClientId: sgaServiceOrders.sgaClientId,
        lightServiceOrderId: sgaServiceOrders.lightServiceOrderId,
        lightVehicleId: sgaServiceOrders.lightVehicleId,
        company: sgaServiceOrders.company,
        serviceOrderNumber: sgaServiceOrders.serviceOrderNumber,
        description: sgaServiceOrders.description,
        serviceType: sgaServiceOrders.serviceType,
        priority: sgaServiceOrders.priority,
        status: sgaServiceOrders.status,
        scheduledDate: sgaServiceOrders.scheduledDate,
        completedDate: sgaServiceOrders.completedDate,
        sgaEvent: sgaServiceOrders.sgaEvent,
        sgaEventDate: sgaServiceOrders.sgaEventDate,
        createdAt: sgaServiceOrders.createdAt,
        updatedAt: sgaServiceOrders.updatedAt,
        // Vehicle fields
        vehiclePlate: sgaHinovaVehicle.plate,
        vehicleManufacturer: sgaHinovaVehicle.manufacturer,
        vehicleModel: sgaHinovaVehicle.model,
        vehicleModelYear: sgaHinovaVehicle.modelYear,
        // Client fields
        clientName: sgaHinovaClient.name,
        clientCpf: sgaHinovaClient.cpf,
      })
      .from(sgaServiceOrders)
      .leftJoin(
        sgaHinovaVehicle,
        eq(sgaServiceOrders.sgaVehicleId, sgaHinovaVehicle.sgaVehicleId)
      )
      .leftJoin(
        sgaHinovaClient,
        eq(sgaServiceOrders.sgaClientId, sgaHinovaClient.sgaClientId)
      )
      .where(whereClause)
      .orderBy(desc(sgaServiceOrders.createdAt), desc(sgaServiceOrders.id))
      .limit(ITEMS_PER_PAGE + 1); // Get one extra to check if there are more

    // Determine if there are more pages
    const hasNextPage = serviceOrders.length > ITEMS_PER_PAGE;
    const returnedOrders = hasNextPage
      ? serviceOrders.slice(0, ITEMS_PER_PAGE)
      : serviceOrders;

    // Get next cursor - use composite cursor with createdAt and id
    const nextCursor = hasNextPage
      ? JSON.stringify({
          createdAt:
            returnedOrders[returnedOrders.length - 1].createdAt?.toISOString(),
          id: returnedOrders[returnedOrders.length - 1].id,
        })
      : undefined;

    // Get total count for the current filters (excluding pagination)
    const [{ count: totalCount }] = await db
      .select({ count: sql`count(*)` })
      .from(sgaServiceOrders)
      .leftJoin(
        sgaHinovaVehicle,
        eq(sgaServiceOrders.sgaVehicleId, sgaHinovaVehicle.sgaVehicleId)
      )
      .leftJoin(
        sgaHinovaClient,
        eq(sgaServiceOrders.sgaClientId, sgaHinovaClient.sgaClientId)
      )
      .where(filterWhereClause);

    // Map database fields to API format
    const mappedOrders: ServiceOrder[] = returnedOrders.map((order) => ({
      id: order.id.toString(),
      sgaVehicleId: order.sgaVehicleId || undefined,
      sgaClientId: order.sgaClientId || undefined,
      lightServiceOrderId: order.lightServiceOrderId || undefined,
      lightVehicleId: order.lightVehicleId || undefined,
      company: order.company || undefined,
      serviceOrderNumber: order.serviceOrderNumber || undefined,
      description: order.description || undefined,
      serviceType: order.serviceType || undefined,
      priority: order.priority || undefined,
      status: order.status,
      scheduledDate: order.scheduledDate?.toISOString() || undefined,
      completedDate: order.completedDate?.toISOString() || undefined,
      sgaEvent: order.sgaEvent || undefined,
      sgaEventDate: order.sgaEventDate?.toISOString() || undefined,
      createdAt: order.createdAt?.toISOString() || "",
      updatedAt: order.updatedAt?.toISOString() || "",
      // Vehicle data
      vehiclePlate: order.vehiclePlate || undefined,
      vehicleManufacturer: order.vehicleManufacturer || undefined,
      vehicleModel: order.vehicleModel || undefined,
      vehicleModelYear: order.vehicleModelYear || undefined,
      // Client data
      clientName: order.clientName || undefined,
      clientCpf: order.clientCpf || undefined,
    }));

    return NextResponse.json({
      data: mappedOrders,
      nextCursor,
      hasNextPage,
      totalCount: Number(totalCount),
    });
  } catch (error) {
    console.error("Erro ao buscar ordens de serviço:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor ao buscar ordens de serviço",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
