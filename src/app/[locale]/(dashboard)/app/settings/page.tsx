"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";

// ---------------------------------------------------------------------------
// Toggle switch
// ---------------------------------------------------------------------------
function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
        "transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
        checked ? "bg-blue-600" : "bg-gray-200",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow",
          "transform transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section card wrapper
// ---------------------------------------------------------------------------
function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete confirmation modal
// ---------------------------------------------------------------------------
function DeleteModal({
  onClose,
  onConfirm,
  deleting,
  t,
}: {
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const [input, setInput] = useState("");
  const confirmed = input === "DELETE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">
          {t("deleteConfirmTitle")}
        </h3>
        <p className="mt-2 text-sm text-gray-600">{t("deleteConfirmMessage")}</p>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="DELETE"
          className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmed || deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? t("deleting") : t("deleteConfirmButton")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main settings page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const t = useTranslations("settings");
  const router = useRouter();

  // --- Language ---
  const [locale, setLocale] = useState("de");

  useEffect(() => {
    // Read locale from the current URL path segment
    const parts = window.location.pathname.split("/");
    if (parts[1] === "en" || parts[1] === "de") {
      setLocale(parts[1]);
    }
  }, []);

  function handleLocaleChange(newLocale: string) {
    setLocale(newLocale);
    // Navigate to the same path segment under the new locale
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push("/settings", { locale: newLocale } as any);
  }

  // --- Notifications (stored in localStorage for MVP) ---
  const [notifyNewJobs, setNotifyNewJobs] = useState(false);
  const [notifyAppStatus, setNotifyAppStatus] = useState(false);
  const [notifyWeekly, setNotifyWeekly] = useState(false);

  useEffect(() => {
    setNotifyNewJobs(localStorage.getItem("notify_new_jobs") === "true");
    setNotifyAppStatus(localStorage.getItem("notify_app_status") === "true");
    setNotifyWeekly(localStorage.getItem("notify_weekly") === "true");
  }, []);

  function toggle(key: string, value: boolean) {
    localStorage.setItem(key, String(value));
  }

  // --- Export ---
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail for MVP
    } finally {
      setExporting(false);
    }
  }

  // --- Delete ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        router.push("/");
      }
    } catch {
      // silently fail for MVP
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  // --- Rate limit (placeholder data) ---
  const used = 48;
  const limit = 500;
  const resetDate = new Date();
  resetDate.setMonth(resetDate.getMonth() + 1, 1);
  const resetDateStr = resetDate.toLocaleDateString(
    locale === "de" ? "de-DE" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );
  const progress = Math.min((used / limit) * 100, 100);

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        </div>

        {/* Language */}
        <SectionCard title={t("language")}>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">{t("languageHint")}</p>
            <select
              value={locale}
              onChange={(e) => handleLocaleChange(e.target.value)}
              className="w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </div>
        </SectionCard>

        {/* Email Notifications */}
        <SectionCard title={t("notifications")}>
          {(
            [
              {
                id: "notify_new_jobs",
                label: t("notifyNewJobs"),
                value: notifyNewJobs,
                set: (v: boolean) => {
                  setNotifyNewJobs(v);
                  toggle("notify_new_jobs", v);
                },
              },
              {
                id: "notify_app_status",
                label: t("notifyApplicationStatus"),
                value: notifyAppStatus,
                set: (v: boolean) => {
                  setNotifyAppStatus(v);
                  toggle("notify_app_status", v);
                },
              },
              {
                id: "notify_weekly",
                label: t("notifyWeeklyDigest"),
                value: notifyWeekly,
                set: (v: boolean) => {
                  setNotifyWeekly(v);
                  toggle("notify_weekly", v);
                },
              },
            ] as const
          ).map(({ id, label, value, set }) => (
            <div key={id} className="flex items-center justify-between gap-4">
              <label htmlFor={id} className="text-sm text-gray-700 cursor-pointer">
                {label}
              </label>
              <Toggle id={id} checked={value} onChange={set} />
            </div>
          ))}
        </SectionCard>

        {/* Data & Privacy */}
        <SectionCard title={t("dataPrivacy")}>
          {/* Export */}
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">{t("exportData")}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t("exportDataHint")}</p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {exporting ? t("exportingData") : t("exportData")}
            </button>
          </div>

          <div className="border-t border-gray-100" />

          {/* Delete account */}
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">{t("deleteAccount")}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t("deleteAccountHint")}</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              {t("deleteAccount")}
            </button>
          </div>
        </SectionCard>

        {/* Rate Limit */}
        <SectionCard title={t("rateLimit")}>
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              {t("rateLimitUsed", { used, limit })}
            </p>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {t("rateLimitResets", { date: resetDateStr })}
            </p>
          </div>
        </SectionCard>
      </div>

      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          deleting={deleting}
          t={t}
        />
      )}
    </>
  );
}
