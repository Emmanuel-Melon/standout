import {
  boolean,
  date,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { timestamps } from "@/lib/drizzle/drizzle.common";

import { UserRole } from "../auth/auth.types";
import { UserRoleValues } from "./users.config";

export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);

export const usersSchema = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  emailVerifiedAt: timestamp("email_verified_at"),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),
  dob: date("dob"),

  role: text("role", {
    enum: UserRoleValues,
  })
    .$type<UserRole>()
    .notNull()
    .default("user"),

  avatarUrl: varchar("avatar_url", { length: 2048 }),

  isFirstLogin: boolean("is_first_login").default(true).notNull(),
  isOnboarded: boolean("is_onboarded").default(false).notNull(),

  // common schema fields
  ...timestamps,
});

export const combinedUsersSchema = {
  usersSchema,
};
