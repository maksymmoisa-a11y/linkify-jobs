import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://linkify-jobs.de";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["de", "en"];

  // Static pages
  const staticPages = ["", "/jobs", "/impressum", "/datenschutz", "/auth"];
  const staticEntries = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === "/jobs" ? "hourly" as const : "weekly" as const,
      priority: page === "" ? 1.0 : page === "/jobs" ? 0.9 : 0.5,
    }))
  );

  // Dynamic job pages — fetch from DB
  let jobEntries: MetadataRoute.Sitemap = [];
  try {
    const { db } = await import("@/lib/db");
    const { jobs } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const activeJobs = await db
      .select({ id: jobs.id, createdAt: jobs.createdAt })
      .from(jobs)
      .where(eq(jobs.isActive, true))
      .limit(50000); // Google sitemap limit

    jobEntries = locales.flatMap((locale) =>
      activeJobs.map((job) => ({
        url: `${BASE_URL}/${locale}/jobs/${job.id}`,
        lastModified: job.createdAt,
        changeFrequency: "daily" as const,
        priority: 0.7,
      }))
    );
  } catch {
    // DB not available — return static only
  }

  return [...staticEntries, ...jobEntries];
}
