import { auth } from "@/lib/auth/config";
import {
  getDashboardStats,
  getRegistrationsByDay,
  getApplicationsByDay,
} from "@/lib/db/queries/admin";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // For MVP: skip role check since there's only one admin
  // In production: check role === "admin"

  try {
    const [stats, registrationsByDay, applicationsByDay] = await Promise.all([
      getDashboardStats(),
      getRegistrationsByDay(30),
      getApplicationsByDay(30),
    ]);

    return Response.json({ stats, registrationsByDay, applicationsByDay });
  } catch (error) {
    console.error("Admin API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
