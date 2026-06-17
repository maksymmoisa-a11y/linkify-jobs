import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import {
  createApplication,
  getApplicationsByUserId,
} from "@/lib/db/queries/applications";
import { calculateMatchScore } from "@/lib/ai/match-score";
import { getProfileByUserId } from "@/lib/db/queries/profiles";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";

// POST /api/applications — create a new application
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  let body: {
    jobId?: string;
    coverLetter?: string;
    formData?: Record<string, unknown>;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { jobId, coverLetter, formData } = body;

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

  // Calculate match score from profile
  let matchScore: number | undefined;
  const profileData = await getProfileByUserId(userId);
  if (profileData) {
    const { profile } = profileData;
    matchScore = calculateMatchScore(
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
  }

  const application = await createApplication({
    userId,
    jobId,
    matchScore,
    coverLetter,
    formData,
  });

  return Response.json({ application }, { status: 201 });
}

// GET /api/applications — list user's applications (paginated)
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10))
  );
  const status = searchParams.get("status") ?? undefined;

  const result = await getApplicationsByUserId(userId, page, pageSize, status);

  return Response.json(result);
}
