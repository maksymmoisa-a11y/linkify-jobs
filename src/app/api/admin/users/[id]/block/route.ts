import { auth } from "@/lib/auth/config";
import { toggleUserBlocked, logAdminAction } from "@/lib/db/queries/admin";

export async function POST(
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
    const { blocked } = body as { blocked: boolean };

    if (typeof blocked !== "boolean") {
      return Response.json(
        { error: "blocked field must be a boolean" },
        { status: 400 }
      );
    }

    const result = await toggleUserBlocked(id, blocked);

    await logAdminAction({
      actorId: session.user.id,
      action: blocked ? "user.block" : "user.unblock",
      entityType: "user",
      entityId: id,
      details: { blocked },
      ipAddress:
        request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip") ??
        undefined,
    });

    return Response.json(result);
  } catch (error) {
    console.error("Admin API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
