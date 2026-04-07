import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects, teamMembers } from '@/db/schema';
import { and, eq, isNull, or, sql } from 'drizzle-orm';
import { projectCreateSchema, validationErrorResponse } from '@/db/schema';

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // 1. Fetch personal projects (where user is direct owner and no team is assigned)
        const personalProjects = await db.select({
            id: projects.id,
            name: projects.name,
            description: projects.description,
            environment: projects.environment,
            team_id: projects.team_id,
            user_id: projects.user_id,
            created_at: projects.created_at,
            updated_at: projects.updated_at,
            deleted_at: projects.deleted_at,
            role: sql<string>`'owner'`
        })
        .from(projects)
        .where(and(
            eq(projects.user_id, session.user.id),
            isNull(projects.team_id),
            isNull(projects.deleted_at)
        ));

        // 2. Fetch projects shared via teams the user belongs to
        const teamProjects = await db.select({
            id: projects.id,
            name: projects.name,
            description: projects.description,
            environment: projects.environment,
            team_id: projects.team_id,
            user_id: projects.user_id,
            created_at: projects.created_at,
            updated_at: projects.updated_at,
            deleted_at: projects.deleted_at,
            role: teamMembers.role
        })
        .from(projects)
        .innerJoin(teamMembers, eq(projects.team_id, teamMembers.team_id))
        .where(and(
            eq(teamMembers.user_id, session.user.id),
            isNull(projects.deleted_at)
        ));

        // 3. Combine and return
        return NextResponse.json([...personalProjects, ...teamProjects]);
    } catch (e: unknown) {
        console.error('Projects GET failed:', e);
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => null);
    const parsed = projectCreateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(validationErrorResponse(parsed.error), { status: 400 });
    }
    const { name, description, environment, team_id } = parsed.data;

    try {
        // If team_id is provided, check if user has permissions (admin/owner)
        if (team_id) {
            const membership = await db.select()
                .from(teamMembers)
                .where(and(
                    eq(teamMembers.team_id, team_id),
                    eq(teamMembers.user_id, session.user.id)
                ))
                .limit(1);
            
            if (!membership.length || (membership[0].role !== 'owner' && membership[0].role !== 'admin')) {
                return NextResponse.json({ error: 'Insufficient permissions for this team' }, { status: 403 });
            }
        }

        const [newProject] = await db.insert(projects).values({
            user_id: session.user.id,
            name,
            description,
            environment,
            team_id: (team_id && team_id.trim() !== "") ? team_id : null,
        }).returning();
        return NextResponse.json(newProject, { status: 201 });
    } catch (e: unknown) {
        console.error('Project creation failed:', e);
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
