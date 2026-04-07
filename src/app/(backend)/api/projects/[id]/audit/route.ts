import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects, env, env_audit_log } from '@/db/schema';
import { and, desc, eq, isNull } from 'drizzle-orm';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    // Check project ownership
    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id),
        eq(projects.user_id, session.user.id),
        isNull(projects.deleted_at)
    ));
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    try {
        const audits = await db
            .select({
                id: env_audit_log.id,
                env_id: env_audit_log.env_id,
                user_id: env_audit_log.user_id,
                action: env_audit_log.action,
                key_name: env_audit_log.key_name,
                created_at: env_audit_log.created_at,
            })
            .from(env_audit_log)
            .innerJoin(env, eq(env_audit_log.env_id, env.id))
            .where(eq(env.project_id, id))
            .orderBy(desc(env_audit_log.created_at))
            .limit(50);

        return NextResponse.json(audits);
    } catch (e: unknown) {
        console.error('Audit fetch error:', e);
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
