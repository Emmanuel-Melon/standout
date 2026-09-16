import type { SavedSearch, SavedSearchRow } from "../intent.types";

export const toSavedSearch = (row: SavedSearchRow): SavedSearch => ({
  id: row.id,
  userId: row.userId,
  name: row.name,
  intent: {
    roles: row.roles,
    skills: row.skills,
    locationPref: row.locationPref,
    locationKeywords: row.locationKeywords,
    companyStage: row.companyStage,
    seniority: row.seniority,
    excludeKeywords: row.excludeKeywords,
  },
  createdAt: row.createdAt,
});
