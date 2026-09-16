import type { JsonApiResourceConfig } from "@/lib/express/express.types";

import type { QueryIntent, SavedSearch } from "./intent.types";

/*
 * JOB EVENTS
 */
export const IntentJobs = {
  Derived: "intent-derived",
} as const;

/*
 * EXTRACTION CONFIG
 */
export const intentExtractionConfig = {
  model: "claude-sonnet-4-6",
  maxRetries: 1,
  fallbackIntent: {
    roles: [],
    skills: [],
    locationPref: "any",
    locationKeywords: [],
    companyStage: [],
    seniority: "any",
    excludeKeywords: [],
  } satisfies QueryIntent,
};

/*
 * SAVED SEARCH ENUM VALUES
 */
export const SearchLocationPrefs = [
  "remote",
  "onsite",
  "hybrid",
  "any",
] as const;
export type SearchLocationPref = (typeof SearchLocationPrefs)[number];

export const SearchSeniorityLevels = [
  "junior",
  "mid",
  "senior",
  "any",
] as const;
export type SearchSeniority = (typeof SearchSeniorityLevels)[number];

/*
 * SERIALIZER CONFIGURATIONS
 */
export const SerializedIntent: JsonApiResourceConfig<QueryIntent> = {
  type: "intent",
  attributes: (intent: QueryIntent) => intent,
};

export const SerializedSavedSearch: JsonApiResourceConfig<SavedSearch> = {
  type: "saved-search",
  attributes: (savedSearch: SavedSearch) => ({
    id: savedSearch.id,
    userId: savedSearch.userId,
    name: savedSearch.name,
    intent: savedSearch.intent,
    createdAt: savedSearch.createdAt,
  }),
};
