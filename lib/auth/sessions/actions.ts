'use server';

import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { eq, and } from 'drizzle-orm'
import { createSession } from './createSession';
import { deleteSession } from './deleteSession';
import { usersTable, pinsTable } from '@/db/schema';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from './definitions';
import { verifySession } from './jwt';

export type FormState = {
    error: string;
    username?: string;
} | null;

export async function login(
    _formState: FormState,
    formData: FormData,
): Promise<FormState> {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { error: 'Username & password required!', username };
    }

    const user = await db.query.usersTable.findFirst({
        where: and(eq(usersTable.username, username), eq(usersTable.deletedAt, 0)),
    });

    if (!user) {
        return { error: 'Wrong login details!', username };
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
        return { error: 'Wrong login details!', username };
    }

    await createSession(user);
    redirect('/');
}

export async function logout() {
    await deleteSession();
    redirect('/login');
}

export async function register(
    _formState: FormState,
    formData: FormData,
): Promise<FormState> {
    const name = formData.get('name') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password || !name) {
        return { error: 'name, pass, username!', username };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // första användaren ska vara en admin, resten vanliga users, sen kan man ju lägga till fler admins eller roller!
    const existingUser = await db.query.usersTable.findFirst({ where: eq(usersTable.deletedAt, 0) });
    const role = existingUser ? 'user' : 'admin';

    const user = await db.insert(usersTable).values({
        username,
        name,
        passwordHash,
        role,
    })

    if (!user) {
        return { error: 'Wrong login details!', username };
    }

    redirect('/login');
}


export async function getCurrentUser() {
    const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value ?? '';
    const session = await verifySession(cookie);
    if (!session.ok) return null;

    const result = await db
        .select({
            id: usersTable.id,
            username: usersTable.username,
            name: usersTable.name,
            role: usersTable.role,
        })
        .from(usersTable)
        .where(and(eq(usersTable.id, session.payload.userId), eq(usersTable.deletedAt, 0)))
        .limit(1);

    return result[0] ?? null;
}

export async function deleteAccount() {
    const user = await getCurrentUser();
    if (!user) return redirect('/login');
    // soft-delete all pins created by the user (set deletedAt to unix timestamp)
    await db.update(pinsTable).set({ deletedAt: Math.floor(Date.now() / 1000) }).where(eq(pinsTable.creatorId, user.id));

    // soft-delete the user instead of hard-deleting
    await db.update(usersTable).set({ deletedAt: Math.floor(Date.now() / 1000) }).where(eq(usersTable.id, user.id));
    await deleteSession();
    redirect('/login');
}