import type { Request, RequestHandler, Response } from "express";
import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";

import { standoutServers } from "@/config";
import { profileRegistry } from "@/feature/profile/profile.docs";

import { expressRegistry } from "../express/express.schema";

extendZodWithOpenApi(z);

const securityRegistry = new OpenAPIRegistry();
securityRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "JWT Bearer token for authentication",
});

// Combine all registries
const registries = [expressRegistry, profileRegistry, securityRegistry];

const definitions = registries.flatMap((r) => r.definitions);
const generator = new OpenApiGeneratorV3(definitions);

export const openApiSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Standout Platform API",
    version: "1.0.0",
    description:
      "API documentation for Standout - The professional profile and career highlight platform.",
  },
  servers: standoutServers,
});

// Serve raw JSON
export const rawJSONDocs = (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.json(openApiSpec);
};

// Setup Swagger UI
export const swaggerSetup = () => {
  return [
    swaggerUi.serve as unknown as RequestHandler,
    swaggerUi.setup(openApiSpec, {
      explorer: true,
      customCss: ".swagger-ui .info { margin: 20px 0 }",
    }) as unknown as RequestHandler,
  ] as RequestHandler[];
};
