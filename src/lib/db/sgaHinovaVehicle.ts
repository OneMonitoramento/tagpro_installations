import { mysqlTable, int, varchar, datetime, date, index, unique } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const sgaHinovaVehicle = mysqlTable('sga_hinova_vehicles', {
  id: int('id').primaryKey().autoincrement(),
  sgaVehicleId: varchar('sgaVehicleId', { length: 50 }),
  sgaClientId: varchar('sgaClientId', { length: 50 }),
  sgaSituationId: varchar('sgaSituationId', { length: 50 }),
  lightVehicleId: varchar('lightVehicleId', { length: 50 }),
  lightCompanyId: varchar('lightCompanyId', { length: 50 }),
  lightClientId: varchar('lightClientId', { length: 50 }),
  company: varchar('company', { length: 255 }),
  plate: varchar('plate', { length: 20 }).notNull(),
  vin: varchar('vin', { length: 50 }),
  renavam: varchar('renavam', { length: 50 }),
  manufacturer: varchar('manufacturer', { length: 100 }),
  model: varchar('model', { length: 100 }),
  modelYear: varchar('modelYear', { length: 4 }),
  manufacturerYear: varchar('manufacturerYear', { length: 4 }),
  status: varchar('status', { length: 50 }).notNull(),
  statusSync: varchar('statusSync', { length: 50 }).notNull(),
  sgaCreatedAt: date('sgaCreatedAt'),
  createdAt: datetime('createdAt').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
}, (table) => [
  unique('sgaVehicleId_unique').on(table.sgaVehicleId),
  unique('lightVehicleId_unique').on(table.lightVehicleId),
  index('plate_idx').on(table.plate),
  index('status_idx').on(table.status),
  index('statusSync_idx').on(table.statusSync),
  index('company_idx').on(table.company),
  index('createdAt_idx').on(table.createdAt),
  index('company_createdAt_idx').on(table.company, table.createdAt)
]);


export type SgaHinovaVehicle = typeof sgaHinovaVehicle.$inferSelect;
export type NewSgaHinovaVehicle = typeof sgaHinovaVehicle.$inferInsert;