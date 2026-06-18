import { auth } from "@/lib/auth/config";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await import("@/lib/db");
    const { users, profiles, applications, userLimits, sessions, accounts, auditLog } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const userId = session.user.id;

    // Delete in correct order (foreign keys)
    await db.delete(userLimits).where(eq(userLimits.userId, userId));
    await db.delete(applications).where(eq(applications.userId, userId));
    await db.delete(profiles).where(eq(profiles.userId, userId));
    await db.delete(sessions).where(eq(sessions.userId, userId));
    await db.delete(accounts).where(eq(accounts.userId, userId));

    // Log anonymized deletion
    await db.insert(auditLog).values({
      action: "account.deleted",
      entityType: "user",
      entityId: userId,
      details: { anonymized: true },
    });

    // Finally delete user
    await db.delete(users).where(eq(users.id, userId));

    // Delete uploaded files
    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "uploads", "cv", userId);
    await fs.rm(uploadDir, { recursive: true, force: true }).catch(() => {});

    return Response.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return Response.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
