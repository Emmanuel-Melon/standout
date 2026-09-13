import { Router } from "express";

import { ApiManifest } from "@/routes/api.types";

import { ProfileControllers } from "./controllers/profile.controller";

const profileRouter = Router();

profileRouter.get("/:id", ProfileControllers.getProfile);

export const profileApi: ApiManifest = {
  router: profileRouter,
  path: "/v1/profile",
};
