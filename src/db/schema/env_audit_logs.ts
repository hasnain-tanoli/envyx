import { pgTable, text, uuid, timestamp, index } from 'drizzle-orm/pg-core';
import { user } from './users';
import { env } from './env';

export const env_audit_log = pgTable('env_audit_log', {
    id: uuid('id').primaryKey().defaultRandom(),
    env_id: uuid('env_id').notNull().references(() => env.id, { onDelete: 'cascade' }),
    user_id: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    old_value: text('old_value'),
    new_value: text('new_value'),
    created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
    env_id_idx: index('env_id_idx').on(table.env_id),
    created_at_idx: index('created_at_idx').on(table.created_at),
}));