import { mysqlTable, int, varchar, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const sgaHinovaTagproBalance = mysqlTable('sga_hinova_tagpro_balance', {
  id: int('id').primaryKey().autoincrement(),
  binsatTotal: int('binsatTotal'),
  lwsimTotal: int('lwsimTotal'),
  createdAt: datetime('createdAt').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updatedAt').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
});

export type SgaHinovaTagproBalance = typeof sgaHinovaTagproBalance.$inferSelect;
export type NewSgaHinovaTagproBalance = typeof sgaHinovaTagproBalance.$inferInsert;