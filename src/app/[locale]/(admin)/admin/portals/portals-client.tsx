"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PortalRow, type Portal } from "@/components/admin/portal-row";
import { PortalCreateForm } from "@/components/admin/portal-create-form";

type PortalsClientProps = {
  initialPortals: Portal[];
};

export function PortalsClient({ initialPortals }: PortalsClientProps) {
  const t = useTranslations("admin");
  const [portals, setPortals] = useState<Portal[]>(initialPortals);
  const [showCreate, setShowCreate] = useState(false);

  const fetchPortals = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/portals");
      if (res.ok) {
        const data = await res.json();
        setPortals(data.portals ?? data);
      }
    } catch {
      // silently fail
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate((s) => !s)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          {showCreate ? t("cancel") : t("addIntegration")}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <PortalCreateForm
          onSuccess={() => {
            setShowCreate(false);
            fetchPortals();
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {portals.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">{t("noPortals")}</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {t("addIntegration")}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t("portalName")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t("portalType")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t("portalStatus")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t("portalJobs")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t("portalLastSync")}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t("portalActions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {portals.map((portal) => (
                  <PortalRow
                    key={portal.id}
                    portal={portal}
                    onRefresh={fetchPortals}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
