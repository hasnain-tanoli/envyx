import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { api_tokens } from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { hashToken } from './tokens';

export interface AuthContext {
    user: {
        id: string;
    };
    token?: {
        id: string;
        project_id: string;
        scopes: string[];
    };
}

/**
 * Returns a unified AuthContext from request headers.
 * Supports both Session cookies and Authorization: Bearer tokens.
 */
export async function getAuthContext(req: Request): Promise<AuthContext | null> {
    // 1. Try Session (Standard Browser Auth)
    const session = await auth.api.getSession({ headers: req.headers });
    if (session) {
        return {
            user: { id: session.user.id }
        };
    }

    // 2. Try Bearer Token (CLI/API Auth)
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const rawToken = authHeader.slice(7);
        if (!rawToken.startsWith('envy_')) return null;

        const hashed = hashToken(rawToken);
        const [tokenRecord] = await db.select().from(api_tokens).where(and(
            eq(api_tokens.token_hash, hashed),
            sql`${api_tokens.expires_at} > NOW()`
        ));

        if (tokenRecord) {
            // Update last used at in background
            db.update(api_tokens)
                .set({ last_used_at: new Date() })
                .where(eq(api_tokens.id, tokenRecord.id))
                .execute();

            return {
                user: { id: tokenRecord.user_id },
                token: {
                    id: tokenRecord.id,
                    project_id: tokenRecord.project_id,
                    scopes: (tokenRecord.scopes as string[]) || ['read']
                }
            };
        }
    }

    return null;
}
