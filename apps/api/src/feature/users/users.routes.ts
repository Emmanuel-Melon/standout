import { Router } from "express";

import {
  HttpLocation,
  validateHttpRequest,
} from "@/middleware/http-request-validator";
import type { ApiManifest } from "@/routes/api.types";

import { UserControllers } from "./controllers/users.controller";
import { usersUpdateSchema } from "./users.types";

const usersRouter = Router();

usersRouter.get("/:id", UserControllers.getUserById);
usersRouter.delete("/:id", UserControllers.deleteUser);
usersRouter.patch(
  "/:id",
  validateHttpRequest(usersUpdateSchema, HttpLocation.Body),
  UserControllers.updateUser,
);

export const usersApi: ApiManifest = {
  path: "/v1/users",
  router: usersRouter,
};
