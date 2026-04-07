import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects, env } from '@/db/schema';
import { and, eq, isNotNull } from 'drizzle-orm';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id), 
        eq(projects.user_id, session.user.id)
    ));
    // Even if the project is deleted, we might want to allow viewing its trash? No, just keep it simple.
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    try {
        const trashEnvs = await db.select().from(env).where(and(
            eq(env.project_id, id),
            isNotNull(env.deleted_at)
        ));

        // Note: For trash, we might not want to decrypt the values or send them down at all 
        // to prevent exposing secrets unnecessarily in the trash UI. However, for consistency 
        // with the active variables view, we return them (optionally decrypted, or obfuscated). 
        // We will just return the undecrypted ones or obfuscated as "••••••••"  to keep trash fast and safe.
        const safeTrashEnvs = trashEnvs.map(e => ({
            ...e,
            value: '••••••••', // Never expose raw decrypted values in trash for safety
        }));

        return NextResponse.json(safeTrashEnvs);
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
