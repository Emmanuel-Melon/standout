import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
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
