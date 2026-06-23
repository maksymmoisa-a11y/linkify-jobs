import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { bundesagenturConnector } from "@/lib/connectors/bundesagentur";
import { adzunaConnector } from "@/lib/connectors/adzuna";
import { normalizeAndUpsertJobs } from "@/lib/connectors/normalize";
import type { JobConnector } from "@/lib/connectors/types";

// Registry of available connectors, keyed by slug
const connectors: Record<string, JobConnector> = {
  bundesagentur: bundesagenturConnector,
  adzuna: adzunaConnector,
};

interface SyncRequestBody {
  portal: string;
  keyword?: string;
  location?: string;
  radius?: number;
  pageSize?: number;
}

interface SyncResponse {
  synced: number;
  total: number;
  portal: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Auth guard: only admins may trigger a sync ──────────────────────────
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cast to include `role` — NextAuth session type may not include it by default
  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Parse body ──────────────────────────────────────────────────────────
  let body: SyncRequestBody;
  try {
    body = (await req.json()) as SyncRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { portal, keyword, location, radius, pageSize } = body;

  if (!portal || typeof portal !== "string") {
    return NextResponse.json(
      { error: "Missing required field: portal" },
      { status: 400 }
    );
  }

  // ── Look up connector ────────────────────────────────────────────────────
  const connector = connectors[portal];
  if (!connector) {
    return NextResponse.json(
      {
        error: `Unknown portal: "${portal}". Available: ${Object.keys(connectors).join(", ")}`,
      },
      { status: 400 }
    );
  }

  // ── Run sync ─────────────────────────────────────────────────────────────
  try {
    console.log(
      `[sync] Starting sync for portal="${portal}" keyword="${keyword ?? ""}" location="${location ?? ""}"`
    );

    const result = await connector.fetchJobs({
      keyword,
      location,
      radius,
      pageSize: pageSize ?? 100,
      page: 1,
    });

    const synced = await normalizeAndUpsertJobs(result.jobs, db);

    console.log(
      `[sync] Done: synced=${synced}, total=${result.total}, portal="${portal}"`
    );

    return NextResponse.json<SyncResponse>({
      synced,
      total: result.total,
      portal,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sync] Error syncing portal="${portal}":`, err);
    return NextResponse.json(
      { error: `Sync failed: ${message}` },
      { status: 500 }
    );
  }
}
