import { auth } from "@/lib/auth/config";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await import("@/lib/db");
    const { users, profiles, applications, jobs } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const userId = session.user.id;

    // Fetch all user data
    const [userData] = await db.select().from(users).where(eq(users.id, userId));
    const [profileData] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    const applicationsData = await db
      .select({
        id: applications.id,
        status: applications.status,
        coverLetter: applications.coverLetter,
        matchScore: applications.matchScore,
        appliedAt: applications.appliedAt,
        createdAt: applications.createdAt,
        jobTitle: jobs.title,
        jobCompany: jobs.companyName,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.userId, userId));

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: userData ? {
        email: userData.email,
        name: userData.name,
        createdAt: userData.createdAt,
      } : null,
      profile: profileData ? {
        headline: profileData.headline,
        summary: profileData.summary,
        skills: profileData.skills,
        experience: profileData.experience,
        education: profileData.education,
        preferredLocations: profileData.preferredLocations,
        salaryMin: profileData.salaryMin,
        salaryMax: profileData.salaryMax,
      } : null,
      applications: applicationsData,
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="linkify-jobs-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    return Response.json({ error: "Failed to export data" }, { status: 500 });
  }
}
