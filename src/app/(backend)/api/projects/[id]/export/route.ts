import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { projects, env } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { decryptValue } from '@/lib/crypto';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'env';

    // Verify ownership or token project mapping
    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id),
        eq(projects.user_id, context.user.id),
        isNull(projects.deleted_at)
    ));

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // If using a token, ensure it belongs to this project
    if (context.token && context.token.project_id !== id) {
        return NextResponse.json({ error: 'Token scope mismatch' }, { status: 403 });
    }

    try {
        const envs = await db.select().from(env).where(and(
            eq(env.project_id, id),
            isNull(env.deleted_at)
        ));

        const decrypted = envs.map(e => ({
            key: e.key,
            value: decryptValue(e.value)
        }));

        if (format === 'json') {
            return NextResponse.json(decrypted);
        }

        // Default: .env format
        const content = decrypted.map(e => `${e.key}="${e.value.replace(/"/g, '\\"')}"`).join('\n');
        
        return new Response(content, {
            headers: {
                'Content-Type': 'text/plain',
                'Content-Disposition': `attachment; filename="${project.name}.env"`
            }
        });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
