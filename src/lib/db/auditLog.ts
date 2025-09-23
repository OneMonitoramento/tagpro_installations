import {
  mysqlTable,
  bigint,
  varchar,
  json,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: varchar("entity_id", { length: 50 }).notNull(),
    operation: varchar("operation", { length: 50 }).notNull(),
    databaseType: mysqlEnum("database_type", [
      "integration",
      "light",
    ]).notNull(),

    // Dados da operação
    data: json("data").notNull(),

    // Metadados
    source: varchar("source", { length: 50 }).notNull().default("sga-hinova"),
    lightCompanyId: varchar("light_company_id", { length: 20 }),
    syncOperation: varchar("sync_operation", { length: 100 }),
    sqsMessageId: varchar("sqs_message_id", { length: 255 }),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    entityTypeIdIdx: index("idx_entity_type_id").on(
      table.entityType,
      table.entityId
    ),
    operationDateIdx: index("idx_operation_date").on(
      table.operation,
      table.createdAt
    ),
    lightCompanyIdIdx: index("idx_light_company_id").on(table.lightCompanyId),
    syncOperationIdx: index("idx_sync_operation").on(table.syncOperation),
    sqsMessageIdIdx: index("idx_sqs_message_id").on(table.sqsMessageId),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
