import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { HttpStatus } from "@/lib/http/http.status";
import {
  defineApiResource,
  registerJsonApiSchemas,
  registerRoutes,
} from "@/lib/openapi/openapi.core";
import type { PathDefinition } from "@/lib/openapi/openapi.types";

import { profileApi } from "./profile.routes";
import { profileSelectSchema, profileUpdateSchema } from "./profile.types";

export const profileRegistry = new OpenAPIRegistry();

const profileApiResource = defineApiResource({
  select: profileSelectSchema,
  update: profileUpdateSchema,
});

export const ProfileApiSchemas = registerJsonApiSchemas({
  registry: profileRegistry,
  resourceType: "profile",
  pascalName: "Profile",
  schemas: profileApiResource,
});

const profilePaths: PathDefinition[] = [
  {
    handlerName: "ProfileControllers.getProfile",
    method: "get",
    path: `${profileApi.path}/{id}`,
    summary: "Get profile by ID",
    description: "Returns a user profile",
    security: [{ bearerAuth: [] }],
    successStatus: HttpStatus.SUCCESS,
    successSchema: ProfileApiSchemas.singleResSchema,
    errorCodes: [401, 403, 404],
  },
];

registerRoutes({
  registry: profileRegistry,
  defaultTag: "Profile v1",
  routes: profilePaths,
});
