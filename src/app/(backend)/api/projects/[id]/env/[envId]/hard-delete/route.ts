import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { projects, env } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, envId: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Tokens are Read-Only
    if (context.token) {
        return NextResponse.json({ error: 'Tokens are read-only' }, { status: 403 });
    }

    const { id, envId } = await params;

    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id),
        eq(projects.user_id, context.user.id)
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
