import { pgTable, text, uuid, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

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

const ENV_KEY_REGEX = /^[A-Z][A-Z0-9_]*$/;

export const envCreateSchema = z.object({
    key: z
        .string()
        .min(1, 'Key is required')
        .max(255, 'Key must be 255 characters or fewer')
        .regex(ENV_KEY_REGEX, 'Key must be uppercase letters, digits, and underscores only'),
    value: z
        .string()
        .min(1, 'Value is required')
        .max(65_536, 'Value must be 64 KB or fewer'),
});

export const envUpdateSchema = envCreateSchema;

export const envBulkSchema = z.object({
    content: z
        .string()
        .min(1, 'Content is required')
        .max(1_000_000, 'Content must be 1 MB or fewer'),
});