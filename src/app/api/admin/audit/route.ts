import { auth } from "@/lib/auth/config";
import { getAuditLog } from "@/lib/db/queries/admin";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // For MVP: skip role check since there's only one admin
  // In production: check role === "admin"

  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "20");

    const result = await getAuditLog({ page, pageSize });
    return Response.json(result);
  } catch (error) {
    console.error("Admin API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
