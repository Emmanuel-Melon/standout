import { usersApi } from "@/feature/users/users.routes";

import { useApiRouters } from "./api.access";
import { apiRouter } from "./api.routes";

useApiRouters(apiRouter, [usersApi]);

export default apiRouter;
