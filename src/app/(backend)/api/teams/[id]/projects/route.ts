import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { projects, teamMembers } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    try {
        // 1. Verify user is a member of this team
        const [membership] = await db.select().from(teamMembers).where(and(
            eq(teamMembers.team_id, id),
            eq(teamMembers.user_id, context.user.id)
        ));

        if (!membership) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Fetch projects owned by this team
        const teamProjects = await db.select()
            .from(projects)
            .where(and(
                eq(projects.team_id, id),
                isNull(projects.deleted_at)
            ));

        // 3. Attach the user's role in the team to each project so the frontend knows FE permissions
        const projectsWithRole = teamProjects.map(p => ({
            ...p,
            role: membership.role
        }));

        return NextResponse.json(projectsWithRole);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
