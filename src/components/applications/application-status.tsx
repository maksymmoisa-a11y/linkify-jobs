"use client";

import { useTranslations } from "next-intl";

type ApplicationStatus = "draft" | "prefilled" | "submitted" | "confirmed" | "rejected";

interface ApplicationStatusProps {
  status: string;
}

const statusConfig: Record<ApplicationStatus, { bg: string; text: string; dot: string }> = {
  draft: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-400",
  },
  prefilled: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    dot: "bg-yellow-500",
  },
  submitted: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-500",
  },
  confirmed: {
    bg: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
  },
  rejected: {
    bg: "bg-red-100",
    text: "text-red-800",
    dot: "bg-red-500",
  },
};

const knownStatuses: ApplicationStatus[] = ["draft", "prefilled", "submitted", "confirmed", "rejected"];

function isKnownStatus(s: string): s is ApplicationStatus {
  return knownStatuses.includes(s as ApplicationStatus);
}

export function ApplicationStatus({ status }: ApplicationStatusProps) {
  const t = useTranslations("applications");

  const key = isKnownStatus(status) ? status : "draft";
  const { bg, text, dot } = statusConfig[key];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {t(`status.${key}`)}
    </span>
  );
}
