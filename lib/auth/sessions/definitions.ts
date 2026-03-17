export const SESSION_COOKIE_NAME = 'session';

export type SessionPayload = {
    sessionId: string;
    userId: number;
    createdAt: Date;
    expiresAt: Date;
};
