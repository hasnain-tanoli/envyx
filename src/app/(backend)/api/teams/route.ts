import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { teams, teamMembers, teamCreateSchema, validationErrorResponse } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Get teams where user is a member
        const userTeams = await db.select({
            id: teams.id,
            name: teams.name,
            slug: teams.slug,
            role: teamMembers.role,
        })
        .from(teams)
        .innerJoin(teamMembers, eq(teams.id, teamMembers.team_id))
        .where(eq(teamMembers.user_id, context.user.id));

        return NextResponse.json(userTeams);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => null);
    const parsed = teamCreateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(validationErrorResponse(parsed.error), { status: 400 });
    }

    const { name, slug } = parsed.data;

    try {
        const [newTeam] = await db.transaction(async (tx) => {
            const [t] = await tx.insert(teams).values({
                name,
                slug,
                owner_id: context.user.id,
            }).returning();

            await tx.insert(teamMembers).values({
                team_id: t.id,
                user_id: context.user.id,
                role: 'owner',
            });

            return [t];
        });

        return NextResponse.json(newTeam, { status: 201 });
    } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('unique constraint')) {
            return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
        }
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
