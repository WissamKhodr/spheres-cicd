'use client';

import { useActionState } from 'react';
import { register } from '@/lib/auth';
import Link from 'next/link';

export default function Register() {
    const [state, action, pending] = useActionState(register, null);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
        }}>
            <div style={{
                background: '#fff',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                width: '100%',
                maxWidth: '380px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url(/bg-spheres.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.15,
                    zIndex: 0
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{
                        margin: '0 0 10px 0',
                        textAlign: 'center',
                        color: '#2196F3',
                        fontSize: '36px',
                        fontWeight: 'bold',
                        letterSpacing: '3px'
                    }}>
                        SPHERES
                    </h1>
                    <p style={{
                        margin: '0 0 30px 0',
                        textAlign: 'center',
                        color: '#666',
                        fontSize: '22px'
                    }}>
                        Sociala cirklar i nästa dimension
                    </p>
                    <p style={{
                        margin: '0 0 30px 0',
                        textAlign: 'center',
                        color: '#666',
                        fontSize: '18px'
                    }}>
                        Skapa konto
                    </p>

                    <form action={action}>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                name="name"
                                placeholder="Ditt namn"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <input
                                name="username"
                                defaultValue={state?.username}
                                placeholder="Användarnamn"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <input
                                name="password"
                                type="password"
                                placeholder="Lösenord"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {state?.error && (
                            <p style={{
                                color: '#d32f2f',
                                margin: '0 0 20px 0',
                                textAlign: 'center',
                                fontSize: '14px'
                            }}>
                                {state.error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={pending}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: pending ? '#999' : '#1a1a2e',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                cursor: pending ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {pending ? 'Laddar...' : 'Registrera'}
                        </button>
                    </form>

                    <p style={{
                        textAlign: 'center',
                        marginTop: '25px',
                        color: '#666',
                        fontSize: '14px'
                    }}>
                        Har du redan ett konto?{' '}
                        <Link href="/login" style={{ color: '#1a1a2e', fontWeight: 'bold' }}>
                            Logga in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
