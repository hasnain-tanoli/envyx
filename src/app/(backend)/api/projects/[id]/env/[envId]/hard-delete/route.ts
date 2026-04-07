import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects, env } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, envId: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, envId } = await params;

    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id),
        eq(projects.user_id, session.user.id)
    ));
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    try {
        // Hard deletion - DB cascade handles env_audit_log cleanup
        await db.delete(env).where(and(
            eq(env.id, envId),
            eq(env.project_id, id)
        ));

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
