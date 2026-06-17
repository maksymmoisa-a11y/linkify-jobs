import { useTranslations } from "next-intl";

type StatCard = {
  label: string;
  value: string;
  icon: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
};

export default function AdminPage() {
  const t = useTranslations("admin");

  const stats: StatCard[] = [
    { label: t("totalUsers"), value: "1,284", icon: "👤", bgColor: "bg-blue-50", textColor: "text-blue-700", borderColor: "border-blue-100" },
    { label: t("totalJobs"), value: "9,421", icon: "💼", bgColor: "bg-green-50", textColor: "text-green-700", borderColor: "border-green-100" },
    { label: t("totalApplications"), value: "3,107", icon: "📋", bgColor: "bg-purple-50", textColor: "text-purple-700", borderColor: "border-purple-100" },
    { label: t("activePortals"), value: "14", icon: "🌐", bgColor: "bg-orange-50", textColor: "text-orange-700", borderColor: "border-orange-100" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("analytics")}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon, bgColor, textColor, borderColor }) => (
            <div
              key={label}
              className={`rounded-xl border ${borderColor} bg-white p-5 shadow-sm`}
            >
              <div className={`inline-flex items-center justify-center h-10 w-10 rounded-lg text-lg ${bgColor}`}>
                {icon}
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
              <p className={`mt-1 text-xs font-medium ${textColor}`}>
                {label}
              </p>
            </div>
          ))}
      </div>

      {/* Placeholder Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Users Overview */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">{t("users")}</h2>
          </div>
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            — {t("users")} data will appear here —
          </div>
        </div>

        {/* Portals Overview */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">{t("portals")}</h2>
          </div>
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            — {t("portals")} data will appear here —
          </div>
        </div>
      </div>
    </div>
  );
}
