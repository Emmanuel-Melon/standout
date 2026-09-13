import { JsonApiResourceConfig } from "@/lib/express/express.types";

import type { User } from "./users.types";

export const SerializedUser: JsonApiResourceConfig<User> = {
  type: "user",
  attributes: (user: User) => user,
};

export const UserJobs = {
  UserCreated: "user-created",
} as const;

export type UsersJobType = (typeof UserJobs)[keyof typeof UserJobs];

export const UserRoles = {
  USER: "user" as const,
  ADMIN: "admin" as const,
} as const;

export const UserRoleValues = Object.values(UserRoles) as [string, ...string[]];
