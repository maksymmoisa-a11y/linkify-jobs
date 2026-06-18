import { db } from "@/lib/db";
import { userLimits } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";

const MONTHLY_LIMIT = 500;

export interface RateLimitResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  resetDate: Date;
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  // Get current month period start (first day of month)
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  try {
    // Find or create current period limit record
    const existing = await db
      .select()
      .from(userLimits)
      .where(
        and(
          eq(userLimits.userId, userId),
          gte(userLimits.periodStart, periodStart)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      // Create new period record
      await db.insert(userLimits).values({
        userId,
        periodStart,
        viewsUsed: 0,
        viewsLimit: MONTHLY_LIMIT,
      });
      return { allowed: true, used: 0, limit: MONTHLY_LIMIT, remaining: MONTHLY_LIMIT, resetDate };
    }

    const record = existing[0];
    return {
      allowed: record.viewsUsed < record.viewsLimit,
      used: record.viewsUsed,
      limit: record.viewsLimit,
      remaining: Math.max(0, record.viewsLimit - record.viewsUsed),
      resetDate,
    };
  } catch {
    // DB error — allow by default
    return { allowed: true, used: 0, limit: MONTHLY_LIMIT, remaining: MONTHLY_LIMIT, resetDate };
  }
}

export async function incrementViewCount(userId: string): Promise<void> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    // Use raw SQL for atomic increment
    const { sql } = await import("drizzle-orm");
    await db
      .update(userLimits)
      .set({ viewsUsed: sql`${userLimits.viewsUsed} + 1` })
      .where(
        and(
          eq(userLimits.userId, userId),
          gte(userLimits.periodStart, periodStart)
        )
      );
  } catch {
    // Silently fail — don't block user experience
  }
}

export async function getRateLimitStatus(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(userId);
}
