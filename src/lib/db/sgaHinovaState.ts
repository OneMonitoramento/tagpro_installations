import { mysqlTable, int, varchar, json, text, boolean, datetime, index } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const sgaHinovaState = mysqlTable('sga_hinova_state', {
  id: int('id').primaryKey().autoincrement(),
  lightCompanyId: varchar('lightCompanyId', { length: 50 }),
  company: varchar('company', { length: 255 }),
  state: json('state'),
  description: text('description'),
  isActive: boolean('isActive').default(true),
  createdAt: datetime('createdAt').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
}, (table) => [
  index('lightCompanyId_idx').on(table.lightCompanyId)
]);

export type SgaHinovaState = typeof sgaHinovaState.$inferSelect;
export type NewSgaHinovaState = typeof sgaHinovaState.$inferInsert;