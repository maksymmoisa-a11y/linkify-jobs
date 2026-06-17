import { getTranslations } from "next-intl/server";
import { StatsCard } from "@/components/admin/stats-card";
import { MiniChart } from "@/components/admin/mini-chart";
import {
  getDashboardStats,
  getRegistrationsByDay,
  getApplicationsByDay,
  getAuditLog,
} from "@/lib/db/queries/admin";

const PLACEHOLDER_STATS = {
  totalUsers: 0,
  totalJobs: 0,
  totalApplications: 0,
  activePortals: 0,
};

export default async function AdminPage() {
  const t = await getTranslations("admin");

  let stats = PLACEHOLDER_STATS;
  let registrations: Array<{ date: string; count: number }> = [];
  let applicationsByDay: Array<{ date: string; count: number }> = [];
  let auditEntries: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    createdAt: Date;
  }> = [];

  try {
    [stats, registrations, applicationsByDay] = await Promise.all([
      getDashboardStats(),
      getRegistrationsByDay(30),
      getApplicationsByDay(30),
    ]);
    const auditResult = await getAuditLog({ page: 1, pageSize: 10 });
    auditEntries = auditResult.entries;
  } catch {
    // DB unavailable — show zeros / empty state
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("analytics")}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title={t("totalUsers")} value={stats.totalUsers.toLocaleString()} icon="👤" />
        <StatsCard title={t("totalJobs")} value={stats.totalJobs.toLocaleString()} icon="💼" />
        <StatsCard
          title={t("totalApplications")}
          value={stats.totalApplications.toLocaleString()}
          icon="📋"
        />
        <StatsCard
          title={t("activePortals")}
          value={stats.activePortals.toLocaleString()}
          icon="🌐"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              {t("registrationsChart")}
            </h2>
          </div>
          <div className="px-6 py-4">
            {registrations.length > 0 ? (
              <MiniChart data={registrations} color="#2563eb" />
            ) : (
              <p className="py-4 text-center text-sm text-gray-400">{t("noData")}</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              {t("applicationsChart")}
            </h2>
          </div>
          <div className="px-6 py-4">
            {applicationsByDay.length > 0 ? (
              <MiniChart data={applicationsByDay} color="#7c3aed" />
            ) : (
              <p className="py-4 text-center text-sm text-gray-400">{t("noData")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">{t("auditLog")}</h2>
        </div>
        {auditEntries.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">{t("noData")}</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {auditEntries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 px-6 py-3">
                <span className="min-w-[160px] text-xs text-gray-400 tabular-nums">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {entry.entityType}
                </span>
                <span className="flex-1 text-sm text-gray-800">{entry.action}</span>
                {entry.entityId && (
                  <span className="max-w-[120px] truncate font-mono text-xs text-gray-400">
                    {entry.entityId}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
