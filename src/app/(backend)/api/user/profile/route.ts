import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const [userData] = await db.select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            createdAt: user.createdAt,
        }).from(user).where(eq(user.id, context.user.id));

        if (!userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(userData);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const context = await getAuthContext(req);
    if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, image } = await req.json();
        const [updatedUser] = await db.update(user)
            .set({ 
                name, 
                image, 
                updatedAt: new Date() 
            })
            .where(eq(user.id, context.user.id))
            .returning();

        return NextResponse.json(updatedUser);
    } catch (e) {
        console.error('Profile update error:', e);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
