import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { searchJobs } from "@/lib/db/queries/jobs";
import { JobCard } from "@/components/jobs/job-card";
import { JobSearchBar } from "@/components/jobs/job-search-bar";
import { JobFilters } from "@/components/jobs/job-filters";

const PAGE_SIZE = 20;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("jobs");
  const tCommon = await getTranslations("common");
  return {
    title: `${t("title")} – ${tCommon("appName")}`,
    description: t("metaDescription"),
  };
}

interface JobsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function getNumber(v: string | string[] | undefined): number | undefined {
  const s = getString(v);
  if (!s) return undefined;
  const n = Number(s);
  return isNaN(n) ? undefined : n;
}

export default async function JobsPage({ params: paramsPromise, searchParams }: JobsPageProps) {
  const { locale } = await paramsPromise;
  const params = await searchParams;
  const t = await getTranslations("jobs");
  const tCommon = await getTranslations("common");

  const query = getString(params.q);
  const location = getString(params.location);
  const salaryMin = getNumber(params.salaryMin);
  const salaryMax = getNumber(params.salaryMax);
  const remote = getString(params.remote) === "1";
  const matchMin = getNumber(params.matchMin);
  const page = Math.max(1, getNumber(params.page) ?? 1);

  const result = await searchJobs({
    q: query,
    location,
    salaryMin,
    salaryMax,
    remote,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.ceil(result.total / PAGE_SIZE);

  // Build URL for pagination links
  function buildPageUrl(p: number) {
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (location) sp.set("location", location);
    if (salaryMin !== undefined) sp.set("salaryMin", String(salaryMin));
    if (salaryMax !== undefined) sp.set("salaryMax", String(salaryMax));
    if (remote) sp.set("remote", "1");
    if (matchMin !== undefined) sp.set("matchMin", String(matchMin));
    sp.set("page", String(p));
    const qs = sp.toString();
    return `/jobs${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top search bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">{t("title")}</h1>
          <JobSearchBar initialQuery={query} initialLocation={location} locale={locale} />
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Filters sidebar */}
          <div className="w-full shrink-0 lg:w-64 xl:w-72">
            <JobFilters
              locale={locale}
              initialQuery={query}
              initialLocation={location}
              initialSalaryMin={salaryMin}
              initialSalaryMax={salaryMax}
              initialRemote={remote}
            />
          </div>

          {/* Results */}
          <div className="min-w-0 flex-1">
            {/* Result count */}
            <p className="mb-4 text-sm text-gray-500">
              {result.total === 0
                ? tCommon("noResults")
                : t("resultCount", { count: result.total })}
            </p>

            {result.jobs.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
                <svg
                  className="mx-auto h-12 w-12 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                  />
                </svg>
                <h2 className="mt-4 text-base font-semibold text-gray-900">
                  {tCommon("noResults")}
                </h2>
                <p className="mt-2 text-sm text-gray-500">{t("noResultsHint")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
                {result.jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    companyName={job.companyName}
                    location={job.location}
                    salaryMin={job.salaryMin}
                    salaryMax={job.salaryMax}
                    salaryCurrency={job.salaryCurrency}
                    sourcePortal={job.sourcePortal}
                    createdAt={job.createdAt}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                className="mt-8 flex items-center justify-between"
                aria-label="Pagination"
              >
                {page > 1 ? (
                  <Link
                    href={buildPageUrl(page - 1)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    ← {tCommon("back")}
                  </Link>
                ) : (
                  <span />
                )}

                <span className="text-sm text-gray-500">
                  {page} / {totalPages}
                </span>

                {page < totalPages ? (
                  <Link
                    href={buildPageUrl(page + 1)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    {tCommon("next")} →
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
