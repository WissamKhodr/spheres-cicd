"use server";

import { db } from "@/db";
import { sphereMembersTable, pinsTable, pinVotesTable, reportsTable, usersTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/sessions/actions";
import { eq, and, sql } from "drizzle-orm";

export async function createPin({
  sphereId,
  lat,
  lng,
  emoji,
  body,
}: {
  sphereId: number;
  lat: number;
  lng: number;
  emoji: string;
  body: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  // verify membership
  const membership = await db.query.sphereMembersTable.findFirst({
    where: and(
      eq(sphereMembersTable.userId, user.id),
      eq(sphereMembersTable.sphereId, sphereId)
    ),
  });

  if (!membership) {
    return { error: "Not a member of this sphere" };
  }

  const [pin] = await db
    .insert(pinsTable)
    .values({
      sphereId,
      creatorId: user.id,
      lat,
      lng,
      emoji,
      body,
      createdAt: Date.now(),
    })
    .returning();

  return pin;
}

export async function getPins(sphereId: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const membership = await db.query.sphereMembersTable.findFirst({
    where: and(
      eq(sphereMembersTable.userId, user.id),
      eq(sphereMembersTable.sphereId, sphereId)
    ),
  });

  if (!membership) return { error: "Not a member of this sphere" };

  const pins = await db
    .select({
      id: pinsTable.id,
      sphereId: pinsTable.sphereId,
      creatorId: pinsTable.creatorId,
      creatorName: usersTable.name,
      lat: pinsTable.lat,
      lng: pinsTable.lng,
      emoji: pinsTable.emoji,
      body: pinsTable.body,
      createdAt: pinsTable.createdAt,

      likes: sql<number>`
        COALESCE(SUM(CASE WHEN ${pinVotesTable.value} = 1 THEN 1 ELSE 0 END), 0)
      `,
      dislikes: sql<number>`
        COALESCE(SUM(CASE WHEN ${pinVotesTable.value} = -1 THEN 1 ELSE 0 END), 0)
      `,

      myVote: sql<number | null>`
        MAX(CASE WHEN ${pinVotesTable.userId} = ${user.id}
        THEN ${pinVotesTable.value} ELSE NULL END)
      `,
    })
    .from(pinsTable)
    .leftJoin(
      pinVotesTable,
      eq(pinVotesTable.pinId, pinsTable.id)
    )
    .leftJoin(
      usersTable,
      eq(usersTable.id, pinsTable.creatorId)
    )
    .where(and(eq(pinsTable.sphereId, sphereId), eq(pinsTable.deletedAt, 0)))
    .groupBy(pinsTable.id, usersTable.name);

  return { pins, currentUserId: user.id };
}

export async function votePin(sphereId: number, pinId: number, value: 1 | -1) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const membership = await db.query.sphereMembersTable.findFirst({
    where: and(
      eq(sphereMembersTable.userId, user.id),
      eq(sphereMembersTable.sphereId, sphereId)
    ),
  });

  if (!membership) return { error: "Not a member of this sphere" };

  await db
    .insert(pinVotesTable)
    .values({
      userId: user.id,
      pinId,
      value,
      createdAt: Date.now()
    })
    .onConflictDoUpdate({
      target: [pinVotesTable.userId, pinVotesTable.pinId],
      set: {
        value,
        createdAt: Date.now()
      },
    });
}

export async function deletePin(pinId: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  // kolla att användaren äger pinnen
  const pin = await db.query.pinsTable.findFirst({
    where: and(eq(pinsTable.id, pinId), eq(pinsTable.deletedAt, 0)),
  });

  if (!pin) return { error: "Pin not found" };
  if (pin.creatorId !== user.id) return { error: "Not your pin" };

  await db.delete(pinsTable).where(eq(pinsTable.id, pinId));
}

export async function reportPin(pinId: number, reason: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  await db.insert(reportsTable).values({
    pinId,
    reporterId: user.id,
    reason,
    createdAt: Date.now(),
  });
}

