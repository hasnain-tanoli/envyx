import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects, env, env_audit_log } from '@/db/schema';
import { and, desc, eq, inArray, isNull } from 'drizzle-orm';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id), 
        eq(projects.user_id, session.user.id),
        isNull(projects.deleted_at)
    ));
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    try {
        const projectEnvs = await db.select({ id: env.id }).from(env).where(and(
            eq(env.project_id, id)
            // we might want audit logs even for deleted envs, so no isNull filter here
        ));
        
        if (projectEnvs.length === 0) return NextResponse.json([]);

        const envIds = projectEnvs.map(e => e.id);
        const audits = await db.select().from(env_audit_log)
            .where(inArray(env_audit_log.env_id, envIds))
            .orderBy(desc(env_audit_log.created_at));

        return NextResponse.json(audits);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
