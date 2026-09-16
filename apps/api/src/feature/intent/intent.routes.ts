import { Router } from "express";

import {
  HttpLocation,
  validateHttpRequest,
} from "@/middleware/http-request-validator";
import type { ApiManifest } from "@/routes/api.types";

import { IntentControllers } from "./controllers/intent.controller";
import { intentRequestSchema, savedSearchInsertSchema } from "./intent.types";

const intentRouter = Router();

intentRouter.post("/", IntentControllers.deriveIntent);

intentRouter.post("/saved", IntentControllers.saveSearch);

intentRouter.get("/saved", IntentControllers.listSavedSearches);

export const intentApi: ApiManifest = {
  path: "/v1/intent",
  router: intentRouter,
};
