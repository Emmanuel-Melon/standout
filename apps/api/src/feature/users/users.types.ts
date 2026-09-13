import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { UserJobs } from "./users.config";
import { userRoleEnum, usersSchema } from "./users.schema";

extendZodWithOpenApi(z);

/*
 * DRIZZLE-GENERATED SCHEMAS (from PostgreSQL tables)
 */

export const usersSelectSchema = createSelectSchema(usersSchema)
  .omit({
    password: true,
  })
  .extend({
    sid: z.string().optional(),
  })
  .openapi({
    title: "User",
    description:
      "User response schema (excluding sensitive fields like password)",
  });

export const usersInsertSchema = createInsertSchema(usersSchema).openapi({
  title: "CreateUserRequest",
  description: "Request schema for creating a new user",
});

export const usersUpdateSchema = usersInsertSchema
  .omit({
    id: true,
    createdAt: true,
  })
  .partial()
  .openapi({
    title: "UpdateUserRequest",
    description: "Request schema for updating a user",
  });
  
export const authUserSelectSchema = createSelectSchema(usersSchema)
  .extend({
    sid: z.string().optional(),
  })
  .openapi({
    title: "User",
    description: "Authenticated user response",
  });

/*
 * DOMAIN-RELATED TYPES
 */
export type User = z.infer<typeof usersSelectSchema>;
export type NewUser = z.infer<typeof usersInsertSchema>;
export type UpdateUser = z.infer<typeof usersUpdateSchema>;
export type AuthUser = z.infer<typeof authUserSelectSchema>;
export type UserRole = (typeof userRoleEnum.enumValues)[number];

/*
 * DATABASE QUERY TYPES
 */
export type UserColumn = typeof usersSchema._.columns;
export type UserColumnKey = keyof UserColumn;

/*
 * QUEUE-RELATED TYPES
 */
export interface UserCreatedPayload {
  userId: string;
}

export interface UserJobMap {
  [UserJobs.UserCreated]: UserCreatedPayload;
}