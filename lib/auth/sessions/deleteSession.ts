import { cookies } from 'next/headers';
import 'server-only';
import { SESSION_COOKIE_NAME } from './definitions';

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}
