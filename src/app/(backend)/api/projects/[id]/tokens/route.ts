import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects, api_tokens, tokenCreateSchema, validationErrorResponse } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { generateToken, hashToken } from '@/lib/tokens';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    // Verify ownership
    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id),
        eq(projects.user_id, session.user.id),
        isNull(projects.deleted_at)
    ));
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    try {
        const tokens = await db.select({
            id: api_tokens.id,
            name: api_tokens.name,
            scopes: api_tokens.scopes,
            expires_at: api_tokens.expires_at,
            last_used_at: api_tokens.last_used_at,
            created_at: api_tokens.created_at,
        }).from(api_tokens).where(eq(api_tokens.project_id, id));

        return NextResponse.json(tokens);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const body = await req.json().catch(() => null);
    const parsed = tokenCreateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(validationErrorResponse(parsed.error), { status: 400 });
    }
    const { name, expires_in_days } = parsed.data;

    // Verify project ownership
    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id),
        eq(projects.user_id, session.user.id),
        isNull(projects.deleted_at)
    ));
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    try {
        const rawToken = generateToken();
        const hashedToken = hashToken(rawToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expires_in_days);

        const [newToken] = await db.insert(api_tokens).values({
            user_id: session.user.id,
            project_id: id,
            name,
            token_hash: hashedToken,
            expires_at: expiresAt,
        }).returning();

        // Return the raw token ONLY ONCE
        return NextResponse.json({
            token: rawToken,
            id: newToken.id,
            name: newToken.name,
            expires_at: newToken.expires_at,
        }, { status: 201 });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
