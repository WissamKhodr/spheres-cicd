import 'server-only';
import { jwtVerify, SignJWT } from 'jose';
import { ENVIRONMENT } from '@/config';
import type { SessionPayload } from './definitions';

const encodedKey = new TextEncoder().encode(ENVIRONMENT.SESSION_SECRET);

export async function verifySession(
    token: string,
): Promise<{ ok: true; payload: SessionPayload } | { ok: false }> {
    try {
        const { payload } = await jwtVerify(token, encodedKey, {
            algorithms: ['HS256'],
        });
        return { ok: true, payload: payload as SessionPayload };
    } catch {
        return { ok: false };
    }
}

export async function signSession(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(payload.createdAt)
        .setExpirationTime(payload.expiresAt)
        .sign(encodedKey);
}

