import { auth } from "@/lib/auth/config";
import {
  getPortalsList,
  createPortal,
  logAdminAction,
} from "@/lib/db/queries/admin";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // For MVP: skip role check since there's only one admin
  // In production: check role === "admin"

  try {
    const portalsList = await getPortalsList();
    return Response.json({ portals: portalsList });
  } catch (error) {
    console.error("Admin API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // For MVP: skip role check since there's only one admin
  // In production: check role === "admin"

  try {
    const body = await request.json();
    const { name, slug, type, config, status } = body as {
      name?: string;
      slug?: string;
      type?: string;
      config?: Record<string, unknown>;
      status?: "active" | "paused" | "error";
    };

    if (!name || !slug || !type) {
      return Response.json(
        { error: "name, slug, and type are required" },
        { status: 400 }
      );
    }

    const portal = await createPortal({ name, slug, type, config, status });

    await logAdminAction({
      actorId: session.user.id,
      action: "portal.create",
      entityType: "portal",
      entityId: portal.id,
      details: { name, slug, type },
      ipAddress:
        request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip") ??
        undefined,
    });

    return Response.json({ portal }, { status: 201 });
  } catch (error) {
    console.error("Admin API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
