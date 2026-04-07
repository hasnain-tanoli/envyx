import { pgTable, text, uuid, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { user } from './users';

export const projects = pgTable('projects', {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    env_count: integer('env_count').default(0),
    environment: text('environment').default('development'),
    deleted_at: timestamp('deleted_at'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
    user_id_idx: index('user_id_idx').on(table.user_id),
}));