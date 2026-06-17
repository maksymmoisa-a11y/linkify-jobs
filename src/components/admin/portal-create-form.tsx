"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type PortalCreateFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

const PORTAL_TYPES = ["bundesagentur", "indeed", "stepstone", "linkedin", "custom"] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PortalCreateForm({ onSuccess, onCancel }: PortalCreateFormProps) {
  const t = useTranslations("admin");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [type, setType] = useState<(typeof PORTAL_TYPES)[number]>("custom");
  const [config, setConfig] = useState("{}");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let parsedConfig: Record<string, unknown> = {};
    try {
      parsedConfig = JSON.parse(config);
    } catch {
      setError("Config must be valid JSON");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/portals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, type, config: parsedConfig }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create portal");
        return;
      }

      onSuccess?.();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-blue-100 bg-blue-50 p-5 shadow-sm"
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        {t("createPortal")}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            {t("portalName")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="My Job Portal"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            {t("portalSlug")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(e.target.value);
            }}
            placeholder="my-job-portal"
            pattern="[a-z0-9-]+"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-0.5 text-[10px] text-gray-400">Lowercase letters, numbers, hyphens</p>
        </div>

        {/* Type */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            {t("portalType")} <span className="text-red-500">*</span>
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as (typeof PORTAL_TYPES)[number])}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {PORTAL_TYPES.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>
        </div>

        {/* Config */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            {t("portalConfig")}
          </label>
          <textarea
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            rows={3}
            placeholder="{}"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Creating..." : t("createPortal")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
