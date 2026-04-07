import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects, env, env_audit_log } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { encryptValue } from '@/lib/crypto';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string, envId: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, envId } = await params;
    const { key, value } = await req.json();

    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id), 
        eq(projects.user_id, session.user.id),
        isNull(projects.deleted_at)
    ));
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const [existingEnv] = await db.select().from(env).where(and(
        eq(env.id, envId), 
        eq(env.project_id, id),
        isNull(env.deleted_at)
    ));
    if (!existingEnv) return NextResponse.json({ error: 'Env not found' }, { status: 404 });

    try {
        const encryptedValue = encryptValue(value);
        const [updatedEnv] = await db.update(env).set({ key, value: encryptedValue, updated_at: new Date() })
            .where(eq(env.id, envId)).returning();
        
        await db.insert(env_audit_log).values({
            env_id: envId,
            user_id: session.user.id,
            action: 'update',
            old_value: existingEnv.value,
            new_value: value,
        });

        return NextResponse.json(updatedEnv);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, envId: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, envId } = await params;

    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id), 
        eq(projects.user_id, session.user.id),
        isNull(projects.deleted_at)
    ));
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const [existingEnv] = await db.select().from(env).where(and(
        eq(env.id, envId), 
        eq(env.project_id, id),
        isNull(env.deleted_at)
    ));
    if (!existingEnv) return NextResponse.json({ error: 'Env not found' }, { status: 404 });

    try {
        await db.update(env).set({ deleted_at: new Date() })
            .where(eq(env.id, envId));
        
        await db.insert(env_audit_log).values({
            env_id: envId,
            user_id: session.user.id,
            action: 'delete',
            old_value: existingEnv.value,
        });

        await db.update(projects).set({ env_count: Math.max((project.env_count || 0) - 1, 0) }).where(eq(projects.id, id));

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
