import { NextResponse } from 'next/server';
import { getAuthContext, getProjectAccess } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { env } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

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
        return NextResponse.json({ error: 'Viewers cannot delete variables.' }, { status: 403 });
    }

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
