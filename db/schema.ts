import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  data: text('data').notNull(),
  active: integer('active').notNull().default(1),
  revision: integer('revision').notNull().default(1),
  updated: text('updated').notNull(),
});
