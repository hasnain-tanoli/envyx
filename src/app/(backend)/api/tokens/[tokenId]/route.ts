import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { api_tokens } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function DELETE(req: Request, { params }: { params: Promise<{ tokenId: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { tokenId } = await params;

    try {
        // Enforce ownership check before deletion
        const [token] = await db.select().from(api_tokens).where(and(
            eq(api_tokens.id, tokenId),
            eq(api_tokens.user_id, session.user.id)
        ));

        if (!token) {
            return NextResponse.json({ error: 'Token not found or unauthorized' }, { status: 404 });
        }

        await db.delete(api_tokens).where(eq(api_tokens.id, tokenId));

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
