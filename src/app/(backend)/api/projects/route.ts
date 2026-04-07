import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const userProjects = await db.select().from(projects).where(and(
            eq(projects.user_id, session.user.id),
            isNull(projects.deleted_at)
        ));
        return NextResponse.json(userProjects);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, description, environment } = await req.json();
        const [newProject] = await db.insert(projects).values({
            user_id: session.user.id,
            name,
            description,
            environment: environment || 'development',
        }).returning();
        return NextResponse.json(newProject);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
