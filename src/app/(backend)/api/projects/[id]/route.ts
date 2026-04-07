import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    try {
        const [project] = await db.select().from(projects).where(and(
            eq(projects.id, id),
            eq(projects.user_id, session.user.id),
            isNull(projects.deleted_at)
        ));
        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(project);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    try {
        const { name, description, environment } = await req.json();
        const [updatedProject] = await db.update(projects).set({ name, description, environment, updated_at: new Date() })
            .where(and(eq(projects.id, id), eq(projects.user_id, session.user.id), isNull(projects.deleted_at))).returning();
        if (!updatedProject) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(updatedProject);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    try {
        const [deleted] = await db.update(projects).set({ deleted_at: new Date() })
            .where(and(eq(projects.id, id), eq(projects.user_id, session.user.id), isNull(projects.deleted_at))).returning();
        if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
