import { z } from 'zod';

export { user, session, account, verification } from './users';
export { projects, projectCreateSchema, projectUpdateSchema } from './projects';
export { env, envCreateSchema, envUpdateSchema, envBulkSchema } from './env';
export { env_audit_log } from './env_audit_logs';

export function validationErrorResponse(error: z.ZodError) {
    return {
        error: 'Validation failed',
        details: error.flatten().fieldErrors,
    };
}