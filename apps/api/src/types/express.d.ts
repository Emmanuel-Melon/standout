import * as express from "express";

import type { User } from "../feature/users/users.types";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user: User | null;
      validated: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
        headers?: unknown;
      };
    }
  }
}

export {};
