import { mysqlTable, int, varchar, datetime, date, index, unique } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const sgaHinovaClient = mysqlTable('sga_hinova_clients', {
  id: int('id').primaryKey().autoincrement(),
  sgaClientId: varchar('sgaClientId', { length: 50 }),
  sgaSituationId: varchar('sgaSituationId', { length: 50 }),
  lightClientId: varchar('lightClientId', { length: 50 }),
  lightCompanyId: varchar('lightCompanyId', { length: 100 }),
  company: varchar('company', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  cpf: varchar('cpf', { length: 20 }),
  rg: varchar('rg', { length: 20 }),
  phone: varchar('phone', { length: 20 }),
  phone2: varchar('phone2', { length: 20 }),
  phone3: varchar('phone3', { length: 20 }),
  email: varchar('email', { length: 255 }),
  birthDate: date('birthDate'),
  zipCode: varchar('zipCode', { length: 10 }),
  street: varchar('street', { length: 255 }),
  neighborhood: varchar('neighborhood', { length: 100 }),
  complement: varchar('complement', { length: 255 }),
  number: varchar('number', { length: 20 }),
  city: varchar('city', { length: 100 }),
  uf: varchar('uf', { length: 2 }),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  statusSync: varchar('statusSync', { length: 50 }).default('pending').notNull(),
  sgaCreatedAt: date('sgaCreatedAt'),
  createdAt: datetime('createdAt').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
}, (table) => [
  unique('sgaClientId_unique').on(table.sgaClientId),
  unique('lightClientId_unique').on(table.lightClientId),
  index('company_idx').on(table.company),
  index('status_idx').on(table.status),
  index('statusSync_idx').on(table.statusSync),
  index('createdAt_idx').on(table.createdAt),
  index('company_createdAt_idx').on(table.company, table.createdAt)
]);


export type SgaHinovaClient = typeof sgaHinovaClient.$inferSelect;
export type NewSgaHinovaClient = typeof sgaHinovaClient.$inferInsert;