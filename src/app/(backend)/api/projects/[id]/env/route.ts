import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { projects, env, env_audit_log } from '@/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { encryptValue, decryptValue } from '@/lib/crypto';
import { envCreateSchema, validationErrorResponse } from '@/db/schema';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id),
        eq(projects.user_id, context.user.id),
        isNull(projects.deleted_at)
    ));
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // If using token auth, verify project scope
    if (context.token && context.token.project_id !== id) {
        return NextResponse.json({ error: 'Token scope mismatch' }, { status: 403 });
    }

    try {
        const envs = await db.select().from(env).where(and(
            eq(env.project_id, id),
            isNull(env.deleted_at)
        ));

        const decryptedEnvs = envs.map(e => {
            try {
                return {
                    ...e,
                    value: decryptValue(e.value),
                };
            } catch (error: unknown) {
                console.error(`Failed to decrypt env ${e.id}:`, error);
                return {
                    ...e,
                    value: `[DECRYPTION_FAILED: ${error instanceof Error ? error.message : 'Unknown error'}]`,
                    error: true
                };
            }
        });

        return NextResponse.json(decryptedEnvs);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Tokens are currently for Read-Only access only, preventing write operations via token
    if (context.token) {
        return NextResponse.json({ error: 'Only session auth is allowed for write operations. Tokens are read-only.' }, { status: 403 });
    }

    const { id } = await params;

    // Validate request body
    const body = await req.json().catch(() => null);
    const parsed = envCreateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(validationErrorResponse(parsed.error), { status: 400 });
    }
    const { key, value } = parsed.data;

    // Check for existing non-deleted variable with same key
    const [existingEnv] = await db.select().from(env).where(and(
        eq(env.project_id, id),
        eq(env.key, key),
        isNull(env.deleted_at)
    ));
    if (existingEnv) {
        return NextResponse.json({
            error: `Environment variable "${key}" already exists in this project.`
        }, { status: 409 });
    }

    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id),
        eq(projects.user_id, context.user.id),
        isNull(projects.deleted_at)
    ));
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    try {
        const encryptedValue = encryptValue(value);
        const [newEnv] = await db.insert(env).values({ project_id: id, key, value: encryptedValue }).returning();

        // Audit log — store only safe metadata, never the secret value
        await db.insert(env_audit_log).values({
            env_id: newEnv.id,
            user_id: context.user.id,
            action: 'create',
            key_name: key,
        });

        await db.update(projects)
            .set({ env_count: sql`COALESCE(${projects.env_count}, 0) + 1` })
            .where(eq(projects.id, id));

        return NextResponse.json({ ...newEnv, value }, { status: 201 });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
