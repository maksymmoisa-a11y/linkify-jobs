"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  applicationsCount: number;
  blocked?: boolean;
};

type UserRowProps = {
  user: AdminUser;
  onRefresh?: () => void;
};

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  candidate: "bg-gray-100 text-gray-700",
};

export function UserRow({ user, onRefresh }: UserRowProps) {
  const t = useTranslations("admin");
  const [blocking, setBlocking] = useState(false);
  const [blocked, setBlocked] = useState(user.blocked ?? false);

  async function handleBlock() {
    const action = blocked ? "unblock" : "block";
    const label = blocked ? t("unblockUser") : t("blockUser");
    if (!blocked && !confirm(`${label}?`)) return;
    setBlocking(true);
    try {
      await fetch(`/api/admin/users/${user.id}/${action}`, { method: "POST" });
      setBlocked((b) => !b);
      onRefresh?.();
    } finally {
      setBlocking(false);
    }
  }

  const initials = (user.name ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user.name ?? "—"}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[user.role] ?? "bg-gray-100 text-gray-700"}`}
        >
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 tabular-nums text-sm text-gray-700">
        {user.applicationsCount}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/users/${user.id}`}
            className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View
          </Link>
          <button
            onClick={handleBlock}
            disabled={blocking}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
              blocked
                ? "border border-green-300 bg-white text-green-700 hover:bg-green-50"
                : "border border-red-200 bg-white text-red-600 hover:bg-red-50"
            }`}
          >
            {blocking ? "..." : blocked ? t("unblockUser") : t("blockUser")}
          </button>
        </div>
      </td>
    </tr>
  );
}
