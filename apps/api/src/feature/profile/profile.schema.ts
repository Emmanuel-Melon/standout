import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(), // FK to your users/auth table
  name: text("name").notNull(),
  headline: text("headline"), // e.g. "Full-stack engineer, TypeScript"
  background: text("background"), // raw free-text, feeds intent extraction later
  locationPref: text("location_pref").default("any"), // "remote" | "onsite" | "hybrid" | "any"
  seniority: text("seniority").default("any"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const highlights = pgTable("highlights", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull(),
  title: text("title").notNull(), // "Built X, used by Y teams"
  description: text("description"),
  url: text("url"), // GitHub / demo / portfolio link
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  highlights: many(highlights),
}));

export const highlightsRelations = relations(highlights, ({ one }) => ({
  profile: one(profiles, {
    fields: [highlights.profileId],
    references: [profiles.id],
  }),
}));

export const combinedProfileSchema = {
  profiles,
  highlights,
  profilesRelations,
  highlightsRelations,
};
