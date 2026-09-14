import { Router } from "express";

import {
  HttpLocation,
  validateHttpRequest,
} from "@/middleware/http-request-validator";
import { useAuthentication } from "@/routes/api.access";
import type { ApiManifest } from "@/routes/api.types";

import { loginRequestSchema, registerRequestSchema } from "./auth.types";
import { getMeController } from "./controllers/get-me.controller";
import { loginController } from "./controllers/login.controller";
import { logoutController } from "./controllers/logout.controller";
import { signupController } from "./controllers/singup.controller";

export const authRouter = Router();

useAuthentication(authRouter, ["/me", "/logout"]);

authRouter.post(
  "/register",
  validateHttpRequest(registerRequestSchema, HttpLocation.Body),
  signupController,
);
authRouter.post(
  "/login",
  validateHttpRequest(loginRequestSchema, HttpLocation.Body),
  loginController,
);
authRouter.post("/logout", logoutController);
authRouter.get("/me", getMeController);

export const authApi: ApiManifest = {
  router: authRouter,
  path: "/v1/auth",
  isPrivate: false,
};
