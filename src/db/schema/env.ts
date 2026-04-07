import { pgTable, text, uuid, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { sql } from 'drizzle-orm';

export const env = pgTable('env', {
    id: uuid('id').primaryKey().defaultRandom(),
    project_id: uuid('project_id').notNull().references(() => projects.id),
    key: text('key').notNull(),
    value: text('value').notNull(),
    deleted_at: timestamp('deleted_at'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
    unique_key_per_project: uniqueIndex('unique_key_per_project')
        .on(table.project_id, table.key)
        .where(sql`${table.deleted_at} IS NULL`),
    index_project: index('index_project').on(table.project_id),
}));