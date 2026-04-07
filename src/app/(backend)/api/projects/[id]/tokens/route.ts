import { NextResponse } from 'next/server';
import { getAuthContext, getProjectAccess } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { api_tokens, tokenCreateSchema, validationErrorResponse } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateToken, hashToken } from '@/lib/tokens';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const access = await getProjectAccess(id, context);
    if (!access) return NextResponse.json({ error: 'Project not found or no access' }, { status: 404 });

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
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const access = await getProjectAccess(id, context);
    if (!access) return NextResponse.json({ error: 'Project not found or no access' }, { status: 404 });

    // Permissions: Only Owner and Admin can manage tokens
    if (access.role !== 'owner' && access.role !== 'admin') {
        return NextResponse.json({ error: 'Only team owners and admins can manage API tokens' }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const parsed = tokenCreateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(validationErrorResponse(parsed.error), { status: 400 });
    }
    const { name, expires_in_days } = parsed.data;

    try {
        const rawToken = generateToken();
        const hashedToken = hashToken(rawToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expires_in_days);

        const [newToken] = await db.insert(api_tokens).values({
            user_id: context.user.id,
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
