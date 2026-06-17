import { getTranslations } from "next-intl/server";
import { getPortalsList } from "@/lib/db/queries/admin";
import { PortalsClient } from "./portals-client";

export default async function PortalsPage() {
  const t = await getTranslations("admin");

  let portals: Awaited<ReturnType<typeof getPortalsList>> = [];

  try {
    portals = await getPortalsList();
  } catch {
    // DB unavailable — show empty state
  }

  const serialized = portals.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    type: p.type,
    status: p.status as "active" | "paused" | "error",
    jobsCount: p.jobsCount ?? 0,
    lastSyncAt: p.lastSyncAt ? (p.lastSyncAt instanceof Date ? p.lastSyncAt.toISOString() : p.lastSyncAt) : null,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("portals")}</h1>
      </div>

      <PortalsClient initialPortals={serialized} />
    </div>
  );
}
