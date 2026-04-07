import { NextResponse } from 'next/server';
import { getAuthContext, getProjectAccess } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { projects, env, env_audit_log } from '@/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { encryptValue } from '@/lib/crypto';
import { envUpdateSchema, validationErrorResponse } from '@/db/schema';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string, envId: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, envId } = await params;
    const access = await getProjectAccess(id, context);
    if (!access) return NextResponse.json({ error: 'Project not found or no access' }, { status: 404 });

    // Permissions
    if (context.token) {
        return NextResponse.json({ error: 'Tokens are read-only' }, { status: 403 });
    }
    if (access.role === 'viewer') {
        return NextResponse.json({ error: 'Viewers cannot edit environment variables.' }, { status: 403 });
    }

    // Validate request body
    const body = await req.json().catch(() => null);
    const parsed = envUpdateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(validationErrorResponse(parsed.error), { status: 400 });
    }
    const { key, value } = parsed.data;

    const [existingEnv] = await db.select().from(env).where(and(
        eq(env.id, envId),
        eq(env.project_id, id),
        isNull(env.deleted_at)
    ));
    if (!existingEnv) return NextResponse.json({ error: 'Env not found' }, { status: 404 });

    // Check for collision if the key is changing
    if (key !== existingEnv.key) {
        const [collision] = await db.select().from(env).where(and(
            eq(env.project_id, id),
            eq(env.key, key),
            isNull(env.deleted_at)
        ));
        if (collision) {
            return NextResponse.json({ 
                error: `Environment variable "${key}" already exists in this project.` 
            }, { status: 409 });
        }
    }

    try {
        const encryptedValue = encryptValue(value);
        const [updatedEnv] = await db.update(env)
            .set({ key, value: encryptedValue, updated_at: new Date() })
            .where(eq(env.id, envId))
            .returning();

        // Audit log — store only safe metadata, never secret values
        await db.insert(env_audit_log).values({
            env_id: envId,
            user_id: context.user.id,
            action: 'update',
            key_name: key,
        });

        return NextResponse.json(updatedEnv);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, envId: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, envId } = await params;
    const access = await getProjectAccess(id, context);
    if (!access) return NextResponse.json({ error: 'Project not found or no access' }, { status: 404 });

    // Permissions
    if (context.token) {
        return NextResponse.json({ error: 'Tokens are read-only' }, { status: 403 });
    }
    if (access.role === 'viewer') {
        return NextResponse.json({ error: 'Viewers cannot delete environment variables.' }, { status: 403 });
    }

    const [existingEnv] = await db.select().from(env).where(and(
        eq(env.id, envId),
        eq(env.project_id, id),
        isNull(env.deleted_at)
    ));
    if (!existingEnv) return NextResponse.json({ error: 'Env not found' }, { status: 404 });

    try {
        await db.update(env).set({ deleted_at: new Date() }).where(eq(env.id, envId));

        // Audit log — store only safe metadata, never secret values
        await db.insert(env_audit_log).values({
            env_id: envId,
            user_id: context.user.id,
            action: 'delete',
            key_name: existingEnv.key,
        });

        await db.update(projects)
            .set({ env_count: sql`GREATEST(COALESCE(${projects.env_count}, 0) - 1, 0)` })
            .where(eq(projects.id, id));

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
