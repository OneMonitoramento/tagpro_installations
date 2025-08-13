import {
  mysqlTable,
  int,
  varchar,
  datetime,
  decimal,
  text,
  index,
  unique,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const sgaServiceOrders = mysqlTable(
  "sga_service_orders",
  {
    id: int("id").primaryKey().autoincrement(),
    sgaVehicleId: varchar("sgaVehicleId", { length: 50 }),
    sgaClientId: varchar("sgaClientId", { length: 50 }),
    lightServiceOrderId: varchar("lightServiceOrderId", { length: 50 }),
    lightVehicleId: varchar("lightVehicleId", { length: 50 }),
    company: varchar("company", { length: 255 }),
    serviceOrderNumber: varchar("serviceOrderNumber", { length: 100 }),
    description: text("description"),
    serviceType: varchar("serviceType", { length: 100 }),
    priority: varchar("priority", { length: 50 }),
    status: varchar("status", { length: 50 }).notNull(),
    scheduledDate: datetime("scheduledDate"),
    completedDate: datetime("completedDate"),
    sgaEvent: varchar("sgaEvent", { length: 50 }),
    sgaEventDate: datetime("sgaEventDate"),
    createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updatedAt").default(
      sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
    ),
  },
  (table) => [
    unique("lightServiceOrderId_unique").on(table.lightServiceOrderId),
    index("serviceOrderNumber_idx").on(table.serviceOrderNumber),
    index("status_idx").on(table.status),
    index("company_idx").on(table.company),
    index("sgaVehicleId_idx").on(table.sgaVehicleId),
    index("sgaClientId_idx").on(table.sgaClientId),
    index("createdAt_idx").on(table.createdAt),
    index("company_createdAt_idx").on(table.company, table.createdAt),
    index("scheduledDate_idx").on(table.scheduledDate),
  ]
);

export type SgaServiceOrder = typeof sgaServiceOrders.$inferSelect;
export type NewSgaServiceOrder = typeof sgaServiceOrders.$inferInsert;
