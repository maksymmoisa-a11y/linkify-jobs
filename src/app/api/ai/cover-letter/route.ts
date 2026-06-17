import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { generateCoverLetter } from "@/lib/ai/cover-letter";
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

  let body: { jobId?: string; language?: "de" | "en" };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { jobId, language = "en" } = body;

  if (!jobId || typeof jobId !== "string") {
    return Response.json({ error: "Missing 'jobId' field" }, { status: 400 });
  }

  if (language !== "de" && language !== "en") {
    return Response.json(
      { error: "Language must be 'de' or 'en'" },
      { status: 400 }
    );
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
    return Response.json(
      { error: "Profile not found. Please complete your profile first." },
      { status: 404 }
    );
  }

  const { profile, user } = profileData;

  const coverLetter = await generateCoverLetter({
    profile: {
      name: user.name ?? "Candidate",
      headline: profile.headline ?? undefined,
      skills: profile.skills ?? [],
      experience: profile.experience ?? [],
    },
    job: {
      title: job.title,
      companyName: job.companyName,
      companyInfo: job.companyInfo ?? undefined,
      description: job.description,
      requirements: job.requirements ?? [],
    },
    language,
  });

  return Response.json({ coverLetter });
}
