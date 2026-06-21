import { getTranslations } from "next-intl/server";

interface JobFiltersProps {
  locale?: string;
  initialQuery?: string;
  initialLocation?: string;
  initialSalaryMin?: number;
  initialSalaryMax?: number;
  initialRemote?: boolean;
}

export async function JobFilters({
  locale = "de",
  initialQuery = "",
  initialLocation = "",
  initialSalaryMin,
  initialSalaryMax,
  initialRemote = false,
}: JobFiltersProps) {
  const t = await getTranslations("jobs");

  return (
    <aside className="w-full rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
        {t("filtersTitle")}
      </h2>

      <form action={`/${locale}/jobs`} method="GET" className="space-y-5">
        {/* Preserve keyword */}
        {initialQuery && <input type="hidden" name="q" value={initialQuery} />}

        {/* Location */}
        <div>
          <label htmlFor="filter-location" className="block text-sm font-medium text-gray-700 mb-1">
            {t("filters.location")}
          </label>
          <input
            id="filter-location"
            type="text"
            name="location"
            defaultValue={initialLocation}
            placeholder="z.B. Berlin, München"
            list="filter-cities"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
          <datalist id="filter-cities">
            <option value="Berlin" />
            <option value="München" />
            <option value="Hamburg" />
            <option value="Frankfurt" />
            <option value="Köln" />
            <option value="Stuttgart" />
            <option value="Düsseldorf" />
            <option value="Leipzig" />
            <option value="Nürnberg" />
            <option value="Hannover" />
            <option value="Dresden" />
            <option value="Mannheim" />
          </datalist>
        </div>

        {/* Salary range */}
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-1">
            {t("filters.salary")}
          </legend>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="salaryMin"
              min={0}
              step={1000}
              defaultValue={initialSalaryMin ?? ""}
              placeholder="Min"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
            <span className="text-gray-400 text-sm shrink-0">–</span>
            <input
              type="number"
              name="salaryMax"
              min={0}
              step={1000}
              defaultValue={initialSalaryMax ?? ""}
              placeholder="Max"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </fieldset>

        {/* Remote */}
        <div className="flex items-center gap-3">
          <input
            id="filter-remote"
            type="checkbox"
            name="remote"
            value="1"
            defaultChecked={initialRemote}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition"
          />
          <label htmlFor="filter-remote" className="text-sm text-gray-700 cursor-pointer">
            {t("filters.remote")}
          </label>
        </div>

        <input type="hidden" name="page" value="1" />

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {t("applyFilters")}
          </button>
          <a
            href={`/${locale}/jobs`}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-center transition-colors"
          >
            {t("resetFilters")}
          </a>
        </div>
      </form>
    </aside>
  );
}
