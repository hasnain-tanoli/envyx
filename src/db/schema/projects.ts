import { pgTable, text, uuid, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { user } from './users';
import { teams } from './teams';
import { z } from 'zod';

export const projects = pgTable('projects', {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    team_id: uuid('team_id').references(() => teams.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    description: text('description'),
    env_count: integer('env_count').default(0),
    environment: text('environment').default('development'),
    deleted_at: timestamp('deleted_at'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
    user_id_idx: index('user_id_idx').on(table.user_id),
    team_id_idx: index('team_id_idx').on(table.team_id),
}));

export const projectCreateSchema = z.object({
    name: z
        .string()
        .min(1, 'Project name is required')
        .max(100, 'Project name must be 100 characters or fewer'),
    description: z
        .string()
        .max(500, 'Description must be 500 characters or fewer')
        .optional(),
    environment: z
        .enum(['production', 'staging', 'development'])
        .optional()
        .default('development'),
    team_id: z.string().uuid().optional().nullable(),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
    team_id: z.string().uuid().optional().nullable()
});