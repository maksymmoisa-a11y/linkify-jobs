import { getTranslations } from "next-intl/server";
import { getUsersList } from "@/lib/db/queries/admin";
import { UserRow } from "@/components/admin/user-row";
import { Link } from "@/lib/i18n/routing";

const PER_PAGE = 20;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const t = await getTranslations("admin");

  const search = typeof params.search === "string" ? params.search : undefined;
  const page = typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10)) : 1;

  let users: Awaited<ReturnType<typeof getUsersList>>["users"] = [];
  let total = 0;

  try {
    const result = await getUsersList({ search, page, pageSize: PER_PAGE });
    users = result.users;
    total = result.total;
  } catch {
    // DB unavailable
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  function buildHref(p: number) {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    q.set("page", String(p));
    return `?${q.toString()}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("usersTitle")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {total} {t("users")}
        </p>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search ?? ""}
          placeholder={t("userName") + " / " + t("userEmail")}
          className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
        {search && (
          <Link
            href="?"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            {t("noUsers")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t("userName")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t("userRole")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t("userRegistered")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t("userApplications")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t("portalActions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={{
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      role: user.role,
                      createdAt: user.createdAt instanceof Date
                        ? user.createdAt.toISOString()
                        : user.createdAt,
                      applicationsCount: user.applicationsCount,
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} &mdash; {total} total
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildHref(page - 1)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildHref(page + 1)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
