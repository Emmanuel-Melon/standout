import { eq } from "drizzle-orm";

import { db } from "@/lib/drizzle";
import type { DbResult } from "@/lib/drizzle/drizzle.types";
import { executeSingle } from "@/lib/drizzle/results/results.single";

import { intentLogsSchema, userSavedSearchesSchema } from "../intent.schema";
import type { QueryIntent, SavedSearch } from "../intent.types";
import { toSavedSearch } from "./intent.mapper";

export async function logIntentExtraction(data: {
  userId?: string;
  rawMessage: string;
  parsedIntent: QueryIntent;
  usedFallback: boolean;
  isEmpty: boolean;
  model: string;
}): Promise<void> {
  try {
    await db.insert(intentLogsSchema).values({
      userId: data.userId ?? null,
      rawMessage: data.rawMessage,
      parsedIntent: data.parsedIntent,
      usedFallback: data.usedFallback,
      isEmpty: data.isEmpty,
      model: data.model,
    });
  } catch (error) {
    // Non-blocking telemetry failure protection
    console.error("Failed to log intent extraction telemetry:", error);
  }
}

export async function saveUserSearch(
  userId: string,
  name: string,
  intent: QueryIntent,
): Promise<DbResult<SavedSearch>> {
  return executeSingle(
    db
      .insert(userSavedSearchesSchema)
      .values({ userId, name, ...intent })
      .returning()
      .then(([record]) => toSavedSearch(record)),
  );
}
