import { doublePrecision, integer, pgTable, primaryKey, smallint, timestamp, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar({ length: 255 }).notNull().unique(),
    passwordHash: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    role: varchar({ length: 50 }).notNull().default('user'),
    deletedAt: integer().notNull().default(0),
});

export const spheresTable = pgTable('spheres', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 255 }).notNull(),
    color: varchar({ length: 255 }).notNull(),
    inviteCode: varchar({ length: 255 }).notNull(),
    creatorId: integer().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
});

export const pinsTable = pgTable("pins", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    sphereId: integer().notNull().references(() => spheresTable.id, { onDelete: "cascade" }),
    creatorId: integer().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    lat: doublePrecision().notNull(),
    lng: doublePrecision().notNull(),
    emoji: varchar({ length: 255 }).notNull(),
    body: varchar({ length: 5000 }).notNull(),
    createdAt: doublePrecision().notNull(),
    deletedAt: integer().notNull().default(0),
    likes: integer().notNull().default(0),
    dislikes: integer().notNull().default(0),
});


export const pinVotesTable = pgTable("pin_votes", {
    userId: integer().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    pinId: integer().notNull().references(() => pinsTable.id, { onDelete: "cascade" }),
    value: smallint().notNull(), // 1 = like, -1 = dislike
    createdAt: doublePrecision().notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.pinId] })]);


export const sphereMembersTable = pgTable("sphere_members", {
    userId: integer().references(() => usersTable.id, { onDelete: "cascade" }),
    sphereId: integer().references(() => spheresTable.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.userId, t.sphereId] })]);


export const sessionsTable = pgTable('sessions', {
    id: varchar({ length: 255 }).primaryKey(),
    userId: integer().references(() => usersTable.id, { onDelete: "cascade" }),
    expiresAt: timestamp().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
});

export const reportsTable = pgTable('reports', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    pinId: integer().notNull().references(() => pinsTable.id, { onDelete: "cascade" }),
    reporterId: integer().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    reason: varchar({ length: 500 }).notNull(),
    createdAt: doublePrecision().notNull(),
});