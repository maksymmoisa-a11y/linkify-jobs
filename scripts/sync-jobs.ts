/**
 * Sync jobs from Bundesagentur für Arbeit API into the database.
 * Usage: npx tsx scripts/sync-jobs.ts
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";
import { BundesagenturConnector } from "../src/lib/connectors/bundesagentur";
import { normalizeAndUpsertJobs } from "../src/lib/connectors/normalize";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://linkify:linkify_dev_2024@localhost:5434/linkify_jobs";

async function main() {
  console.log("Connecting to database...");
  const client = postgres(DATABASE_URL, { max: 5 });
  const db = drizzle(client, { schema });

  const connector = new BundesagenturConnector();

  // Search queries to get diverse jobs
  const searches = [
    { keyword: "Software Developer", location: "Berlin" },
    { keyword: "React", location: "München" },
    { keyword: "Python", location: "Hamburg" },
    { keyword: "DevOps", location: "Frankfurt" },
    { keyword: "Data Engineer", location: "Berlin" },
    { keyword: "Projektmanager IT", location: "Köln" },
    { keyword: "Java", location: "Stuttgart" },
    { keyword: "Frontend", location: "Düsseldorf" },
    { keyword: "Backend", location: "Berlin" },
    { keyword: "Fullstack", location: "München" },
  ];

  let totalSynced = 0;

  for (const search of searches) {
    try {
      console.log(`\nSearching: "${search.keyword}" in ${search.location}...`);

      const result = await connector.fetchJobs({
        keyword: search.keyword,
        location: search.location,
        pageSize: 25,
        page: 1,
      });

      console.log(`  Found ${result.total} total, fetched ${result.jobs.length} jobs`);

      if (result.jobs.length > 0) {
        // Fetch details for each job to get full descriptions
        const detailedJobs = [];
        for (const job of result.jobs) {
          try {
            const detail = await connector.getJobDetails(job.externalId);
            if (detail) {
              detailedJobs.push(detail);
            } else {
              detailedJobs.push(job);
            }
          } catch {
            detailedJobs.push(job); // Use basic data if detail fails
          }
        }

        const synced = await normalizeAndUpsertJobs(detailedJobs, db as Parameters<typeof normalizeAndUpsertJobs>[1]);
        console.log(`  Synced ${synced} jobs to database`);
        totalSynced += synced;
      }
    } catch (error) {
      console.error(`  Error syncing "${search.keyword}":`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`\n✓ Done! Total synced: ${totalSynced} jobs`);

  // Also create the portal entry if it doesn't exist
  try {
    const existing = await db.select().from(schema.portals).where(
      require("drizzle-orm").eq(schema.portals.slug, "bundesagentur")
    ).limit(1);

    if (existing.length === 0) {
      await db.insert(schema.portals).values({
        name: "Bundesagentur für Arbeit",
        slug: "bundesagentur",
        type: "api",
        status: "active",
        jobsCount: totalSynced,
        lastSyncAt: new Date(),
      });
      console.log("✓ Created portal entry: Bundesagentur für Arbeit");
    } else {
      const { eq } = require("drizzle-orm");
      await db.update(schema.portals)
        .set({ jobsCount: totalSynced, lastSyncAt: new Date(), status: "active" })
        .where(eq(schema.portals.slug, "bundesagentur"));
      console.log("✓ Updated portal entry");
    }
  } catch (error) {
    console.error("Portal entry error:", error instanceof Error ? error.message : error);
  }

  await client.end();
}

main().catch(console.error);
