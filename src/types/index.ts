import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { user, projects, env, env_audit_log } from '@/db/schema';

// User types inferred from Better Auth Drizzle schema
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

// Project types inferred from Drizzle ORM schemas
export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;

// Environment types inferred from Drizzle ORM schemas
export type Environment = InferSelectModel<typeof env> & { error?: boolean };
export type NewEnvironment = InferInsertModel<typeof env>;

// Audit Log types inferred from Drizzle ORM schemas
export type EnvAuditLog = InferSelectModel<typeof env_audit_log>;
export type NewEnvAuditLog = InferInsertModel<typeof env_audit_log>;
