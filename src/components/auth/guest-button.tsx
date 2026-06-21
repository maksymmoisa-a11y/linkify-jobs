"use client";

import { useSearchParams } from "next/navigation";
import { Link } from "@/lib/i18n/routing";

export function GuestButton() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  // If redirected from a job page, go back there. Otherwise go to /jobs
  const href = callbackUrl?.includes("/jobs") ? callbackUrl : "/jobs";

  return (
    <div className="mt-4">
      <Link
        href={href}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Als Gast fortfahren
      </Link>
    </div>
  );
}
