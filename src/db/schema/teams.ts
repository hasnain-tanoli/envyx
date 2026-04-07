import { pgTable, text, uuid, timestamp, index } from 'drizzle-orm/pg-core';
import { user } from './users';
import { z } from 'zod';

export const teams = pgTable('teams', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    owner_id: text('owner_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
    owner_id_idx: index('owner_id_idx').on(table.owner_id),
}));

export const teamCreateSchema = z.object({
    name: z.string().min(1, 'Team name is required').max(100),
    slug: z.string().min(1, 'Slug is required').max(50).regex(/^[a-z0-9-]+$/, 'Slug must be url-friendly'),
});
