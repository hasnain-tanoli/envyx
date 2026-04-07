import { NextResponse } from 'next/server';
import { getAuthContext, getProjectAccess } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { projects } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { projectUpdateSchema, validationErrorResponse } from '@/db/schema';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const access = await getProjectAccess(id, context);
    if (!access) return NextResponse.json({ error: 'Project not found or no access' }, { status: 404 });

    // Include the role in the response so the frontend knows what UI to show
    return NextResponse.json({
        ...access.project,
        role: access.role
    });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const access = await getProjectAccess(id, context);
    if (!access) return NextResponse.json({ error: 'Project not found or no access' }, { status: 404 });

    // Permissions: Only Owner and Admin can edit project settings
    if (access.role !== 'owner' && access.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions to edit project settings' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const parsed = projectUpdateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(validationErrorResponse(parsed.error), { status: 400 });
    }
    const { name, description, environment, team_id } = parsed.data;

    try {
        const [updatedProject] = await db.update(projects)
            .set({ 
                name, 
                description, 
                environment, 
                team_id: (team_id === undefined) ? access.project.team_id : (team_id && team_id.trim() !== "" ? team_id : null),
                updated_at: new Date() 
            })
            .where(eq(projects.id, id))
            .returning();
            
        return NextResponse.json(updatedProject);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const access = await getProjectAccess(id, context);
    if (!access) return NextResponse.json({ error: 'Project not found or no access' }, { status: 404 });

    // Permissions: Only Owner can delete project
    if (access.role !== 'owner') {
        return NextResponse.json({ error: 'Only project owners can delete the project' }, { status: 403 });
    }

    try {
        await db.update(projects).set({ deleted_at: new Date() })
            .where(eq(projects.id, id));
            
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
