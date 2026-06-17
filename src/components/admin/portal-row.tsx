"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export type Portal = {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: "active" | "paused" | "error";
  jobsCount: number;
  lastSyncAt: string | null;
};

type PortalRowProps = {
  portal: Portal;
  onRefresh?: () => void;
};

const STATUS_STYLES: Record<Portal["status"], string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
};

export function PortalRow({ portal, onRefresh }: PortalRowProps) {
  const t = useTranslations("admin");

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(portal.name);
  const [editType, setEditType] = useState(portal.type);
  const [editConfig, setEditConfig] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSync() {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/connectors/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portal: portal.slug }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(t("syncSuccess", { count: data.count ?? 0 }));
        onRefresh?.();
      } else {
        setSyncMessage(data.error ?? "Sync failed");
      }
    } catch {
      setSyncMessage("Network error");
    } finally {
      setSyncing(false);
    }
  }

  async function handleToggle() {
    setToggling(true);
    const newStatus: Portal["status"] = portal.status === "active" ? "paused" : "active";
    try {
      await fetch(`/api/admin/portals/${portal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      onRefresh?.();
    } catch {
      // silently fail – parent can re-fetch
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!confirm(t("deleteConfirm"))) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/portals/${portal.id}`, { method: "DELETE" });
      onRefresh?.();
    } finally {
      setDeleting(false);
    }
  }

  async function handleSaveEdit() {
    setSaving(true);
    try {
      let parsedConfig: Record<string, unknown> = {};
      if (editConfig.trim()) {
        parsedConfig = JSON.parse(editConfig);
      }
      await fetch(`/api/admin/portals/${portal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, type: editType, config: parsedConfig }),
      });
      setEditing(false);
      onRefresh?.();
    } catch {
      alert("Save failed — check JSON config");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3">
          <span className="font-medium text-gray-900">{portal.name}</span>
          <span className="ml-2 text-xs text-gray-400">{portal.slug}</span>
        </td>
        <td className="px-4 py-3">
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {portal.type}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[portal.status]}`}>
            {portal.status}
          </span>
        </td>
        <td className="px-4 py-3 tabular-nums text-sm text-gray-700">
          {portal.jobsCount.toLocaleString()}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {portal.lastSyncAt
            ? new Date(portal.lastSyncAt).toLocaleString()
            : "—"}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Sync */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {syncing ? t("syncing") : t("syncNow")}
            </button>
            {/* Toggle */}
            <button
              onClick={handleToggle}
              disabled={toggling}
              className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {toggling ? "..." : portal.status === "active" ? "Pause" : "Activate"}
            </button>
            {/* Edit */}
            <button
              onClick={() => setEditing((e) => !e)}
              className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t("editPortal")}
            </button>
            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {deleting ? "..." : t("deletePortal")}
            </button>
          </div>
          {syncMessage && (
            <p className="mt-1 text-xs text-green-600">{syncMessage}</p>
          )}
        </td>
      </tr>

      {editing && (
        <tr className="bg-blue-50">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t("portalName")}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t("portalType")}
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="api">api</option>
                  <option value="scraper">scraper</option>
                  <option value="feed">feed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t("portalConfig")}
                </label>
                <textarea
                  value={editConfig}
                  onChange={(e) => setEditConfig(e.target.value)}
                  placeholder="{}"
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {t("cancel")}
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
