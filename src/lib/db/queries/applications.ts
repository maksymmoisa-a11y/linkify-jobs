import { eq, desc, count, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications, jobs } from "@/lib/db/schema";

export type Application = typeof applications.$inferSelect;
export type ApplicationInsert = typeof applications.$inferInsert;

interface CreateApplicationData {
  userId: string;
  jobId: string;
  matchScore?: number;
  coverLetter?: string;
  formData?: Record<string, unknown>;
}

/**
 * Create a new application in draft status.
 */
export async function createApplication(data: CreateApplicationData) {
  const [result] = await db
    .insert(applications)
    .values({
      userId: data.userId,
      jobId: data.jobId,
      status: "draft",
      matchScore: data.matchScore,
      coverLetter: data.coverLetter,
      formData: data.formData,
    })
    .returning();

  return result;
}

/**
 * Get a single application by ID, joined with job data.
 */
export async function getApplicationById(id: string) {
  const result = await db
    .select({
      application: applications,
      job: jobs,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.id, id))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get all applications for a user with pagination.
 */
export async function getApplicationsByUserId(
  userId: string,
  page: number = 1,
  pageSize: number = 20,
  status?: string
) {
  const offset = (page - 1) * pageSize;

  const conditions = status
    ? and(
        eq(applications.userId, userId),
        eq(
          applications.status,
          status as Application["status"]
        )
      )
    : eq(applications.userId, userId);

  const [rows, totalCount] = await Promise.all([
    db
      .select({
        application: applications,
        job: jobs,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(conditions)
      .orderBy(desc(applications.createdAt))
      .limit(pageSize)
      .offset(offset),

    db
      .select({ count: count() })
      .from(applications)
      .where(conditions),
  ]);

  const total = totalCount[0]?.count ?? 0;

  return {
    items: rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Update the status of an application.
 */
export async function updateApplicationStatus(id: string, status: string) {
  const [result] = await db
    .update(applications)
    .set({
      status: status as Application["status"],
      ...(status === "submitted" ? { appliedAt: new Date() } : {}),
    })
    .where(eq(applications.id, id))
    .returning();

  return result ?? null;
}

/**
 * Get application counts grouped by status for a user.
 */
export async function getUserApplicationStats(userId: string) {
  const rows = await db
    .select({
      status: applications.status,
      count: count(),
    })
    .from(applications)
    .where(eq(applications.userId, userId))
    .groupBy(applications.status);

  const stats: Record<string, number> = {
    draft: 0,
    prefilled: 0,
    submitted: 0,
    confirmed: 0,
    rejected: 0,
    total: 0,
  };

  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }

  return stats;
}
