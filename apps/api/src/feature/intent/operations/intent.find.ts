import { eq } from "drizzle-orm";

import { db } from "@/lib/drizzle";
import { DbCollection } from "@/lib/drizzle/drizzle.types";
import { toCollection } from "@/lib/drizzle/results/results.collection";

import { intentExtractionConfig } from "../intent.config";
import { userSavedSearchesSchema } from "../intent.schema";
import type { QueryIntent, SavedSearch } from "../intent.types";
import { extractIntent } from "./intent.extract";
import { logIntentExtraction } from "./intent.insert";
import { toSavedSearch } from "./intent.mapper";
import { isEmptyIntent, sanitizeIntent } from "./intent.sanitize";

export async function findIntent(
  message: string,
  userId?: string,
): Promise<{ intent: QueryIntent; usedFallback: boolean }> {
  let raw = await extractIntent(message);
  let intent = sanitizeIntent(raw);

  if (isEmptyIntent(intent) && intentExtractionConfig.maxRetries > 0) {
    raw = await extractIntent(message);
    intent = sanitizeIntent(raw);
  }

  const empty = isEmptyIntent(intent);

  // Asynchronously record telemetry and search history without blocking execution
  logIntentExtraction({
    userId,
    rawMessage: message,
    parsedIntent: intent,
    usedFallback: empty,
    isEmpty: empty,
    model: intentExtractionConfig.model,
  });

  return { intent, usedFallback: empty };
}

export async function getUserSavedSearches(
  userId: string,
): Promise<DbCollection<SavedSearch>> {
  const records = await db
    .select()
    .from(userSavedSearchesSchema)
    .where(eq(userSavedSearchesSchema.userId, userId));

  return toCollection(records.map(toSavedSearch));
}
