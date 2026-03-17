"use server";

import { db } from "@/db";
import { spheresTable } from "@/db/schema";
import { sphereMembersTable } from "@/db/schema";
import { usersTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/sessions/actions";
import { eq } from "drizzle-orm";

function generateInviteCode(length = 6) {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length)
        .toUpperCase();
}

export async function createSphere({
    title,
    color,
}: {
    title: string;
    color: string;
}) {
    const user = await getCurrentUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const inviteCode = generateInviteCode();

    return await db.transaction(async (tx) => {
        const [sphere] = await tx
            .insert(spheresTable)
            .values({
                title,
                color,
                inviteCode,
                creatorId: user.id,
            })
            .returning();

        // auto-join creator
        await tx.insert(sphereMembersTable).values({
            userId: user.id,
            sphereId: sphere.id,
        });

        return sphere;
    });
}

/* -----------------------------
   Join sphere
--------------------------------*/
export async function joinSphere(inviteCode: string) {

    const user = await getCurrentUser();

    if (!user) {
        return ("Not authenticated");
    }

    const sphere = await db.query.spheresTable.findFirst({
        where: eq(spheresTable.inviteCode, inviteCode),
    });

    if (!sphere) {
        return("Invalid invite code");
    }

    await db
        .insert(sphereMembersTable)
        .values({
            userId: user.id,
            sphereId: sphere.id,
        })
        .onConflictDoNothing();

    return sphere;
}


/* -----------------------------
   Get user's spheres
--------------------------------*/
export async function getUserSpheres() {
    const user = await getCurrentUser();

    if (!user) {
        return { error: "Not authenticated" };
    }
    return await db
        .select({
            id: spheresTable.id,
            title: spheresTable.title,
            color: spheresTable.color,
            inviteCode: spheresTable.inviteCode,
            creatorId: spheresTable.creatorId,
        })
        .from(sphereMembersTable)
        .innerJoin(
            spheresTable,
            eq(sphereMembersTable.sphereId, spheresTable.id)
        )
        .where(eq(sphereMembersTable.userId, user.id));
}

