import { NextRequest, NextResponse } from "next/server";
import { searchJobs } from "@/lib/db/queries/jobs";
import type { SearchJobsResult } from "@/lib/db/queries/jobs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;

  // ── Parse query parameters ───────────────────────────────────────────────
  const q = searchParams.get("q") ?? undefined;
  const location = searchParams.get("location") ?? undefined;

  const salaryMinRaw = searchParams.get("salaryMin");
  const salaryMaxRaw = searchParams.get("salaryMax");
  const remoteRaw = searchParams.get("remote");
  const pageRaw = searchParams.get("page");
  const pageSizeRaw = searchParams.get("pageSize");

  // Validate numeric params
  const salaryMin =
    salaryMinRaw !== null ? parseInt(salaryMinRaw, 10) : undefined;
  const salaryMax =
    salaryMaxRaw !== null ? parseInt(salaryMaxRaw, 10) : undefined;
  const page = pageRaw !== null ? parseInt(pageRaw, 10) : 1;
  const pageSize = pageSizeRaw !== null ? parseInt(pageSizeRaw, 10) : 20;

  if (salaryMin !== undefined && isNaN(salaryMin)) {
    return NextResponse.json(
      { error: "salaryMin must be a number" },
      { status: 400 }
    );
  }
  if (salaryMax !== undefined && isNaN(salaryMax)) {
    return NextResponse.json(
      { error: "salaryMax must be a number" },
      { status: 400 }
    );
  }
  if (isNaN(page) || page < 1) {
    return NextResponse.json(
      { error: "page must be a positive integer" },
      { status: 400 }
    );
  }
  if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
    return NextResponse.json(
      { error: "pageSize must be between 1 and 100" },
      { status: 400 }
    );
  }

  // Parse remote: accept "true"/"1" as true, "false"/"0" as false, omit to ignore
  let remote: boolean | undefined;
  if (remoteRaw === "true" || remoteRaw === "1") remote = true;
  else if (remoteRaw === "false" || remoteRaw === "0") remote = false;

  // ── Execute search ───────────────────────────────────────────────────────
  try {
    const result: SearchJobsResult = await searchJobs({
      q,
      location,
      salaryMin,
      salaryMax,
      remote,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[jobs/search] Error:", err);
    return NextResponse.json(
      { error: `Search failed: ${message}` },
      { status: 500 }
    );
  }
}
