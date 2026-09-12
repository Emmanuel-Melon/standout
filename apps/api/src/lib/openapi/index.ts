import { Request, RequestHandler, Response } from "express";
import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";

import { ivyiServers } from "@/config";

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
const registries = [expressRegistry];

const definitions = registries.flatMap((r) => r.definitions);
const generator = new OpenApiGeneratorV3(definitions);

export const openApiSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Ivyi Platform API",
    version: "1.0.0",
    description:
      "API documentation for Ivyi - The innovative platform that changes the way we gift each other! Whether it's a birthday, graduation, wedding, or any milestone worth celebrating, Ivyi handles everything on your behalf, making gifting effortless, thoughtful, and memorable.",
  },
  servers: ivyiServers,
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
