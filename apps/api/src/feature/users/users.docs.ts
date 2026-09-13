import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { HttpStatus } from "@/lib/http/http.status";
import {
  defineApiResource,
  registerJsonApiSchemas,
  registerRoutes,
} from "@/lib/openapi/openapi.core";
import type { PathDefinition } from "@/lib/openapi/openapi.types";

import { usersApi } from "./users.routes";
import {
  usersInsertSchema,
  usersSelectSchema,
  usersUpdateSchema,
} from "./users.types";

export const usersRegistry = new OpenAPIRegistry();

const userApiResource = defineApiResource({
  select: usersSelectSchema,
  insert: usersInsertSchema,
  update: usersUpdateSchema,
});

export const UserApiSchemas = registerJsonApiSchemas({
  registry: usersRegistry,
  resourceType: "user",
  pascalName: "User",
  schemas: userApiResource,
});

const userPaths: PathDefinition[] = [
  {
    handlerName: "getAllUsersController",
    method: "get",
    path: usersApi.path,
    summary: "Get all users",
    description: "Returns a collection list of users.",
    security: [{ bearerAuth: [] }],
    successStatus: HttpStatus.SUCCESS,
    successSchema: UserApiSchemas.colResSchema,
    errorCodes: [401],
  },
  {
    handlerName: "getUserByIdController",
    method: "get",
    path: `${usersApi.path}/{id}`,
    summary: "Get user by ID",
    description: "Returns a single user by their ID.",
    security: [{ bearerAuth: [] }],
    successStatus: HttpStatus.SUCCESS,
    successSchema: UserApiSchemas.singleResSchema,
    errorCodes: [401, 404],
  },
  {
    handlerName: "createUserController",
    method: "post",
    path: usersApi.path,
    summary: "Create user",
    description: "Registers a new user record profile.",
    security: [{ bearerAuth: [] }],
    requestBodySchema: usersInsertSchema,
    successStatus: HttpStatus.CREATED,
    successSchema: UserApiSchemas.singleResSchema,
    errorCodes: [400, 401, 409],
  },
  {
    handlerName: "updateUserController",
    method: "patch",
    path: `${usersApi.path}/{id}`,
    summary: "Update user",
    description:
      "Updates details inside an existing individual user profile entry.",
    security: [{ bearerAuth: [] }],
    requestBodySchema: usersUpdateSchema,
    successStatus: HttpStatus.SUCCESS,
    successSchema: UserApiSchemas.singleResSchema,
    errorCodes: [400, 401, 404],
  },
  {
    handlerName: "deleteUserController",
    method: "delete",
    path: `${usersApi.path}/{id}`,
    summary: "Delete user",
    description:
      "Permanently purges an individual user account profile node from active tables.",
    security: [{ bearerAuth: [] }],
    successStatus: HttpStatus.NO_CONTENT,
    errorCodes: [401, 404],
  },
];

registerRoutes({
  registry: usersRegistry,
  defaultTag: "Users v1",
  routes: userPaths,
});
