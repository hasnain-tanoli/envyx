import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { teamMembers } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, memberId: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, memberId } = await params;

    // Verify admin/owner permissions of the requester
    const [adminCheck] = await db.select().from(teamMembers).where(and(
        eq(teamMembers.team_id, id),
        eq(teamMembers.user_id, context.user.id)
    ));

    if (!adminCheck || (adminCheck.role !== 'owner' && adminCheck.role !== 'admin')) {
        // Allow self-removal
        if (context.user.id !== memberId) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }
    }

    // Prevent removing the last owner? (Maybe too complex for now, but good to keep in mind)

    try {
        await db.delete(teamMembers).where(and(
            eq(teamMembers.team_id, id),
            eq(teamMembers.user_id, memberId)
        ));

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string, memberId: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, memberId } = await params;

    // Only owner/admin can change roles
    const [adminCheck] = await db.select().from(teamMembers).where(and(
        eq(teamMembers.team_id, id),
        eq(teamMembers.user_id, context.user.id)
    ));

    if (!adminCheck || (adminCheck.role !== 'owner' && adminCheck.role !== 'admin')) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { role } = await req.json();

    try {
        await db.update(teamMembers)
            .set({ role, updated_at: new Date() })
            .where(and(
                eq(teamMembers.team_id, id),
                eq(teamMembers.user_id, memberId)
            ));

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
