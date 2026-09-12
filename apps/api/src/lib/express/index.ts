import { Request, Response } from "express";

import { HttpStatus } from "@/lib/http/http.status";

import { asyncHandler } from "./express.async-handler";
import {
  healthCheckSerializerConfig,
  welcomeResponseSerializerConfig,
} from "./express.config";
import { sendSuccessResponse } from "./express.response";
import type { HealthCheckResponse, WelcomeResponse } from "./express.types";

// Health check endpoint
export const healthCheck = asyncHandler(async (req: Request, res: Response) => {
  const response: HealthCheckResponse = {
    status: "healthy",
    message: "Server is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    services: {
      database: "connected", // In a real implementation, you'd check actual DB connection
    },
  };

  sendSuccessResponse(
    req,
    res,
    {
      data: response,
      serializerConfig: healthCheckSerializerConfig,
      type: "single",
    },
    { status: HttpStatus.SUCCESS },
  );
});

// Root route endpoint
export const rootRoute = asyncHandler(async (req: Request, res: Response) => {
  const response: WelcomeResponse = {
    message: "Ivyi API Server",
    documentation: "/api-docs",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      apiDocs: "/api-docs",
      apiBase: "/api",
    },
    status: "healthy",
    version: process.env.npm_package_version || "1.0.0",
  };

  sendSuccessResponse(
    req,
    res,
    {
      data: response,
      serializerConfig: welcomeResponseSerializerConfig,
      type: "single",
    },
    { status: HttpStatus.SUCCESS },
  );
});
