import express, { Application } from "express";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import { healthCheck, rootRoute } from "@/lib/express";
import { rawJSONDocs, swaggerSetup } from "@/lib/openapi";
import { apiRouter } from "@/routes/api.routes";

import { corsMiddleware } from "./cors";
import { globalErrorHandler } from "./errors";
import { requestLogger } from "./http-request-logger";
import { requestMetadata } from "./http-request-metadata";
import { limiter } from "./rate-limiter";

export function initializeMiddlewares(app: Application): void {
  // global middleware
  app.use(corsMiddleware);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.static("public"));

  // Basic endpoints
  app.get("/health", healthCheck);
  app.get("/", rootRoute);

  // API DOCUMENTATION
  app.use("/api-docs", swaggerUi.serve, swaggerSetup());
  // Raw JSON schema endpoint
  app.get("/api-docs.json", rawJSONDocs);

  // Request logging
  app.use(requestMetadata);
  app.use(requestLogger);

  // Rate limiting
  // app.use(limiter);

  // API routes
  app.use("/api", apiRouter);

  // Error handler
  app.use(globalErrorHandler);
}
