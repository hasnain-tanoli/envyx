import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { teamMembers, user } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    // Verify membership
    const [membership] = await db.select().from(teamMembers).where(and(
        eq(teamMembers.team_id, id),
        eq(teamMembers.user_id, context.user.id)
    ));
    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    try {
        const members = await db.select({
            user_id: user.id,
            name: user.name,
            email: user.email,
            role: teamMembers.role,
            joined_at: teamMembers.created_at,
        })
        .from(teamMembers)
        .innerJoin(user, eq(teamMembers.user_id, user.id))
        .where(eq(teamMembers.team_id, id));

        return NextResponse.json(members);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    // Verify admin/owner permissions
    const [adminCheck] = await db.select().from(teamMembers).where(and(
        eq(teamMembers.team_id, id),
        eq(teamMembers.user_id, context.user.id)
    ));

    if (!adminCheck || (adminCheck.role !== 'owner' && adminCheck.role !== 'admin')) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { email, role } = await req.json();
    
    // Find user by email
    const [invitedUser] = await db.select().from(user).where(eq(user.email, email));
    if (!invitedUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    try {
        await db.insert(teamMembers).values({
            team_id: id,
            user_id: invitedUser.id,
            role: role || 'member',
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'User already in team or internal error' }, { status: 409 });
    }
}
