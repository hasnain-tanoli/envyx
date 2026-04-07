import { pgTable, text, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { user } from './users';
import { teams } from './teams';
import { z } from 'zod';

export const teamRoleEnum = ['owner', 'admin', 'member', 'viewer'] as const;
export type TeamRole = (typeof teamRoleEnum)[number];

export const teamMembers = pgTable('team_members', {
    team_id: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    user_id: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    role: text('role', { enum: teamRoleEnum }).notNull().default('member'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
    pk: primaryKey({ columns: [table.team_id, table.user_id] }),
}));

export const teamMemberSchema = z.object({
    role: z.enum(teamRoleEnum),
});
