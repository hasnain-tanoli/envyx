import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { user, projects, env, env_audit_log, teams, teamMembers } from '@/db/schema';

// User types inferred from Better Auth Drizzle schema
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

// Project types inferred from Drizzle ORM schemas
export type Project = InferSelectModel<typeof projects> & {
    role?: 'owner' | 'admin' | 'member' | 'viewer';
};
export type NewProject = InferInsertModel<typeof projects>;

// Environment types inferred from Drizzle ORM schemas
export type Environment = InferSelectModel<typeof env> & { error?: boolean };
export type NewEnvironment = InferInsertModel<typeof env>;

// Audit Log types inferred from Drizzle ORM schemas
export type EnvAuditLog = InferSelectModel<typeof env_audit_log>;
export type NewEnvAuditLog = InferInsertModel<typeof env_audit_log>;

// Team types
export type Team = InferSelectModel<typeof teams> & {
    role?: 'owner' | 'admin' | 'member' | 'viewer';
};
export type NewTeam = InferInsertModel<typeof teams>;
export type TeamMember = InferSelectModel<typeof teamMembers>;
export type NewTeamMember = InferInsertModel<typeof teamMembers>;
