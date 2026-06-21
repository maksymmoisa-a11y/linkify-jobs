"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { SearchSuggestions } from "./search-suggestions";

const POPULAR_CITIES = [
  "Berlin", "München", "Hamburg", "Frankfurt", "Köln",
  "Stuttgart", "Düsseldorf", "Leipzig", "Nürnberg", "Hannover",
  "Dresden", "Mannheim"
];

interface JobFiltersProps {
  initialLocation?: string;
  initialSalaryMin?: number;
  initialSalaryMax?: number;
  initialRemote?: boolean;
  initialMatchMin?: number;
}

export function JobFilters({
  initialLocation = "",
  initialSalaryMin,
  initialSalaryMax,
  initialRemote = false,
  initialMatchMin = 0,
}: JobFiltersProps) {
  const t = useTranslations("jobs");
  const locale = useLocale();

  const [location, setLocation] = useState(initialLocation);
  const [salaryMin, setSalaryMin] = useState(initialSalaryMin?.toString() ?? "");
  const [salaryMax, setSalaryMax] = useState(initialSalaryMax?.toString() ?? "");
  const [remote, setRemote] = useState(initialRemote);
  const [matchMin, setMatchMin] = useState(initialMatchMin);

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const current = new URLSearchParams(window.location.search);
    const q = current.get("q");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location.trim()) params.set("location", location.trim());
    if (salaryMin) params.set("salaryMin", salaryMin);
    if (salaryMax) params.set("salaryMax", salaryMax);
    if (remote) params.set("remote", "1");
    if (matchMin > 0) params.set("matchMin", matchMin.toString());
    params.set("page", "1");
    window.location.href = `/${locale}/jobs?${params.toString()}`;
  }

  function handleReset() {
    window.location.href = `/${locale}/jobs`;
  }

  return (
    <aside className="w-full rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
        {t("filtersTitle")}
      </h2>

      <form onSubmit={handleApply} className="space-y-5">
        {/* Location */}
        <div>
          <label
            htmlFor="filter-location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("filters.location")}
          </label>
          <SearchSuggestions
            id="filter-location"
            suggestions={POPULAR_CITIES}
            placeholder="z.B. Berlin, München"
            value={location}
            onChange={setLocation}
          />
        </div>

        {/* Salary range */}
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-1">
            {t("filters.salary")}
          </legend>
          <div className="flex items-center gap-2">
            <input
              id="filter-salary-min"
              type="number"
              min={0}
              step={1000}
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder="Min"
              aria-label="Gehalt von"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
            <span className="text-gray-400 text-sm shrink-0">–</span>
            <input
              id="filter-salary-max"
              type="number"
              min={0}
              step={1000}
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="Max"
              aria-label="Gehalt bis"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </fieldset>

        {/* Remote */}
        <div className="flex items-center gap-3">
          <input
            id="filter-remote"
            type="checkbox"
            checked={remote}
            onChange={(e) => setRemote(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition"
          />
          <label htmlFor="filter-remote" className="text-sm text-gray-700 cursor-pointer">
            {t("filters.remote")}
          </label>
        </div>

        {/* Match score minimum */}
        <div>
          <label
            htmlFor="filter-match-min"
            className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2"
          >
            <span>{t("filters.matchMin")}</span>
            <span className="font-semibold text-blue-600">{matchMin}%</span>
          </label>
          <input
            id="filter-match-min"
            type="range"
            min={0}
            max={100}
            step={5}
            value={matchMin}
            onChange={(e) => setMatchMin(Number(e.target.value))}
            className="w-full h-2 accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {t("applyFilters")}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          >
            {t("resetFilters")}
          </button>
        </div>
      </form>
    </aside>
  );
}
