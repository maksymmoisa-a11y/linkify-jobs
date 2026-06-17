import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { auth } from "@/lib/auth/config";
import { ApplicationForm } from "@/components/applications/application-form";

interface ApplyPageProps {
  params: Promise<{ id: string; locale: string }>;
}

async function fetchJob(id: string) {
  try {
    const { db } = await import("@/lib/db");
    const { jobs } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const rows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchProfile(userId: string) {
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

export async function generateMetadata({ params }: ApplyPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchJob(id);
  if (!job) return {};
  return {
    title: `Apply — ${job.title} at ${job.companyName}`,
    description: `Apply for ${job.title} at ${job.companyName} via Linkify Jobs.`,
  };
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const t = await getTranslations("applications");
  const tCommon = await getTranslations("common");

  const job = await fetchJob(id);
  if (!job) notFound();

  const profile = await fetchProfile(session.user.id);

  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    phone: null,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Link
          href={`/jobs/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-6"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          {t("backToJob")}
        </Link>

        {/* Header */}
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm mb-6">
          <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
          <p className="mt-0.5 text-sm text-gray-600">{job.companyName}</p>
          {job.location && (
            <p className="mt-1 text-xs text-gray-400">{job.location}</p>
          )}
        </div>

        {/* Application form */}
        <ApplicationForm
          job={{
            id: job.id,
            title: job.title,
            companyName: job.companyName ?? "",
            applicationFields: job.applicationFields ?? undefined,
          }}
          profile={profile}
          user={user}
        />
      </div>
    </div>
  );
}
