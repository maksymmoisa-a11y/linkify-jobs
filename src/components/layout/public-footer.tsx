import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";

export function PublicFooter() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Linkify Jobs
            </Link>
            <p className="text-xs text-gray-500">{t("madeWith")}</p>
          </div>

          {/* Legal links */}
          <nav className="flex items-center gap-5" aria-label="Footer navigation">
            <Link
              href="/impressum"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              {tNav("impressum")}
            </Link>
            <Link
              href="/datenschutz"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              {tNav("datenschutz")}
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <p className="mt-8 text-center text-xs text-gray-400">
          {t("rights", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
