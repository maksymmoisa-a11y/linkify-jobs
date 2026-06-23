/**
 * Sync jobs from Adzuna API into the database.
 * Usage: ADZUNA_APP_ID=xxx ADZUNA_APP_KEY=yyy npx tsx scripts/sync-adzuna.ts
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import { AdzunaConnector } from "../src/lib/connectors/adzuna";
import { normalizeAndUpsertJobs } from "../src/lib/connectors/normalize";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://linkify:linkify_dev_2024@localhost:5434/linkify_jobs";

async function main() {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
    console.error("❌ Set ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables");
    console.error("   Register at: https://developer.adzuna.com/signup");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const client = postgres(DATABASE_URL, { max: 5 });
  const db = drizzle(client, { schema });
  const connector = new AdzunaConnector();

  // Diverse searches to get broad coverage
  const searches = [
    { keyword: "Software Developer" },
    { keyword: "React" },
    { keyword: "Python" },
    { keyword: "DevOps" },
    { keyword: "Data Engineer" },
    { keyword: "Java" },
    { keyword: "Projektmanager" },
    { keyword: "Frontend" },
    { keyword: "Backend" },
    { keyword: "Cloud" },
    { keyword: "Machine Learning" },
    { keyword: "QA Engineer" },
    { keyword: "Product Owner" },
    { keyword: "Security" },
    { keyword: "Fullstack" },
    { keyword: "Mobile Developer" },
    { keyword: "SAP" },
    { keyword: "Scrum Master" },
    { keyword: "IT Consultant" },
    { keyword: "Data Scientist" },
  ];

  let totalSynced = 0;
  const seenIds = new Set<string>();

  for (const search of searches) {
    try {
      console.log(`\n🔍 "${search.keyword}"...`);

      // Fetch page 1 (50 results)
      const result = await connector.fetchJobs({
        keyword: search.keyword,
        pageSize: 50,
        page: 1,
      });

      // Deduplicate across searches
      const newJobs = result.jobs.filter((j) => {
        if (seenIds.has(j.externalId)) return false;
        seenIds.add(j.externalId);
        return true;
      });

      console.log(`   Found ${result.total} total, fetched ${result.jobs.length}, ${newJobs.length} new`);

      if (newJobs.length > 0) {
        const synced = await normalizeAndUpsertJobs(
          newJobs,
          db as Parameters<typeof normalizeAndUpsertJobs>[1]
        );
        console.log(`   ✓ Synced ${synced} jobs`);
        totalSynced += synced;
      }

      // Small delay between requests to be polite
      await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Update portal entry
  const existing = await db.select().from(schema.portals).where(eq(schema.portals.slug, "adzuna")).limit(1);
  if (existing.length === 0) {
    await db.insert(schema.portals).values({
      name: "Adzuna",
      slug: "adzuna",
      type: "api",
      status: "active",
      jobsCount: totalSynced,
      lastSyncAt: new Date(),
    });
    console.log("\n✓ Created portal: Adzuna");
  } else {
    await db.update(schema.portals)
      .set({
        jobsCount: totalSynced,
        lastSyncAt: new Date(),
        status: "active",
      })
      .where(eq(schema.portals.slug, "adzuna"));
    console.log("\n✓ Updated portal: Adzuna");
  }

  console.log(`\n🎉 Done! Total synced: ${totalSynced} unique jobs from Adzuna`);
  await client.end();
}

main().catch(console.error);
