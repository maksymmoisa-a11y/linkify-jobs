import { useLocale } from "next-intl";

export function LanguageSwitcher() {
  const locale = useLocale();

  return (
    <div className="flex items-center rounded-md border border-gray-300 overflow-hidden">
      <a
        href="/de"
        className={`px-2.5 py-1.5 text-sm font-medium transition-colors ${
          locale === "de" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        DE
      </a>
      <a
        href="/en"
        className={`px-2.5 py-1.5 text-sm font-medium transition-colors ${
          locale === "en" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        EN
      </a>
    </div>
  );
}
