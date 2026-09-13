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
