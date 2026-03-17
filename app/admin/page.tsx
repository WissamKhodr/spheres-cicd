import { db } from '@/db';
import { usersTable, spheresTable, reportsTable, pinsTable } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth/sessions/actions';
import { redirect } from 'next/navigation';
import { adminDeletePin, adminDeleteAccount, adminBanAccount, adminRestoreAccount, adminMakeAdmin, adminDemoteAdmin } from '@/actions/admin';

export const dynamic = 'force-dynamic';

// Server action: delete pin (hard)
async function handleDeletePin(formData: FormData) {
    'use server';
    const pinId = Number(formData.get('pinId'));
    if (!pinId) return;
    await adminDeletePin(pinId);
}

// Server action: delete account (soft)
async function handleDeleteAccount(formData: FormData) {
    'use server';
    const userId = Number(formData.get('userId'));
    if (!userId) return;
    await adminDeleteAccount(userId);
}

// Server action: ban account (hard)
async function handleBanAccount(formData: FormData) {
    'use server';
    const userId = Number(formData.get('userId'));
    if (!userId) return;
    await adminBanAccount(userId);
}

// Server action: restore account (undo soft-delete)
async function handleRestoreAccount(formData: FormData) {
    'use server';
    const userId = Number(formData.get('userId'));
    if (!userId) return;
    await adminRestoreAccount(userId);
}

// Server action: make admin
async function handleMakeAdmin(formData: FormData) {
    'use server';
    const userId = Number(formData.get('userId'));
    if (!userId) return;
    await adminMakeAdmin(userId);
}

// Server action: demote admin to user
async function handleDemoteAdmin(formData: FormData) {
    'use server';
    const userId = Number(formData.get('userId'));
    if (!userId) return;
    await adminDemoteAdmin(userId);
}

export default async function Dev() {
    const me = await getCurrentUser();
    if (!me || me.role !== 'admin') redirect('/');

    const users = await db.select({ username: usersTable.username, id: usersTable.id, deletedAt: usersTable.deletedAt, role: usersTable.role }).from(usersTable);
    const reports = await db.select().from(reportsTable);
    const spheres = await db.select().from(spheresTable);
    const pins = await db.select().from(pinsTable);

    return (
        <div>
            <h1>Admin</h1>

            <h2>Användare</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        {user.deletedAt ? '(Deleted) ' : ''} Användarnamn: {user.username} - ID: {user.id} - Role: {user.role} {' '}
                        <form action={handleDeleteAccount} method="post" style={{ display: 'inline' }}>
                            <input type="hidden" name="userId" value={String(user.id)} />
                            <button type="submit">Delete Account (soft)</button>
                        </form>
                        {' '}
                        <form action={handleBanAccount} method="post" style={{ display: 'inline', marginLeft: 8 }}>
                            <input type="hidden" name="userId" value={String(user.id)} />
                            <button type="submit">Ban Account (hard)</button>
                        </form>
                        {' '}
                        {user.deletedAt ? (
                            <form action={handleRestoreAccount} method="post" style={{ display: 'inline', marginLeft: 8 }}>
                                <input type="hidden" name="userId" value={String(user.id)} />
                                <button type="submit">Restore Account</button>
                            </form>
                        ) : null}
                        {' '}
                        {!user.deletedAt && user.role !== 'admin' ? (
                            <form action={handleMakeAdmin} method="post" style={{ display: 'inline', marginLeft: 8 }}>
                                <input type="hidden" name="userId" value={String(user.id)} />
                                <button type="submit">Make Admin</button>
                            </form>
                        ) : null}
                        {!user.deletedAt && user.role === 'admin' ? (
                            <form action={handleDemoteAdmin} method="post" style={{ display: 'inline', marginLeft: 8 }}>
                                <input type="hidden" name="userId" value={String(user.id)} />
                                <button type="submit">Demote to User</button>
                            </form>
                        ) : null}
                    </li>
                ))}
            </ul>

            <h2>Spheres</h2>
            <ul>
                {spheres.map((sphere) => (
                    <li key={sphere.id}>
                        Sphere ID: {sphere.id} - Title: {sphere.title} - Color: {sphere.color} - Invite Code: {sphere.inviteCode} - Creator ID: {sphere.creatorId} ({users.find((u) => u.id === sphere.creatorId)?.username})
                    </li>
                ))}
            </ul>

            <h2>Pins</h2>
            <ul>
                {pins.map((pin) => (
                    <li key={pin.id}>
                        {pin.deletedAt ? '(Deleted) ' : ''}
                        Pin ID: {pin.id} - Sphere ID: {pin.sphereId} ({spheres.find((s) => s.id === pin.sphereId)?.title}) - Creator ID: {pin.creatorId} ({users.find((u) => u.id === pin.creatorId)?.username}) - Lat: {pin.lat} - Lng: {pin.lng} - Emoji: {pin.emoji} - Body: {pin.body} {' '}
                        <form action={handleDeletePin} method="post" style={{ display: 'inline' }}>
                            <input type="hidden" name="pinId" value={String(pin.id)} />
                            <button type="submit">Delete Pin (admin)</button>
                        </form>
                    </li>
                ))}
            </ul>

            <h2>Rapporter</h2>
            <ul>
                {reports.map((report) => (
                    <li key={report.id}>
                        Rapport ID: {report.id} - Pin ID: {report.pinId} ({pins.find((pin) => pin.id === report.pinId)?.body}) - Reporter ID: {report.reporterId} ({users.find((u) => u.id === report.reporterId)?.username}) - Orsak: {report.reason}
                    </li>
                ))}
            </ul>
        </div>
    );
}
