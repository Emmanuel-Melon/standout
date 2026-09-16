import { Router } from "express";

import { authApi } from "@/feature/auth/auth.routes";
import { intentApi } from "@/feature/intent/intent.routes";
import { usersApi } from "@/feature/users/users.routes";

import { useApiRouters } from "./api.access";

const apiRouter = Router();

useApiRouters(apiRouter, [authApi, intentApi, usersApi]);

export default apiRouter;
