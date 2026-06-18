import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { CvUpload } from "@/components/profile/cv-upload";
import { ProfileForm } from "@/components/profile/profile-form";

interface ProfileData {
  headline?: string | null;
  summary?: string | null;
  skills?: string[] | null;
  experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }> | null;
  education?: Array<{
    degree: string;
    institution: string;
    year?: number;
  }> | null;
  preferredLocations?: string[] | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
}

async function fetchProfile(userId: string): Promise<ProfileData | null> {
  try {
    const { db } = await import("@/lib/db");
    const { profiles } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const rows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const t = await getTranslations("profile");

  const profile = await fetchProfile(session.user.id);

  const emptyProfile: ProfileData = {
    headline: null,
    summary: null,
    skills: [],
    experience: [],
    education: [],
    preferredLocations: [],
    salaryMin: null,
    salaryMax: null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your profile and resume</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: CV upload */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-base font-semibold text-gray-900">{t("uploadCv")}</h2>
            <p className="text-xs text-gray-500">{t("uploadCvHint")}</p>
            <CvUpload />
          </div>
        </div>

        {/* Right column: Profile form */}
        <div className="lg:col-span-2">
          <ProfileForm profile={profile ?? emptyProfile} />
        </div>
      </div>
    </div>
  );
}
