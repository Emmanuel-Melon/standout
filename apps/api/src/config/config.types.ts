import { z } from "zod";

// Server Configuration
export const ServerEndpointsSchema = z.object({
  api: z.string().min(1, "API endpoint is required"),
  docs: z.string().min(1, "Docs endpoint is required"),
  openApiSpec: z.string().min(1, "OpenAPI spec endpoint is required"),
  health: z.string().min(1, "Health check endpoint is required"),
});

export const AuthConfigSchema = z.object({
  jwtSecret: z.string().min(1, "JWT_SECRET is required"),
  jwtRefreshSecret: z.string().min(1, "JWT_REFRESH_SECRET is required"),
});

export const ServerConfigSchema = z.object({
  port: z.number().int().min(1).max(65535),
  env: z.string().min(1, "Environment is required"),
  isProduction: z.boolean(),
  isDevelopment: z.boolean(),
  hostname: z.string().min(1, "Hostname is required"),
  protocol: z.enum(["http", "https"]),
  baseUrl: z.string().url("Base URL must be a valid URL"),
  endpoints: ServerEndpointsSchema,
  corsOrigins: z.preprocess(
    (val) =>
      typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
    z
      .array(z.string().url())
      .default(["http://localhost:5173", "http://localhost:5174"]),
  ),
  shutdownTimeout: z.number().int().min(0),
  trustProxy: z.union([z.string(), z.number()]),
  environment: z.string(),
  cookieDomains: z.preprocess(
    (val) =>
      typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
    z.array(z.string()).default(["localhost"]),
  ),
  clientUrls: z.preprocess(
    (val) =>
      typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
    z.array(z.string().url()).default(["http://localhost:5173"]),
  ),
});

// Database Configuration
export const PostgresConfigSchema = z.object({
  url: z.string().url("PostgreSQL URL must be a valid URL"),
});

export const DatabaseConfigSchema = z.object({
  postgres: PostgresConfigSchema,
});

// Infrastructure Configuration
export const LokiConfigSchema = z.object({
  host: z.string().url().default("http://localhost:3100"),
  labels: z.record(z.string(), z.string()).default({ app: "my-api" }),
  batching: z.boolean().default(true),
});

export const InfraConfigSchema = z.object({
  loki: LokiConfigSchema.optional(),
});

export const AlertsConfigSchema = z.object({
  senderEmail: z.string().email().default("alerts@yourdomain.com"),
  senderName: z.string().default("System Monitor"),
  engineeringEmail: z
    .string()
    .email()
    .default("engineering-alerts@yourdomain.com"),
});

// Type definitions
export type IServerEndpoints = z.infer<typeof ServerEndpointsSchema>;
export type IServerConfig = z.infer<typeof ServerConfigSchema>;
export type IDatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type IAuthConfig = z.infer<typeof AuthConfigSchema>;
export type IInfraConfig = z.infer<typeof InfraConfigSchema>;
export type IAlertsConfig = z.infer<typeof AlertsConfigSchema>;
