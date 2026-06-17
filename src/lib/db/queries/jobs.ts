import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { and, desc, eq, gte, ilike, lt, lte, or, sql } from "drizzle-orm";

export type Job = typeof jobs.$inferSelect;

export interface SearchJobsParams {
  q?: string;
  /** @deprecated Use `q` instead */
  query?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  remote?: boolean;
  page?: number;
  pageSize?: number;
}

export interface SearchJobsResult {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
}

export interface JobStats {
  total: number;
  active: number;
  byPortal: Record<string, number>;
}

/**
 * Full-text search with optional filters.
 *
 * When a keyword (`q`) is provided, uses PostgreSQL
 * `to_tsvector('german', ...)` + `to_tsquery('german', ...)` with
 * prefix matching for autocomplete-style queries, ordered by ts_rank.
 * Falls back to recency ordering when no keyword is given.
 */
export async function searchJobs(
  params: SearchJobsParams
): Promise<SearchJobsResult> {
  // Support both `q` and legacy `query` parameter
  const keyword = (params.q ?? params.query ?? "").trim();

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const offset = (page - 1) * pageSize;

  const conditions = [eq(jobs.isActive, true)];

  // Full-text search using German dictionary + prefix matching
  if (keyword) {
    // Build tsquery: each word gets :* suffix for prefix matching, joined with &
    const tsQuery = keyword
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.replace(/[^a-zA-ZäöüÄÖÜß0-9\-]/g, "") + ":*")
      .filter((w) => w.length > 1)
      .join(" & ");

    if (tsQuery) {
      conditions.push(
        sql`to_tsvector('german',
              coalesce(${jobs.matchKeywords}, '') || ' ' ||
              coalesce(${jobs.title}, '') || ' ' ||
              coalesce(${jobs.companyName}, '')
            ) @@ to_tsquery('german', ${tsQuery})`
      );
    } else {
      // Fallback to ILIKE if tsquery sanitization removed everything
      conditions.push(
        or(
          ilike(jobs.title, `%${keyword}%`),
          ilike(jobs.companyName, `%${keyword}%`)
        )!
      );
    }
  }

  if (params.location) {
    conditions.push(ilike(jobs.location, `%${params.location}%`));
  }

  if (params.remote !== undefined) {
    conditions.push(eq(jobs.remote, params.remote));
  }

  if (params.salaryMin !== undefined) {
    conditions.push(
      or(
        gte(jobs.salaryMax, params.salaryMin),
        gte(jobs.salaryMin, params.salaryMin)
      )!
    );
  }

  if (params.salaryMax !== undefined) {
    conditions.push(lte(jobs.salaryMin, params.salaryMax));
  }

  const where = and(...conditions);

  // Order by relevance when keyword present, otherwise newest first
  const orderBy = keyword
    ? sql`ts_rank(
        to_tsvector('german',
          coalesce(${jobs.matchKeywords}, '') || ' ' ||
          coalesce(${jobs.title}, '') || ' ' ||
          coalesce(${jobs.companyName}, '')
        ),
        to_tsquery('german', ${
          keyword
            .split(/\s+/)
            .filter(Boolean)
            .map((w) => w.replace(/[^a-zA-ZäöüÄÖÜß0-9\-]/g, "") + ":*")
            .filter((w) => w.length > 1)
            .join(" & ") || "''"
        })
      ) desc, ${jobs.createdAt} desc`
    : desc(jobs.createdAt);

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(jobs)
      .where(where)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(jobs)
      .where(where),
  ]);

  return {
    jobs: rows,
    total: countResult[0]?.count ?? 0,
    page,
    pageSize,
  };
}

/** Fetch a single job by its UUID primary key. */
export async function getJobById(id: string): Promise<Job | null> {
  const rows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Aggregate stats: total jobs, active jobs, count per source portal. */
export async function getJobStats(): Promise<JobStats> {
  const [totalRow, activeRow, portalRows] = await Promise.all([
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(jobs),

    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(jobs)
      .where(eq(jobs.isActive, true)),

    db
      .select({
        portal: jobs.sourcePortal,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(jobs)
      .groupBy(jobs.sourcePortal),
  ]);

  const byPortal: Record<string, number> = {};
  for (const row of portalRows) {
    byPortal[row.portal] = row.count;
  }

  return {
    total: totalRow[0]?.count ?? 0,
    active: activeRow[0]?.count ?? 0,
    byPortal,
  };
}

/**
 * Set `is_active = false` on jobs whose `expires_at` is in the past.
 * Returns the number of rows updated (may be 0 if driver doesn't expose rowCount).
 */
export async function deactivateExpiredJobs(): Promise<number> {
  const result = await db
    .update(jobs)
    .set({ isActive: false })
    .where(and(eq(jobs.isActive, true), lt(jobs.expiresAt, new Date())));

  return (result as unknown as { rowCount?: number }).rowCount ?? 0;
}
