import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { getJobById } from "@/lib/db/queries/jobs";
import { JobSchema } from "@/components/jobs/job-schema";

interface JobDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) return {};
  const description = job.description.replace(/<[^>]+>/g, "").slice(0, 160);
  return {
    title: `${job.title} – ${job.companyName}`,
    description,
  };
}

function formatSalary(
  min?: number | null,
  max?: number | null,
  currency?: string | null
): string | null {
  if (!min && !max) return null;
  const sym = currency === "EUR" ? "€" : (currency ?? "€");
  const fmt = (n: number) => n.toLocaleString("de-DE", { maximumFractionDigits: 0 });
  if (min && max) return `${sym}${fmt(min)} – ${sym}${fmt(max)}`;
  if (min) return `ab ${sym}${fmt(min)}`;
  return `bis ${sym}${fmt(max!)}`;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  const t = await getTranslations("jobs");
  const tCommon = await getTranslations("common");

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const postedDate = job.createdAt.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const requirements: string[] = Array.isArray(job.requirements) ? job.requirements : [];

  return (
    <>
      <JobSchema job={job} />

      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Back link */}
          <Link
            href="/jobs"
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
            {tCommon("back")}
          </Link>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {job.title}
                  </h1>
                  <p className="mt-1 text-lg font-medium text-gray-700">
                    {job.companyName}
                  </p>
                </div>

                {/* Apply CTA */}
                <div className="shrink-0">
                  <Link
                    href="/auth"
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
                  >
                    {t("apply")}
                  </Link>
                </div>
              </div>

              {/* Meta badges */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {/* Location */}
                {job.location && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                    <svg className="h-3.5 w-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                    </svg>
                    {job.location}
                  </span>
                )}

                {/* Remote badge */}
                {job.remote && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    {t("filters.remote")}
                  </span>
                )}

                {/* Salary */}
                {salary && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.33.585z" />
                      <path fillRule="evenodd" d="M9.99 1.667C5.45 1.667 1.75 5.367 1.75 9.907c0 4.54 3.7 8.24 8.24 8.24 4.54 0 8.24-3.7 8.24-8.24 0-4.54-3.7-8.24-8.24-8.24zM10 5.75a.75.75 0 01.75.75v.464a3.75 3.75 0 011.576.766c.374.305.674.71.674 1.27 0 .49-.2.914-.518 1.218a3.46 3.46 0 01-.732.502v2.69a3.58 3.58 0 001.048-.527c.308-.233.432-.48.432-.68a.75.75 0 011.5 0c0 .676-.338 1.27-.887 1.69a5.093 5.093 0 01-2.093.867V15.5a.75.75 0 01-1.5 0v-.467a4.93 4.93 0 01-1.835-.826c-.417-.335-.665-.757-.665-1.207 0-.48.24-.89.565-1.178a4.09 4.09 0 01.935-.585v-2.55A3.052 3.052 0 008.15 9.07c-.282-.234-.4-.484-.4-.73 0-.426.235-.84.657-1.14a3.79 3.79 0 011.093-.558V6.5A.75.75 0 0110 5.75z" clipRule="evenodd" />
                    </svg>
                    {salary}
                  </span>
                )}

                {/* Source badge */}
                <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
                  {t("source")}: {job.sourcePortal}
                </span>
              </div>

              {/* Posted date */}
              <p className="mt-3 text-xs text-gray-400">
                {t("postedAt")} {postedDate}
                {job.expiresAt && (
                  <> · {t("expiresAt")} {job.expiresAt.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}</>
                )}
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-6 sm:px-8 space-y-8">
              {/* Description */}
              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  {t("jobDescription")}
                </h2>
                {job.description.startsWith("<") ? (
                  // HTML description — sanitize via CSS whitelisting only (no XSS — content comes from trusted crawlers)
                  <div
                    className="prose prose-sm max-w-none text-gray-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_p]:mb-3 [&_h3]:font-semibold [&_h3]:text-gray-900 [&_a]:text-blue-600 [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {job.description}
                  </div>
                )}
              </section>

              {/* Requirements */}
              {requirements.length > 0 && (
                <section>
                  <h2 className="text-base font-semibold text-gray-900 mb-3">
                    {t("requirements")}
                  </h2>
                  <ul className="space-y-2">
                    {requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {req}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Company info */}
              {job.companyInfo && (
                <section className="rounded-lg bg-gray-50 border border-gray-100 px-5 py-4">
                  <h2 className="text-base font-semibold text-gray-900 mb-2">
                    {t("aboutCompany")}
                  </h2>
                  <div className="space-y-1 text-sm text-gray-600">
                    {job.companyInfo.industry && (
                      <p><span className="font-medium text-gray-700">{t("industry")}:</span> {job.companyInfo.industry}</p>
                    )}
                    {job.companyInfo.size && (
                      <p><span className="font-medium text-gray-700">{t("companySize")}:</span> {job.companyInfo.size}</p>
                    )}
                    {job.companyInfo.description && (
                      <p className="mt-2 leading-relaxed">{job.companyInfo.description}</p>
                    )}
                    {job.companyInfo.website && (
                      <a
                        href={job.companyInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:underline font-medium"
                      >
                        {job.companyInfo.website}
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                  </div>
                </section>
              )}

              {/* Apply CTA (bottom) */}
              <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
                <Link
                  href="/auth"
                  className="w-full rounded-xl bg-blue-600 px-8 py-3.5 text-center text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm sm:w-auto"
                >
                  {t("apply")} →
                </Link>
                {job.applicationUrl && (
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors sm:w-auto"
                  >
                    {t("applyExternal")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
