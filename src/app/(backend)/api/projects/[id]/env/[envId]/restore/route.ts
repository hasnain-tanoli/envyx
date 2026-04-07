import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects, env, env_audit_log } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export async function POST(req: Request, { params }: { params: Promise<{ id: string, envId: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, envId } = await params;

    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id),
        eq(projects.user_id, session.user.id),
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
            user_id: session.user.id,
            action: 'restore',
            key_name: trashedEnv.key,
        });

        await db.update(projects)
            .set({ env_count: (project.env_count || 0) + 1 })
            .where(eq(projects.id, id));

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
