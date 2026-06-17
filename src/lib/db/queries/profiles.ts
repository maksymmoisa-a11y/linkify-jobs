import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles, users } from "@/lib/db/schema";
import type { ParsedCV } from "@/lib/ai/cv-parser";

export type Profile = typeof profiles.$inferSelect;
export type ProfileInsert = typeof profiles.$inferInsert;

/**
 * Get a user's profile along with their user record.
 */
export async function getProfileByUserId(userId: string) {
  const result = await db
    .select({
      profile: profiles,
      user: users,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(eq(profiles.userId, userId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create or update a profile for the given user.
 * Uses Drizzle's onConflictDoUpdate targeting the unique userId column.
 */
export async function upsertProfile(
  userId: string,
  data: Partial<Omit<ProfileInsert, "id" | "userId" | "createdAt">>
) {
  const now = new Date();

  const [result] = await db
    .insert(profiles)
    .values({
      userId,
      ...data,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        ...data,
        updatedAt: now,
      },
    })
    .returning();

  return result;
}

/**
 * Merge parsed CV data into an existing profile.
 * Only overwrites fields that are present in the parsed CV and currently empty/null.
 * Skills and experience are merged (CV data takes precedence if profile fields are empty).
 */
export async function updateProfileFromCV(
  userId: string,
  parsed: ParsedCV
): Promise<Profile> {
  const existing = await getProfileByUserId(userId);

  const updates: Partial<Omit<ProfileInsert, "id" | "userId" | "createdAt">> =
    {
      cvParsedData: parsed as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    };

  // Merge headline — only set if profile is empty
  if (!existing?.profile.headline && parsed.headline) {
    updates.headline = parsed.headline;
  }

  // Merge summary — only set if profile is empty
  if (!existing?.profile.summary && parsed.summary) {
    updates.summary = parsed.summary;
  }

  // Merge skills — union of existing + new, deduplicated (case-insensitive)
  const existingSkills = existing?.profile.skills ?? [];
  const newSkills = parsed.skills ?? [];
  const skillSet = new Map<string, string>();
  for (const s of [...existingSkills, ...newSkills]) {
    skillSet.set(s.toLowerCase(), s);
  }
  updates.skills = Array.from(skillSet.values());

  // Merge experience — replace if profile has none
  if (
    (!existing?.profile.experience ||
      existing.profile.experience.length === 0) &&
    parsed.experience.length > 0
  ) {
    updates.experience = parsed.experience;
  }

  // Merge education — replace if profile has none
  if (
    (!existing?.profile.education ||
      existing.profile.education.length === 0) &&
    parsed.education.length > 0
  ) {
    updates.education = parsed.education;
  }

  return upsertProfile(userId, updates);
}
