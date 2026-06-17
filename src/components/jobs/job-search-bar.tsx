"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";

interface JobSearchBarProps {
  initialQuery?: string;
  initialLocation?: string;
}

export function JobSearchBar({ initialQuery = "", initialLocation = "" }: JobSearchBarProps) {
  const t = useTranslations("common");
  const tJobs = useTranslations("jobs");
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (location.trim()) params.set("location", location.trim());
    params.set("page", "1");
    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-sm sm:flex sm:items-stretch sm:gap-2"
      role="search"
    >
      {/* Keyword input */}
      <div className="relative flex-1 min-w-0">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg
            className="h-4 w-4 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tJobs("searchKeywordPlaceholder")}
          aria-label={t("search")}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition sm:border-transparent sm:bg-transparent sm:focus:bg-transparent sm:focus:ring-0 sm:focus:border-transparent"
        />
      </div>

      {/* Divider (desktop) */}
      <div className="hidden sm:block w-px self-stretch bg-gray-200 my-1" aria-hidden="true" />

      {/* Location input */}
      <div className="relative flex-1 min-w-0 mt-2 sm:mt-0">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg
            className="h-4 w-4 text-gray-400"
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
        </div>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={tJobs("locationPlaceholder")}
          aria-label={tJobs("filters.location")}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition sm:border-transparent sm:bg-transparent sm:focus:bg-transparent sm:focus:ring-0 sm:focus:border-transparent"
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="mt-2 w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors sm:mt-0 sm:w-auto sm:shrink-0"
      >
        {t("search")}
      </button>
    </form>
  );
}
