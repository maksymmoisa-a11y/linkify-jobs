import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";

function BrainIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export default function HomePage() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");

  const features = [
    {
      title: t("features.aiMatch.title"),
      description: t("features.aiMatch.description"),
      icon: <BrainIcon />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: t("features.autoApply.title"),
      description: t("features.autoApply.description"),
      icon: <BoltIcon />,
      color: "bg-green-50 text-green-600",
    },
    {
      title: t("features.coverLetter.title"),
      description: t("features.coverLetter.description"),
      icon: <DocumentIcon />,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {t("hero.subtitle")}
          </p>

          {/* Search Bar */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-2">
            <input
              type="text"
              placeholder={t("hero.searchPlaceholder")}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-5 py-3.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t("hero.searchPlaceholder")}
            />
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {t("hero.cta")}
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {features.map(({ title, description, icon, color }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`inline-flex rounded-xl p-3 ${color}`}>
                  {icon}
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-600 py-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {t("hero.title")}
          </h2>
          <p className="mt-4 text-blue-100">{t("hero.subtitle")}</p>
          <Link
            href="/auth"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
          >
            {tNav("register")}
          </Link>
        </div>
      </section>
    </>
  );
}
