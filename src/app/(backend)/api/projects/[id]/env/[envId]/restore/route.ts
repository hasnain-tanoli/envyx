import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { projects, env, env_audit_log } from '@/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';

export async function POST(req: Request, { params }: { params: Promise<{ id: string, envId: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Tokens are Read-Only
    if (context.token) {
        return NextResponse.json({ error: 'Tokens are read-only' }, { status: 403 });
    }

    const { id, envId } = await params;

    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id),
        eq(projects.user_id, context.user.id),
        isNull(projects.deleted_at)
    ));
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Find the deleted env
    const [trashedEnv] = await db.select().from(env).where(and(
        eq(env.id, envId),
        eq(env.project_id, id)
    ));
    if (!trashedEnv || !trashedEnv.deleted_at) {
        return NextResponse.json({ error: 'Deleted variable not found' }, { status: 404 });
    }

    // Check for collision - does an active variable with this key already exist?
    const [existingActive] = await db.select().from(env).where(and(
        eq(env.project_id, id),
        eq(env.key, trashedEnv.key),
        isNull(env.deleted_at)
    ));

    if (existingActive) {
        return NextResponse.json({ 
            error: `Cannot restore: an active variable with key "${trashedEnv.key}" already exists.` 
        }, { status: 409 });
    }

    try {
        await db.update(env)
            .set({ deleted_at: null, updated_at: new Date() })
            .where(eq(env.id, envId));

        await db.insert(env_audit_log).values({
            env_id: envId,
            user_id: context.user.id,
            action: 'restore',
            key_name: trashedEnv.key,
        });

        await db.update(projects)
            .set({ env_count: sql`COALESCE(${projects.env_count}, 0) + 1` })
            .where(eq(projects.id, id));

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
