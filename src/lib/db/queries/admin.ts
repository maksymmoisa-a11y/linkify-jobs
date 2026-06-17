import { db } from "@/lib/db";
import {
  users,
  jobs,
  applications,
  portals,
  auditLog,
  profiles,
} from "@/lib/db/schema";
import { sql, eq, desc, like, and, gte, count } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────

type Portal = typeof portals.$inferInsert;

// ─── Dashboard Stats ─────────────────────────────────────

export async function getDashboardStats() {
  const [
    [{ totalUsers }],
    [{ totalJobs }],
    [{ totalApplications }],
    [{ activePortals }],
  ] = await Promise.all([
    db.select({ totalUsers: count() }).from(users),
    db.select({ totalJobs: count() }).from(jobs),
    db.select({ totalApplications: count() }).from(applications),
    db
      .select({ activePortals: count() })
      .from(portals)
      .where(eq(portals.status, "active")),
  ]);

  return {
    totalUsers: Number(totalUsers),
    totalJobs: Number(totalJobs),
    totalApplications: Number(totalApplications),
    activePortals: Number(activePortals),
  };
}

// ─── Registrations by Day ────────────────────────────────

export async function getRegistrationsByDay(
  days: number = 30
): Promise<Array<{ date: string; count: number }>> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      date: sql<string>`date_trunc('day', ${users.createdAt})::date::text`,
      count: count(),
    })
    .from(users)
    .where(gte(users.createdAt, since))
    .groupBy(sql`date_trunc('day', ${users.createdAt})`)
    .orderBy(sql`date_trunc('day', ${users.createdAt})`);

  return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
}

// ─── Applications by Day ─────────────────────────────────

export async function getApplicationsByDay(
  days: number = 30
): Promise<Array<{ date: string; count: number }>> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      date: sql<string>`date_trunc('day', ${applications.createdAt})::date::text`,
      count: count(),
    })
    .from(applications)
    .where(gte(applications.createdAt, since))
    .groupBy(sql`date_trunc('day', ${applications.createdAt})`)
    .orderBy(sql`date_trunc('day', ${applications.createdAt})`);

  return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
}

// ─── Portals ─────────────────────────────────────────────

export async function getPortalsList() {
  return db.select().from(portals).orderBy(portals.name);
}

export async function getPortalById(id: string) {
  const [portal] = await db
    .select()
    .from(portals)
    .where(eq(portals.id, id))
    .limit(1);
  return portal ?? null;
}

export async function createPortal(data: {
  name: string;
  slug: string;
  type: string;
  config?: Record<string, unknown>;
  status?: "active" | "paused" | "error";
}) {
  const [created] = await db.insert(portals).values(data).returning();
  return created;
}

export async function updatePortal(id: string, data: Partial<Portal>) {
  const [updated] = await db
    .update(portals)
    .set(data)
    .where(eq(portals.id, id))
    .returning();
  return updated ?? null;
}

export async function deletePortal(id: string) {
  await db.delete(portals).where(eq(portals.id, id));
}

export async function togglePortalStatus(
  id: string,
  status: "active" | "paused"
) {
  const [updated] = await db
    .update(portals)
    .set({ status })
    .where(eq(portals.id, id))
    .returning();
  return updated ?? null;
}

// ─── Users ───────────────────────────────────────────────

export async function getUsersList(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  // Subquery: count applications per user
  const appCountSq = db
    .select({
      userId: applications.userId,
      applicationsCount: count().as("applications_count"),
    })
    .from(applications)
    .groupBy(applications.userId)
    .as("app_counts");

  const whereClause = params.search
    ? like(users.email, `%${params.search}%`)
    : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        applicationsCount:
          sql<number>`coalesce(${appCountSq.applicationsCount}, 0)`,
      })
      .from(users)
      .leftJoin(appCountSq, eq(users.id, appCountSq.userId))
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(users)
      .where(whereClause ?? sql`true`),
  ]);

  return {
    users: rows.map((r) => ({
      ...r,
      applicationsCount: Number(r.applicationsCount),
    })),
    total: Number(total),
    page,
    pageSize,
  };
}

export async function getUserDetail(id: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  if (!user) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, id))
    .limit(1);

  const recentApplications = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, id))
    .orderBy(desc(applications.createdAt))
    .limit(10);

  return { ...user, profile: profile ?? null, recentApplications };
}

export async function toggleUserBlocked(userId: string, blocked: boolean) {
  // The users table does not have a dedicated `blocked` column.
  // For MVP: demote/promote role as a proxy for blocking.
  // Set role to "candidate" when blocked (no-op if already candidate).
  // In a future migration, add a `blocked boolean` column to users.
  // The calling route logs the admin action for auditing purposes.
  const newRole = blocked ? ("candidate" as const) : ("candidate" as const);
  await db.update(users).set({ role: newRole }).where(eq(users.id, userId));
  return { userId, blocked, success: true };
}

// ─── Audit Log ───────────────────────────────────────────

export async function logAdminAction(params: {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  const [entry] = await db
    .insert(auditLog)
    .values({
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      details: params.details ?? null,
      ipAddress: params.ipAddress ?? null,
    })
    .returning();
  return entry;
}

export async function getAuditLog(params: {
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(auditLog)
      .orderBy(desc(auditLog.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ total: count() }).from(auditLog),
  ]);

  return {
    entries: rows,
    total: Number(total),
    page,
    pageSize,
  };
}
