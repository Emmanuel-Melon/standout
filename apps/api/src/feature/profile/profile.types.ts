import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { highlights, profiles } from "./profile.schema";

extendZodWithOpenApi(z);

/*
 * DRIZZLE-GENERATED SCHEMAS (from PostgreSQL tables)
 */
export const profileInsertSchema = createInsertSchema(profiles, {
  name: z.string().min(1).max(100),
  headline: z.string().max(150).optional(),
  background: z.string().max(2000).optional(),
  locationPref: z.enum(["remote", "onsite", "hybrid", "any"]).default("any"),
  seniority: z.enum(["junior", "mid", "senior", "any"]).default("any"),
});
export const profileSelectSchema = createSelectSchema(profiles);
export const profileUpdateSchema = profileInsertSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const highlightInsertSchema = createInsertSchema(highlights, {
  title: z.string().min(1).max(120),
  description: z.string().max(300).optional(),
  url: z.string().url().optional(),
});
export const highlightSelectSchema = createSelectSchema(highlights);

/*
 * DOMAIN-RELATED TYPES
 */
export type Profile = z.infer<typeof profileSelectSchema>;
export type Highlight = z.infer<typeof highlightSelectSchema>;
export type ProfileWithHighlights = Profile & { highlights: Highlight[] };

/*
 * DATABASE QUERY TYPES
 */
export type ProfileColumn = typeof profiles._.columns;
export type ProfileColumnKey = keyof ProfileColumn;
