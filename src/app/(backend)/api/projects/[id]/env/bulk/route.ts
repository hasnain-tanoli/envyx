import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { projects, env, env_audit_log } from '@/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { encryptValue } from '@/lib/crypto';
import { envBulkSchema, envCreateSchema, validationErrorResponse } from '@/db/schema';

/** Maximum number of variables allowed in a single bulk import */
const BULK_LIMIT = 500;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Tokens are Read-Only
    if (context.token) {
        return NextResponse.json({ error: 'Tokens are read-only' }, { status: 403 });
    }

    const { id } = await params;

    // Validate request body
    const body = await req.json().catch(() => null);
    const parsed = envBulkSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(validationErrorResponse(parsed.error), { status: 400 });
    }
    const { content } = parsed.data;

    // Verify project ownership
    const [project] = await db.select().from(projects).where(and(
        eq(projects.id, id),
        eq(projects.user_id, context.user.id),
        isNull(projects.deleted_at)
    ));
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // --- Parse .env content ---
    const lines = content.split('\n');
    const candidates: { key: string; value: string }[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex < 1) continue;
        const rawKey = trimmed.slice(0, eqIndex).trim().toUpperCase();
        const rawValue = trimmed.slice(eqIndex + 1).trim().replace(/^['"](.*)['"]$/, '$1');
        candidates.push({ key: rawKey, value: rawValue });
    }

    if (candidates.length === 0) {
        return NextResponse.json({ error: 'No valid KEY=VALUE pairs found in content' }, { status: 400 });
    }

    if (candidates.length > BULK_LIMIT) {
        return NextResponse.json({ error: `Bulk import is limited to ${BULK_LIMIT} variables per request` }, { status: 400 });
    }

    // --- Validate each key/value with shared schema ---
    const inserted: string[] = [];
    const skipped: { key: string; reason: string }[] = [];

    try {
        await db.transaction(async (tx) => {
            // Fetch existing keys for this project once (avoids N round-trips)
            const existingEnvs = await tx.select({ key: env.key }).from(env).where(and(
                eq(env.project_id, id),
                isNull(env.deleted_at)
            ));
            const existingKeys = new Set(existingEnvs.map(e => e.key));

            for (const candidate of candidates) {
                // Schema validation
                const validation = envCreateSchema.safeParse(candidate);
                if (!validation.success) {
                    skipped.push({
                        key: candidate.key,
                        reason: Object.values(validation.error.flatten().fieldErrors).flat().join('; '),
                    });
                    continue;
                }

                const { key, value } = validation.data;

                // Duplicate check
                if (existingKeys.has(key)) {
                    skipped.push({ key, reason: 'Already exists in this project' });
                    continue;
                }

                const encryptedValue = encryptValue(value);
                const [newEnv] = await tx.insert(env).values({ project_id: id, key, value: encryptedValue }).returning();

                // Audit log — metadata only, never secret value
                await tx.insert(env_audit_log).values({
                    env_id: newEnv.id,
                    user_id: context.user.id,
                    action: 'create',
                    key_name: key,
                });

                existingKeys.add(key); // Prevent duplicates within the same batch
                inserted.push(key);
            }

            // Update env_count once
            if (inserted.length > 0) {
                await tx.update(projects)
                    .set({ env_count: sql`COALESCE(${projects.env_count}, 0) + ${inserted.length}` })
                    .where(eq(projects.id, id));
            }
        });

        return NextResponse.json({ inserted: inserted.length, skipped }, { status: 201 });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
