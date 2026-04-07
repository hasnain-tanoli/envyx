import { pgTable, text, uuid, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { user } from './users';
import { projects } from './projects';
import { z } from 'zod';

export const api_tokens = pgTable('api_tokens', {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    project_id: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    token_hash: text('token_hash').notNull().unique(),
    scopes: jsonb('scopes').notNull().default(['read']),
    expires_at: timestamp('expires_at').notNull(),
    last_used_at: timestamp('last_used_at'),
    created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
    user_id_idx: index('api_token_user_id_idx').on(table.user_id),
    project_id_idx: index('api_token_project_id_idx').on(table.project_id),
    token_hash_idx: index('token_hash_idx').on(table.token_hash),
}));

export const tokenCreateSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    expires_in_days: z.number().min(1).max(365).default(30),
});
