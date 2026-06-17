import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { auth } from "@/lib/auth/config";
import { ApplicationStatus } from "@/components/applications/application-status";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

interface ApplicationDetail {
  id: string;
  status: string;
  matchScore: number | null;
  coverLetter: string | null;
  formData: Record<string, unknown> | null;
  appliedAt: Date | null;
  createdAt: Date;
  job: {
    id: string;
    title: string;
    companyName: string | null;
    location: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
  };
}

async function fetchApplication(id: string, userId: string): Promise<ApplicationDetail | null> {
  try {
    const { db } = await import("@/lib/db");
    const { applications, jobs } = await import("@/lib/db/schema");
    const { eq, and } = await import("drizzle-orm");
    const rows = await db
      .select({
        id: applications.id,
        status: applications.status,
        matchScore: applications.matchScore,
        coverLetter: applications.coverLetter,
        formData: applications.formData,
        appliedAt: applications.appliedAt,
        createdAt: applications.createdAt,
        job: {
          id: jobs.id,
          title: jobs.title,
          companyName: jobs.companyName,
          location: jobs.location,
          salaryMin: jobs.salaryMin,
          salaryMax: jobs.salaryMax,
        },
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(and(eq(applications.id, id), eq(applications.userId, userId)))
      .limit(1);
    return (rows[0] as ApplicationDetail) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ApplicationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return {};
  const app = await fetchApplication(id, session.user.id);
  if (!app) return {};
  return {
    title: `Application — ${app.job.title} at ${app.job.companyName}`,
  };
}

const STATUS_ORDER: string[] = ["draft", "prefilled", "submitted", "confirmed", "rejected"];

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const t = await getTranslations("applications");

  const app = await fetchApplication(id, session.user.id);
  if (!app) notFound();

  const currentStatusIndex = STATUS_ORDER.indexOf(app.status);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/applications"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
            clipRule="evenodd"
          />
        </svg>
        My Applications
      </Link>

      {/* Job info card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{app.job.title}</h1>
            <p className="mt-0.5 text-sm text-gray-600">{app.job.companyName}</p>
            {app.job.location && (
              <p className="mt-1 text-xs text-gray-400">{app.job.location}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <ApplicationStatus status={app.status} />
            {app.matchScore != null && (
              <span className="text-xs font-medium text-blue-600">
                {t("matchScore")}: {app.matchScore}%
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-400">
          {t("appliedOn")}:{" "}
          {(app.appliedAt ?? app.createdAt).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Status timeline */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Application Progress</h2>
        <div className="flex items-center gap-0">
          {STATUS_ORDER.filter((s) => s !== "rejected").map((s, i, arr) => {
            const isActive = s === app.status;
            const isPast = STATUS_ORDER.indexOf(s) <= currentStatusIndex && app.status !== "rejected";
            const isLast = i === arr.length - 1;
            return (
              <div key={s} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border-2 transition-colors ${
                      isPast || isActive
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {isPast && !isActive ? (
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={`mt-1 text-xs whitespace-nowrap ${isActive ? "font-semibold text-blue-700" : "text-gray-500"}`}>
                    {t(`status.${s as "draft" | "prefilled" | "submitted" | "confirmed"}`)}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={`h-0.5 flex-1 mx-1 ${
                      STATUS_ORDER.indexOf(s) < currentStatusIndex && app.status !== "rejected"
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {app.status === "rejected" && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {t("status.rejected")}
          </div>
        )}
      </div>

      {/* Cover letter */}
      {app.coverLetter && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Cover Letter</h2>
          <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
            {app.coverLetter}
          </div>
        </div>
      )}

      {/* Form data */}
      {app.formData && Object.keys(app.formData).length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Submitted Data</h2>
          <dl className="divide-y divide-gray-100">
            {Object.entries(app.formData).map(([key, val]) => (
              <div key={key} className="grid grid-cols-3 gap-2 py-2 text-sm">
                <dt className="font-medium capitalize text-gray-600">{key.replace(/_/g, " ")}</dt>
                <dd className="col-span-2 text-gray-900 break-words">{String(val ?? "—")}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* View job link */}
      <Link
        href={`/jobs/${app.job.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
      >
        View Job Posting →
      </Link>
    </div>
  );
}
