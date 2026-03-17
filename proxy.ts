import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth';
import { verifySession } from './lib/auth/sessions/jwt';

const protectedRoutes = ['/', '/admin'];

export default async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);

    const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value ?? '';
    const session = await verifySession(cookie);

    if (isProtectedRoute && !session.ok) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
