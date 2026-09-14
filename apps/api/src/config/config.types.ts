import { z } from "zod";

// Server Configuration
export const ServerEndpointsSchema = z.object({
  api: z.string().min(1, "API endpoint is required"),
  docs: z.string().min(1, "Docs endpoint is required"),
  openApiSpec: z.string().min(1, "OpenAPI spec endpoint is required"),
  health: z.string().min(1, "Health check endpoint is required"),
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
  jwtSecret: z.string().optional(),
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

export const CookieConfigSchema = z.object({
  cookieDomains: z.preprocess(
    (val) =>
      typeof val === "string" ? val.split(",").map((s) => s.trim()) : val,
    z.array(z.string()).default(["localhost"]),
  ),
  cookieSecure: z.preprocess(
    (val) => (val === "true" ? true : val === "false" ? false : undefined),
    z.boolean().optional(),
  ),
  cookieSameSite: z.enum(["lax", "strict", "none"]).optional(),
});

export const AlertsConfigSchema = z.object({
  senderEmail: z.string().email().default("alerts@yourdomain.com"),
  senderName: z.string().default("System Monitor"),
  engineeringEmail: z
    .string()
    .email()
    .default("engineering-alerts@yourdomain.com"),
});

export const AuthConfigSchema = z.object({
  isProduction: z.boolean().default(process.env.NODE_ENV === "production"),
  cookieDomains: z
    .array(z.string())
    .default(
      process.env.COOKIE_DOMAINS?.split(",").map((s) => s.trim()) || [
        "localhost",
      ],
    ),
  issuer: z.string().default(process.env.AUTH_ISSUER || "auth-service"),
  secrets: z.object({
    jwtSecret: z.string(),
    jwtRefreshSecret: z.string(),
    joseSecret: z.instanceof(Uint8Array),
  }),
  audience: z
    .object({
      USER: z.string().default(process.env.AUDIENCE_USER || "app-user"),
      ADMIN: z.string().default(process.env.AUDIENCE_ADMIN || "app-admin"),
    })
    .default({
      USER: process.env.AUDIENCE_USER || "app-user",
      ADMIN: process.env.AUDIENCE_ADMIN || "app-admin",
    }),
  tokens: z
    .object({
      access: z.literal("access").default("access"),
      refresh: z.literal("refresh").default("refresh"),
    })
    .default({ access: "access", refresh: "refresh" }),
  timing: z
    .object({
      accessExpiration: z.number().default(60 * 60 * 1000), // 1 hour in MS
      refreshExpiration: z.number().default(30 * 24 * 60 * 60 * 1000), // 30 days in MS
    })
    .default({
      accessExpiration: 60 * 60 * 1000,
      refreshExpiration: 30 * 24 * 60 * 60 * 1000,
    }),
});

export const OllamaConfigSchema = z.object({
  url: z.string().url("Ollama URL must be a valid URL"),
  model: z.string().optional(),
});

export const StorageConfigSchema = z.object({
  dir: z.string().min(1, "Storage directory is required"),
  maxUploadMb: z.number().int().positive(),
});

export const embeddingConfigSchema = z.object({
  model: z.string().default("nomic-embed-text"),
  dimensions: z.coerce.number().default(768),
  ollamaBaseUrl: z.string().default("http://localhost:11434"),
  // "chroma" | "pgvector" | "dual" — dual writes both, reads from primaryStore
  writeMode: z.enum(["chroma", "pgvector", "dual"]).default("pgvector"),
  primaryStore: z.enum(["chroma", "pgvector"]).default("pgvector"),
  // How often (ms) the shadow-write replay job runs when writeMode is "dual"
  replayIntervalMs: z.coerce.number().int().positive().default(300_000),
});

// Grouped Schemas
export const LLMConfigSchema = z.object({
  ollama: OllamaConfigSchema,
});

// Type definitions
export type IServerEndpoints = z.infer<typeof ServerEndpointsSchema>;
export type IServerConfig = z.infer<typeof ServerConfigSchema>;
export type IDatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type IAuthConfig = z.infer<typeof AuthConfigSchema>;
export type IInfraConfig = z.infer<typeof InfraConfigSchema>;
export type IAlertsConfig = z.infer<typeof AlertsConfigSchema>;
export type ICookieconfig = z.infer<typeof CookieConfigSchema>;
export type IOllamaConfig = z.infer<typeof OllamaConfigSchema>;
export type IStorageConfig = z.infer<typeof StorageConfigSchema>;
export type IEmbeddingConfig = z.infer<typeof embeddingConfigSchema>;
export type ILLMConfig = z.infer<typeof LLMConfigSchema>;
