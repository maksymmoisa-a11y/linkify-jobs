import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { ApplicationStatus } from "@/components/applications/application-status";

interface ApplicationRow {
  id: string;
  status: string;
  matchScore: number | null;
  appliedAt: Date | null;
  createdAt: Date;
  job: {
    id: string;
    title: string;
    companyName: string | null;
    location: string | null;
  };
}

async function fetchApplications(userId: string): Promise<ApplicationRow[]> {
  try {
    const { db } = await import("@/lib/db");
    const { applications, jobs } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const rows = await db
      .select({
        id: applications.id,
        status: applications.status,
        matchScore: applications.matchScore,
        appliedAt: applications.appliedAt,
        createdAt: applications.createdAt,
        job: {
          id: jobs.id,
          title: jobs.title,
          companyName: jobs.companyName,
          location: jobs.location,
        },
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.userId, userId))
      .orderBy(applications.createdAt);
    return rows as ApplicationRow[];
  } catch {
    return [];
  }
}

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const t = await getTranslations("applications");

  const items = await fetchApplications(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {items.length} application{items.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <p className="mt-4 text-sm font-medium text-gray-600">{t("noApplications")}</p>
          <Link
            href="/jobs"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Desktop table */}
          <table className="hidden w-full divide-y divide-gray-100 sm:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Job
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("matchScore")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("appliedOn")}
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{app.job.title}</p>
                    <p className="text-xs text-gray-500">{app.job.companyName}</p>
                  </td>
                  <td className="px-4 py-4">
                    <ApplicationStatus status={app.status} />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-blue-600">
                    {app.matchScore != null ? `${app.matchScore}%` : "—"}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500">
                    {(app.appliedAt ?? app.createdAt).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/applications/${app.id}`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile card list */}
          <ul className="divide-y divide-gray-100 sm:hidden">
            {items.map((app) => (
              <li key={app.id}>
                <Link
                  href={`/applications/${app.id}`}
                  className="flex flex-col gap-2 px-4 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{app.job.title}</p>
                      <p className="text-xs text-gray-500">{app.job.companyName}</p>
                    </div>
                    <ApplicationStatus status={app.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {t("matchScore")}: {app.matchScore != null ? `${app.matchScore}%` : "—"}
                    </span>
                    <span>
                      {(app.appliedAt ?? app.createdAt).toLocaleDateString("de-DE")}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
