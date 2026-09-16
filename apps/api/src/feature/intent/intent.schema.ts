import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import {
  SearchLocationPrefs,
  SearchSeniorityLevels,
  type SearchLocationPref,
  type SearchSeniority,
} from "./intent.config";

export const intentLogsSchema = pgTable("intent_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"), // Optional for guest users
  rawMessage: text("raw_message").notNull(),
  parsedIntent: jsonb("parsed_intent").notNull(),
  usedFallback: boolean("used_fallback").notNull().default(false),
  isEmpty: boolean("is_empty").notNull().default(false),
  model: text("model").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSavedSearchesSchema = pgTable("user_saved_searches", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  roles: text("roles").array().notNull().default([]),
  skills: text("skills").array().notNull().default([]),
  locationPref: text("location_pref", {
    enum: SearchLocationPrefs,
  })
    .$type<SearchLocationPref>()
    .notNull()
    .default("any"),
  locationKeywords: text("location_keywords").array().notNull().default([]),
  companyStage: text("company_stage").array().notNull().default([]),
  seniority: text("seniority", {
    enum: SearchSeniorityLevels,
  })
    .$type<SearchSeniority>()
    .notNull()
    .default("any"),
  excludeKeywords: text("exclude_keywords").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const combinedIntentSchema = {
  intentLogsSchema,
  userSavedSearchesSchema,
};
