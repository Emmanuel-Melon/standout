import { JsonApiResourceConfig } from "@/lib/express/express.types";

import type { User } from "./users.types";

/*
 * SERIALIZER CONFIGURATIONS
 */
export const SerializedUser: JsonApiResourceConfig<User> = {
  type: "user",
  attributes: (user: User) => user,
};

/*
 * JOB CONFIGURATIONS & TYPES
 */
export const UserJobs = {
  UserCreated: "user-created",
} as const;

export type UsersJobType = (typeof UserJobs)[keyof typeof UserJobs];

/*
 * USER ROLES & VALUES
 */
export const UserRoles = {
  USER: "user" as const,
  ADMIN: "admin" as const,
} as const;

export const UserRoleValues = Object.values(UserRoles) as [string, ...string[]];
