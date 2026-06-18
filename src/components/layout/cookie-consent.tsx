"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type ConsentValue = "all" | "essential" | "none";

const STORAGE_KEY = "cookie-consent";

function setConsentCookie(value: ConsentValue) {
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${STORAGE_KEY}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export function CookieConsent() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Small delay so the banner animates in after page load
      const id = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(id);
    }
  }, []);

  function accept(value: ConsentValue) {
    localStorage.setItem(STORAGE_KEY, value);
    setConsentCookie(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className={[
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-gray-900/95 backdrop-blur-sm text-white",
        "border-t border-gray-700",
        "px-4 py-4 sm:px-6",
        "animate-slide-up",
      ].join(" ")}
      style={{
        animation: "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-200 sm:max-w-xl">
          {t("message")}
        </p>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => accept("essential")}
            className="rounded-lg border border-gray-500 px-4 py-2 text-sm font-medium text-gray-200 hover:border-gray-300 hover:text-white transition-colors"
          >
            {t("essentialOnly")}
          </button>

          <button
            onClick={() => accept("none")}
            className="rounded-lg border border-gray-500 px-4 py-2 text-sm font-medium text-gray-200 hover:border-gray-300 hover:text-white transition-colors"
          >
            {t("settings")}
          </button>

          <button
            onClick={() => accept("all")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            {t("acceptAll")}
          </button>
        </div>
      </div>
    </div>
  );
}
