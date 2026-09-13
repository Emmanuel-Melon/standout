import { eq } from "drizzle-orm";

import { db } from "@/lib/drizzle";

import { highlights } from "../profile.schema";
import type { Highlight } from "../profile.types";

const MAX_HIGHLIGHTS = 5; // cap enforced in code, not just UI

export async function replaceHighlights(profileId: string, items: Highlight[]) {
  if (items.length > MAX_HIGHLIGHTS) {
    throw new Error(`A profile can have at most ${MAX_HIGHLIGHTS} highlights`);
  }

  await db.transaction(async (tx) => {
    await tx.delete(highlights).where(eq(highlights.profileId, profileId));
    if (items.length) {
      await tx
        .insert(highlights)
        .values(items.map((item, i) => ({ ...item, profileId, sortOrder: i })));
    }
  });
}
