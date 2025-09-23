// Path: ./src/app/api/service-orders/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sgaServiceOrders } from "@/lib/db/sgaServiceOrders";
import { sgaHinovaVehicle } from "@/lib/db/sgaHinovaVehicle";
import { auditLogs } from "@/lib/db/auditLog";
import { extractTokenFromHeader, verifyToken } from "@/lib/auth/jwt";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const resolvedParams = await params;
    const serviceOrderId = resolvedParams.id;

    // Extract user information from JWT token
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);
    let userInfo = null;

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userInfo = {
          userId: payload.userId,
          username: payload.username,
          role: payload.role,
        };
      }
    }

    // Validate status
    if (!["pending", "done"].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido. Use "pending" ou "done".' },
        { status: 400 }
      );
    }

    // Get current service order status before updating
    const currentServiceOrder = await db
      .select({
        status: sgaServiceOrders.status,
        sgaVehicleId: sgaServiceOrders.sgaVehicleId,
        serviceType: sgaServiceOrders.serviceType,
      })
      .from(sgaServiceOrders)
      .where(eq(sgaServiceOrders.id, parseInt(serviceOrderId)))
      .limit(1);

    if (currentServiceOrder.length === 0) {
      return NextResponse.json(
        { error: "Ordem de serviço não encontrada." },
        { status: 404 }
      );
    }

    const oldStatus = currentServiceOrder[0].status;

    // Execute all operations in a transaction
    await db.transaction(async (tx) => {
      // Update service order status
      await tx
        .update(sgaServiceOrders)
        .set({
          status,
          updatedAt: new Date(),
          // If completing, set completion date
          ...(status === "done" && { completedDate: new Date() }),
        })
        .where(eq(sgaServiceOrders.id, parseInt(serviceOrderId)));

      // If status is 'done', also update the related vehicle status to 'installed'
      if (status === "done" && currentServiceOrder[0].sgaVehicleId) {
        // Update the vehicle status to 'installed'
        const serviceOrderType = currentServiceOrder[0].serviceType;
        let _status = "";
        if (serviceOrderType === "installation") {
          _status = "installed";
        } else if (serviceOrderType === "uninstallation") {
          _status = "inactive";
        }
        await tx
          .update(sgaHinovaVehicle)
          .set({
            status: _status,
            updatedAt: new Date(),
          })
          .where(
            eq(
              sgaHinovaVehicle.sgaVehicleId,
              currentServiceOrder[0].sgaVehicleId
            )
          );
      }

      // Create audit log entry
      await tx.insert(auditLogs).values({
        entityType: "service_order",
        entityId: serviceOrderId,
        operation: "status_update",
        databaseType: "integration",
        data: {
          oldStatus: oldStatus,
          newStatus: status,
          updatedAt: new Date().toISOString(),
          sgaVehicleId: currentServiceOrder[0].sgaVehicleId,
          ...(userInfo && {
            userId: userInfo.userId,
            username: userInfo.username,
            userRole: userInfo.role,
          }),
          ...(status === "done" && {
            completedDate: new Date().toISOString(),
            vehicleStatusUpdated: !!currentServiceOrder[0].sgaVehicleId,
          }),
        },
        syncOperation: "service_order_status_update",
      });
    });

    return NextResponse.json({
      success: true,
      message: "Status da ordem de serviço atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar status da ordem de serviço:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor ao atualizar status",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
