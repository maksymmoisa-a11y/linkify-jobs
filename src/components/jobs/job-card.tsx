"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";

export interface JobCardProps {
  id: string;
  title: string;
  companyName: string;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  sourcePortal: string;
  createdAt: Date;
  matchScore?: number | null;
}

function formatSalary(
  min?: number | null,
  max?: number | null,
  currency?: string | null
): string | null {
  if (!min && !max) return null;
  const sym = currency === "EUR" ? "€" : (currency ?? "€");
  const fmt = (n: number) =>
    n.toLocaleString("de-DE", { maximumFractionDigits: 0 });
  if (min && max) return `${sym}${fmt(min)} – ${sym}${fmt(max)}`;
  if (min) return `ab ${sym}${fmt(min)}`;
  return `bis ${sym}${fmt(max!)}`;
}

function matchScoreColor(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-800";
  if (score >= 50) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wochen`;
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}

export function JobCard({
  id,
  title,
  companyName,
  location,
  salaryMin,
  salaryMax,
  salaryCurrency,
  sourcePortal,
  createdAt,
  matchScore,
}: JobCardProps) {
  const t = useTranslations("jobs");
  const salary = formatSalary(salaryMin, salaryMax, salaryCurrency);

  return (
    <Link
      href={`/jobs/${id}`}
      className="group block rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-150"
    >
      {/* Header row: title + match score */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
          {title}
        </h3>
        {matchScore != null && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${matchScoreColor(matchScore)}`}
            title={t("matchScore")}
          >
            {matchScore}%
          </span>
        )}
      </div>

      {/* Company */}
      <p className="mt-1 text-sm font-medium text-gray-700">{companyName}</p>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500">
        {/* Location */}
        {location && (
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                clipRule="evenodd"
              />
            </svg>
            {location}
          </span>
        )}

        {/* Salary */}
        {salary && (
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.33.585z" />
              <path
                fillRule="evenodd"
                d="M9.99 1.667C5.45 1.667 1.75 5.367 1.75 9.907c0 4.54 3.7 8.24 8.24 8.24 4.54 0 8.24-3.7 8.24-8.24 0-4.54-3.7-8.24-8.24-8.24zM10 5.75a.75.75 0 01.75.75v.464a3.75 3.75 0 011.576.766c.374.305.674.71.674 1.27 0 .49-.2.914-.518 1.218a3.46 3.46 0 01-.732.502v2.69a3.58 3.58 0 001.048-.527c.308-.233.432-.48.432-.68a.75.75 0 011.5 0c0 .676-.338 1.27-.887 1.69a5.093 5.093 0 01-2.093.867V15.5a.75.75 0 01-1.5 0v-.467a4.93 4.93 0 01-1.835-.826c-.417-.335-.665-.757-.665-1.207 0-.48.24-.89.565-1.178a4.09 4.09 0 01.935-.585v-2.55A3.052 3.052 0 008.15 9.07c-.282-.234-.4-.484-.4-.73 0-.426.235-.84.657-1.14a3.79 3.79 0 011.093-.558V6.5A.75.75 0 0110 5.75z"
                clipRule="evenodd"
              />
            </svg>
            {salary}
          </span>
        )}
      </div>

      {/* Footer row: source badge + posted date */}
      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
          {sourcePortal}
        </span>
        <span className="text-xs text-gray-400">
          {t("postedAt")} {formatRelativeDate(createdAt)}
        </span>
      </div>
    </Link>
  );
}
