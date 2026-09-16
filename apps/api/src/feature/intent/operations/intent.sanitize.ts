import { intentExtractionConfig } from "../intent.config";
import {
  queryIntentSchema,
  type QueryIntent,
  type RawIntentOutput,
} from "../intent.types";

export function sanitizeIntent(raw: RawIntentOutput): QueryIntent {
  const result = queryIntentSchema.safeParse(raw);

  if (!result.success) {
    return intentExtractionConfig.fallbackIntent;
  }

  return result.data;
}

// true when sanitization stripped everything meaningful —
// signals the caller to fall back to Phase 0 baseline queries
export function isEmptyIntent(intent: QueryIntent): boolean {
  return (
    intent.roles.length === 0 &&
    intent.skills.length === 0 &&
    intent.locationKeywords.length === 0 &&
    intent.companyStage.length === 0
  );
}
