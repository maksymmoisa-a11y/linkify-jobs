import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { calculateMatchScore } from "@/lib/ai/match-score";
import { getProfileByUserId } from "@/lib/db/queries/profiles";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  let body: { jobId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { jobId } = body;
  if (!jobId || typeof jobId !== "string") {
    return Response.json({ error: "Missing 'jobId' field" }, { status: 400 });
  }

  // Fetch job
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!job) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  // Fetch profile
  const profileData = await getProfileByUserId(userId);
  if (!profileData) {
    return Response.json({ score: 0 });
  }

  const { profile } = profileData;

  const score = calculateMatchScore(
    {
      skills: profile.skills ?? [],
      experience: profile.experience ?? [],
      preferredLocations: profile.preferredLocations ?? [],
      salaryMin: profile.salaryMin ?? undefined,
      salaryMax: profile.salaryMax ?? undefined,
    },
    {
      requirements: job.requirements ?? [],
      location: job.location ?? undefined,
      remote: job.remote ?? false,
      salaryMin: job.salaryMin ?? undefined,
      salaryMax: job.salaryMax ?? undefined,
      title: job.title,
      description: job.description,
    }
  );

  return Response.json({ score });
}
