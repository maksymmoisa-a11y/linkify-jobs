import { eq, and, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "@/lib/db/schema";
import type { NormalizedJob } from "./types";

type Db = PostgresJsDatabase<typeof schema>;

/**
 * Build a searchable plain-text blob from a NormalizedJob.
 * Combines title, company, location, description, and requirements
 * so PostgreSQL full-text search covers all relevant fields.
 */
function buildSearchText(job: NormalizedJob): string {
  const parts: string[] = [
    job.title,
    job.companyName,
    job.location ?? "",
    job.description,
    ...(job.requirements ?? []),
    job.companyInfo?.industry ?? "",
    job.companyInfo?.description ?? "",
  ];
  return parts.filter(Boolean).join(" ");
}

/**
 * Bulk upsert a batch of NormalizedJob records into the `jobs` table.
 *
 * - Upserts on (external_id, source_portal) via the unique index
 *   `idx_jobs_external_id_portal` defined in the schema.
 * - Deactivates any previously active jobs from the same portal that
 *   were NOT returned in this sync batch (i.e. they disappeared).
 *
 * @returns Number of rows upserted.
 */
export async function normalizeAndUpsertJobs(
  jobs: NormalizedJob[],
  db: Db
): Promise<number> {
  if (jobs.length === 0) return 0;

  const sourcePortal = jobs[0].sourcePortal;

  // Build insert rows
  const rows = jobs.map((job) => ({
    externalId: job.externalId,
    sourcePortal: job.sourcePortal,
    title: job.title,
    companyName: job.companyName,
    companyInfo: job.companyInfo ?? null,
    location: job.location ?? null,
    remote: job.remote ?? false,
    salaryMin: job.salaryMin ?? null,
    salaryMax: job.salaryMax ?? null,
    salaryCurrency: job.salaryCurrency ?? "EUR",
    description: job.description,
    requirements: job.requirements ?? [],
    applicationFields: job.applicationFields ?? null,
    applicationUrl: job.applicationUrl ?? null,
    matchKeywords: buildSearchText(job),
    expiresAt: job.expiresAt ?? null,
    isActive: true as const,
  }));

  // Upsert in batches of 100 to avoid hitting PostgreSQL parameter limits
  const BATCH_SIZE = 100;
  let upserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    // `target` must reference the columns covered by the unique index
    // idx_jobs_external_id_portal → (external_id, source_portal)
    await db
      .insert(schema.jobs)
      .values(batch)
      .onConflictDoUpdate({
        target: [schema.jobs.externalId, schema.jobs.sourcePortal],
        set: {
          // Use `sql<>` references to the EXCLUDED pseudo-table so Drizzle
          // emits the correct column names without us hard-coding strings.
          title: sql`excluded.title`,
          companyName: sql`excluded.company_name`,
          companyInfo: sql`excluded.company_info`,
          location: sql`excluded.location`,
          remote: sql`excluded.remote`,
          salaryMin: sql`excluded.salary_min`,
          salaryMax: sql`excluded.salary_max`,
          salaryCurrency: sql`excluded.salary_currency`,
          description: sql`excluded.description`,
          requirements: sql`excluded.requirements`,
          applicationFields: sql`excluded.application_fields`,
          applicationUrl: sql`excluded.application_url`,
          matchKeywords: sql`excluded.match_keywords`,
          expiresAt: sql`excluded.expires_at`,
          isActive: sql`true`,
        },
      });

    upserted += batch.length;
  }

  // Skip deactivation during incremental syncs — only deactivate on full portal re-sync
  // This prevents marking jobs as inactive when we only fetch a subset of keywords

  return upserted;
}
