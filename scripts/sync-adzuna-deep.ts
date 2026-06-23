/**
 * Deep sync from Adzuna — multiple pages per keyword.
 * Usage: ADZUNA_APP_ID=xxx ADZUNA_APP_KEY=yyy npx tsx scripts/sync-adzuna-deep.ts
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import { AdzunaConnector } from "../src/lib/connectors/adzuna";
import { normalizeAndUpsertJobs } from "../src/lib/connectors/normalize";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://linkify:linkify_dev_2024@localhost:5434/linkify_jobs";
const PAGES_PER_KEYWORD = 10; // 10 pages × 50 = 500 per keyword

async function main() {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
    console.error("❌ Set ADZUNA_APP_ID and ADZUNA_APP_KEY");
    process.exit(1);
  }

  const client = postgres(DATABASE_URL, { max: 5 });
  const db = drizzle(client, { schema });
  const connector = new AdzunaConnector();

  const searches = [
    "Software Developer", "React", "Python", "DevOps", "Data Engineer",
    "Java", "Projektmanager", "Frontend", "Backend", "Cloud",
    "Machine Learning", "QA Engineer", "Product Owner", "Security",
    "Fullstack", "Mobile Developer", "SAP", "Scrum Master",
    "IT Consultant", "Data Scientist", "Kubernetes", "AWS",
    "Angular", "Vue.js", "Node.js", "PHP", "C#", ".NET",
    "Systemadministrator", "Netzwerk", "Datenbank", "UI UX Designer",
    "Webentwickler", "Softwarearchitekt", "Teamleiter IT",
  ];

  let totalSynced = 0;
  const seenIds = new Set<string>();

  for (const keyword of searches) {
    console.log(`\n🔍 "${keyword}"...`);

    for (let page = 1; page <= PAGES_PER_KEYWORD; page++) {
      try {
        const result = await connector.fetchJobs({
          keyword,
          pageSize: 50,
          page,
        });

        if (result.jobs.length === 0) {
          console.log(`   Page ${page}: no more results`);
          break;
        }

        const newJobs = result.jobs.filter((j) => {
          if (seenIds.has(j.externalId)) return false;
          seenIds.add(j.externalId);
          return true;
        });

        if (newJobs.length === 0) {
          console.log(`   Page ${page}: all duplicates, skipping rest`);
          break;
        }

        const synced = await normalizeAndUpsertJobs(
          newJobs,
          db as Parameters<typeof normalizeAndUpsertJobs>[1]
        );
        totalSynced += synced;

        console.log(`   Page ${page}: ${newJobs.length} new → ${synced} synced (total: ${totalSynced})`);

        // Rate limit: 500ms between requests
        await new Promise((r) => setTimeout(r, 500));
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("429") || msg.includes("503")) {
          console.log(`   Page ${page}: rate limited, waiting 5s...`);
          await new Promise((r) => setTimeout(r, 5000));
          page--; // retry
        } else {
          console.error(`   Page ${page}: ❌ ${msg}`);
          break;
        }
      }
    }
  }

  // Update portal
  const existing = await db.select().from(schema.portals).where(eq(schema.portals.slug, "adzuna")).limit(1);
  const totalAdzuna = await db.select({ count: require("drizzle-orm").sql<number>`cast(count(*) as int)` }).from(schema.jobs).where(eq(schema.jobs.sourcePortal, "adzuna"));

  if (existing.length > 0) {
    await db.update(schema.portals)
      .set({ jobsCount: totalAdzuna[0]?.count ?? totalSynced, lastSyncAt: new Date(), status: "active" })
      .where(eq(schema.portals.slug, "adzuna"));
  }

  console.log(`\n🎉 Done! Synced ${totalSynced} new jobs. Total unique seen: ${seenIds.size}`);
  await client.end();
}

main().catch(console.error);
