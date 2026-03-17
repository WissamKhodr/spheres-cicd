import 'server-only';
import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { sessionsTable, type usersTable } from '@/db/schema';
import { SESSION_COOKIE_NAME } from './definitions';
import { signSession } from './jwt';

export async function createSession(user: typeof usersTable.$inferSelect) {
    const createdAt = new Date();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const data = await db
        .insert(sessionsTable)
        .values({
            id: randomBytes(32).toString('base64url'),
            userId: user.id,
            createdAt,
            expiresAt,
        })
        .returning({ id: sessionsTable.id });

    const sessionId = data[0].id;

    const signedSession = await signSession({
        sessionId,
        userId: user.id,
        createdAt,
        expiresAt,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, signedSession, {
        httpOnly: true,
        secure: false, // TODO: Make true in prod
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
}
