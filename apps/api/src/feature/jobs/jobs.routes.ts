import { Router } from "express";

import {
  HttpLocation,
  validateHttpRequest,
} from "@/middleware/http-request-validator";
import type { ApiManifest } from "@/routes/api.types";

import { queryIntentSchema } from "../intent/intent.types";
import { JobSearchControllers } from "./controllers/jobs.controller";

const jobsRouter = Router();

jobsRouter.post(
  "/search",
  validateHttpRequest(queryIntentSchema, HttpLocation.Body),
  JobSearchControllers.searchJobs,
);

export const jobsApi: ApiManifest = {
  path: "/v1/jobs",
  router: jobsRouter,
};
