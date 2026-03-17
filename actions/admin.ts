"use server";

import { db } from "@/db";
import { getCurrentUser } from "@/lib/auth/sessions/actions";
import { usersTable, pinsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function adminDeletePin(pinId: number) {
    const admin = await getCurrentUser();
    if (!admin) return { error: "Not authenticated" };
    if (admin.role !== "admin") return { error: "Not authorized" };

    // ta bort pin permanent
    await db.delete(pinsTable).where(eq(pinsTable.id, pinId));

    return { success: true };
}

export async function adminDeleteAccount(userId: number) {
    const admin = await getCurrentUser();
    if (!admin) return { error: "Not authenticated" };
    if (admin.role !== "admin") return { error: "Not authorized" };

    // soft-delete all pins and account for the user, user should be able to be restored
    await db.update(pinsTable).set({ deletedAt: Math.floor(Date.now() / 1000) }).where(eq(pinsTable.creatorId, userId));
    await db.update(usersTable).set({ deletedAt: Math.floor(Date.now() / 1000) }).where(eq(usersTable.id, userId));

    return { success: true };
}

export async function adminBanAccount(userId: number) {
    const admin = await getCurrentUser();
    if (!admin) return { error: "Not authenticated" };
    if (admin.role !== "admin") return { error: "Not authorized" };

    // account is banned, or 30 days since account deletion, delete everything correspondin the account
    await db.delete(pinsTable).where(eq(pinsTable.creatorId, userId));
    await db.delete(usersTable).where(eq(usersTable.id, userId));

    return { success: true };
}

export async function adminRestoreAccount(userId: number) {
    const admin = await getCurrentUser();
    if (!admin) return { error: "Not authenticated" };
    if (admin.role !== "admin") return { error: "Not authorized" };

    // restore user and their pins
    await db.update(usersTable).set({ deletedAt: 0 }).where(eq(usersTable.id, userId));
    await db.update(pinsTable).set({ deletedAt: 0 }).where(eq(pinsTable.creatorId, userId));

    return { success: true };
}

export async function adminMakeAdmin(userId: number) {
    const admin = await getCurrentUser();
    if (!admin) return { error: "Not authenticated" };
    if (admin.role !== "admin") return { error: "Not authorized" };

    await db.update(usersTable).set({ role: 'admin' }).where(eq(usersTable.id, userId));
    return { success: true };
}

export async function adminDemoteAdmin(userId: number) {
    const admin = await getCurrentUser();
    if (!admin) return { error: "Not authenticated" };
    if (admin.role !== "admin") return { error: "Not authorized" };

    await db.update(usersTable).set({ role: 'user' }).where(eq(usersTable.id, userId));
    return { success: true };
}
