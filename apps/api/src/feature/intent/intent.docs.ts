import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import { HttpStatus } from "@/lib/http/http.status";
import {
  defineApiResource,
  registerJsonApiSchemas,
  registerRoutes,
} from "@/lib/openapi/openapi.core";
import type { PathDefinition } from "@/lib/openapi/openapi.types";

import { intentApi } from "./intent.routes";
import {
  intentRequestSchema,
  queryIntentSchema,
  savedSearchInsertSchema,
  savedSearchSelectSchema,
} from "./intent.types";

export const intentRegistry = new OpenAPIRegistry();

// intent has no `update` path — it's a single derived action, not a
// persisted CRUD resource, so `select`/`insert` cover the full shape
const intentApiResource = defineApiResource({
  select: queryIntentSchema,
  insert: intentRequestSchema,
});

const savedSearchApiResource = defineApiResource({
  select: savedSearchSelectSchema,
  insert: savedSearchInsertSchema,
});

export const IntentApiSchemas = registerJsonApiSchemas({
  registry: intentRegistry,
  resourceType: "intent",
  pascalName: "Intent",
  schemas: intentApiResource,
});

export const SavedSearchApiSchemas = registerJsonApiSchemas({
  registry: intentRegistry,
  resourceType: "saved-search",
  pascalName: "SavedSearch",
  schemas: savedSearchApiResource,
});

const intentPaths: PathDefinition[] = [
  {
    handlerName: "deriveIntentController",
    method: "post",
    path: intentApi.path,
    summary: "Derive job-search intent",
    description:
      "Extracts a structured job-search intent (roles, skills, location, seniority) from a free-text chat message via LLM structured output, then validates and sanitizes it server-side before returning.",
    security: [{ bearerAuth: [] }],
    requestBodySchema: intentRequestSchema,
    successStatus: HttpStatus.SUCCESS,
    successSchema: IntentApiSchemas.singleResSchema,
    errorCodes: [400, 401],
  },
  {
    handlerName: "saveSearchController",
    method: "post",
    path: `${intentApi.path}/saved`,
    summary: "Save user search intent",
    description:
      "Persists a structured job-search intent against the authenticated user account with a custom display name.",
    security: [{ bearerAuth: [] }],
    requestBodySchema: savedSearchInsertSchema,
    successStatus: HttpStatus.CREATED,
    successSchema: SavedSearchApiSchemas.singleResSchema,
    errorCodes: [400, 401],
  },
  {
    handlerName: "listSavedSearchesController",
    method: "get",
    path: `${intentApi.path}/saved`,
    summary: "List user saved search intents",
    description:
      "Retrieves all saved job-search intent records associated with the authenticated user.",
    security: [{ bearerAuth: [] }],
    successStatus: HttpStatus.SUCCESS,
    successSchema: SavedSearchApiSchemas.colResSchema,
    errorCodes: [401],
  },
];

registerRoutes({
  registry: intentRegistry,
  defaultTag: "Intent v1",
  routes: intentPaths,
});
