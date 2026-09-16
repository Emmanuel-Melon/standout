import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
  IntentJobs,
  SearchLocationPrefs,
  SearchSeniorityLevels,
} from "./intent.config";
import { userSavedSearchesSchema } from "./intent.schema";

extendZodWithOpenApi(z);

/*
 * DOMAIN SCHEMAS (not DB-backed — intent is derived per-request, not persisted)
 */
const SAFE_TOKEN = z.string().regex(/^[a-zA-Z0-9\s\-.+#]{1,40}$/);

export const queryIntentSchema = z.object({
  roles: z.array(SAFE_TOKEN).max(5).default([]),
  skills: z.array(SAFE_TOKEN).max(5).default([]),
  locationPref: z.enum(SearchLocationPrefs).default("any"),
  locationKeywords: z.array(SAFE_TOKEN).max(3).default([]),
  companyStage: z.array(SAFE_TOKEN).max(3).default([]),
  seniority: z.enum(SearchSeniorityLevels).default("any"),
  excludeKeywords: z.array(SAFE_TOKEN).max(5).default([]),
});

/*
 * INTENT LOG SCHEMAS (hand-rolled — avoids drizzle-zod + zod v3/v4
 * type incompatibility on jsonb columns)
 */
export const intentLogSelectSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().nullable(),
  rawMessage: z.string(),
  parsedIntent: queryIntentSchema,
  usedFallback: z.boolean(),
  isEmpty: z.boolean(),
  model: z.string(),
  createdAt: z.date(),
});

export const intentLogInsertSchema = z.object({
  userId: z.string().nullable().optional(),
  rawMessage: z.string(),
  parsedIntent: queryIntentSchema,
  usedFallback: z.boolean(),
  isEmpty: z.boolean(),
  model: z.string(),
});

/*
 * SAVED SEARCH WIRE SCHEMAS (nested `intent` envelope on the API,
 * mapped to/from the normalized flat columns in intent.schema.ts)
 */
export const savedSearchInsertSchema = z.object({
  name: z.string().min(1).max(100),
  intent: queryIntentSchema,
});
export const savedSearchSelectSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  name: z.string().min(1).max(100),
  intent: queryIntentSchema,
  createdAt: z.date(),
});

export const intentRequestSchema = z.object({
  message: z.string().min(1).max(2000),
});

/*
 * TYPES
 */
export type QueryIntent = z.infer<typeof queryIntentSchema>;
export type IntentRequest = z.infer<typeof intentRequestSchema>;
export type IntentLog = z.infer<typeof intentLogSelectSchema>;
export type SavedSearch = z.infer<typeof savedSearchSelectSchema>;
export type SavedSearchRow = typeof userSavedSearchesSchema.$inferSelect;

export type RawIntentOutput = unknown;

/*
 * JOB PAYLOAD TYPES
 */
export type IntentDerivedPayload = {
  userId?: string;
  message: string;
  intent: QueryIntent;
  usedFallback: boolean;
};

export interface IntentJobMap {
  [IntentJobs.Derived]: IntentDerivedPayload;
}
