import { Router } from "express";

import { authApi } from "@/feature/auth/auth.routes";
import { usersApi } from "@/feature/users/users.routes";

import { useApiRouters } from "./api.access";

const apiRouter = Router();

useApiRouters(apiRouter, [usersApi, authApi]);

export default apiRouter;
