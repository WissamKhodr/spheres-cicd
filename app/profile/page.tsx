import Link from 'next/link';
import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, logout, deleteAccount } from '@/lib/auth';
import { eq } from 'drizzle-orm'
import { verifySession } from '@/lib/auth/sessions/jwt';

export default async function Profile() {
    const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value ?? '';
    const session = await verifySession(cookie);
    if (!session.ok) return redirect('/login')
    const users = await db.select().from(usersTable).where(eq(usersTable.id, session.payload.userId));
    const user = users[0];
    if (!user) return redirect('/login');

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            padding: '40px 20px'
        }}>
            <div style={{
                maxWidth: '500px',
                margin: '0 auto'
            }}>
                <div style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '40px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                }}>
                    <h1 style={{
                        margin: '0 0 30px 0',
                        textAlign: 'center',
                        color: '#1a1a2e',
                        fontSize: '28px'
                    }}>
                        Min profil
                    </h1>

                    <div style={{ marginBottom: '25px' }}>
                        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 5px 0' }}>Namn</p>
                        <p style={{ color: '#1a1a2e', fontSize: '18px', margin: 0, fontWeight: '500' }}>{user.name}</p>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 5px 0' }}>Användarnamn</p>
                        <p style={{ color: '#1a1a2e', fontSize: '18px', margin: 0, fontWeight: '500' }}>@{user.username}</p>
                    </div>

                    <div style={{
                        borderTop: '1px solid #eee',
                        paddingTop: '25px',
                        marginTop: '25px'
                    }}>
                        <Link
                            href="/"
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '14px',
                                background: '#1a1a2e',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                textAlign: 'center',
                                textDecoration: 'none',
                                boxSizing: 'border-box',
                                marginBottom: '10px'
                            }}
                        >
                            Tillbaka till Spheres
                        </Link>

                        <form action={logout}>
                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: '#666',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    marginBottom: '10px'
                                }}
                            >
                                Logga ut
                            </button>
                        </form>

                        <form action={deleteAccount}>
                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: '#d32f2f',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    cursor: 'pointer'
                                }}
                            >
                                Ta bort konto
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
