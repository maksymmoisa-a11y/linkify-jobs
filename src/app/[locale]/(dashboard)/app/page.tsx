import { useTranslations } from "next-intl";

type StatCard = {
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
};

const placeholderApplications = [
  { company: "Acme GmbH", role: "Senior React Developer", status: "In Bearbeitung", date: "2025-06-15", match: "91%" },
  { company: "Tech AG", role: "Frontend Engineer", status: "Beworben", date: "2025-06-14", match: "85%" },
  { company: "Startup UG", role: "Full Stack Developer", status: "Angesehen", date: "2025-06-12", match: "79%" },
];

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  const stats: StatCard[] = [
    { label: t("stats.applications"), value: "12", bgColor: "bg-blue-50", textColor: "text-blue-700" },
    { label: t("stats.views"), value: "48", bgColor: "bg-green-50", textColor: "text-green-700" },
    { label: t("stats.matchScore"), value: "87%", bgColor: "bg-purple-50", textColor: "text-purple-700" },
    { label: t("stats.remaining"), value: "38", bgColor: "bg-orange-50", textColor: "text-orange-700" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("welcome", { name: "User" })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, bgColor, textColor }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {label}
            </p>
            <p className={`mt-2 text-2xl font-bold ${textColor}`}>
              {value}
            </p>
            <div className={`mt-3 h-1 w-12 rounded-full ${bgColor}`} />
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {t("recentApplications")}
          </h2>
        </div>
        {placeholderApplications.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            {t("noApplications")}
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {placeholderApplications.map((app) => (
              <li
                key={`${app.company}-${app.role}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {app.role}
                  </p>
                  <p className="truncate text-xs text-gray-500">{app.company}</p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-3">
                  <span className="text-xs font-medium text-blue-600">
                    {app.match}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                    {app.status}
                  </span>
                  <span className="hidden text-xs text-gray-400 sm:block">
                    {app.date}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
