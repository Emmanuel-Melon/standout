import { eq } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/lib/drizzle";

import { profiles } from "../profile.schema";
import type { profileUpdateSchema } from "../profile.types";

export async function insertProfile(
  userId: string,
  data: z.infer<typeof profileUpdateSchema>,
) {
  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId));

  if (existing) {
    const [updated] = await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(profiles)
    .values({ userId, ...data })
    .returning();
  return created;
}
