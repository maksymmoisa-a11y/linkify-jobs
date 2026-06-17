import { auth } from "@/lib/auth/config";
import {
  getPortalById,
  updatePortal,
  deletePortal,
  logAdminAction,
} from "@/lib/db/queries/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // For MVP: skip role check since there's only one admin
  // In production: check role === "admin"

  try {
    const { id } = await params;
    const portal = await getPortalById(id);
    if (!portal) {
      return Response.json({ error: "Portal not found" }, { status: 404 });
    }
    return Response.json({ portal });
  } catch (error) {
    console.error("Admin API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // For MVP: skip role check since there's only one admin
  // In production: check role === "admin"

  try {
    const { id } = await params;
    const body = await request.json();

    const portal = await updatePortal(id, body);
    if (!portal) {
      return Response.json({ error: "Portal not found" }, { status: 404 });
    }

    await logAdminAction({
      actorId: session.user.id,
      action: "portal.update",
      entityType: "portal",
      entityId: id,
      details: { updatedFields: Object.keys(body) },
      ipAddress:
        request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip") ??
        undefined,
    });

    return Response.json({ portal });
  } catch (error) {
    console.error("Admin API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // For MVP: skip role check since there's only one admin
  // In production: check role === "admin"

  try {
    const { id } = await params;

    const existing = await getPortalById(id);
    if (!existing) {
      return Response.json({ error: "Portal not found" }, { status: 404 });
    }

    await deletePortal(id);

    await logAdminAction({
      actorId: session.user.id,
      action: "portal.delete",
      entityType: "portal",
      entityId: id,
      details: { name: existing.name, slug: existing.slug },
      ipAddress:
        request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip") ??
        undefined,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
