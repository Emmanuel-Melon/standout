import dotenv from "dotenv";

import {
  AlertsConfigSchema,
  AuthConfigSchema,
  CookieConfigSchema,
  DatabaseConfigSchema,
  InfraConfigSchema,
  ServerConfigSchema,
  type IAlertsConfig,
  type IAuthConfig,
  type ICookieconfig,
  type IDatabaseConfig,
  type IInfraConfig,
  type IServerConfig,
} from "./config.types";

dotenv.config();

// Server Configuration
export const serverConfig = ServerConfigSchema.parse({
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV !== "production",
  jwtSecret: process.env.JWT_SECRET,
  hostname: process.env.HOSTNAME || "localhost",
  protocol: process.env.NODE_ENV === "production" ? "https" : "http",
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  endpoints: {
    api: "/api",
    docs: "/docs",
    openApiSpec: "/api-docs",
    health: "/health",
  },
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : undefined, // Will use defaults from schema
  shutdownTimeout: 5000,
  trustProxy: process.env.TRUST_PROXY || "loopback",
  environment:
    process.env.NODE_ENV === "production" ? "production" : "development",
  cookieDomains: process.env.COOKIE_DOMAINS
    ? process.env.COOKIE_DOMAINS.split(",")
        .map((domain) => domain.trim())
        .filter(Boolean)
    : undefined, // Will use defaults from schema
  clientUrls: process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(",")
        .map((url) => url.trim())
        .filter(Boolean)
    : undefined, // Will use defaults from schema
  partnerClientUrls: process.env.PARTNER_CLIENT_URLS
    ? process.env.PARTNER_CLIENT_URLS.split(",")
        .map((url) => url.trim())
        .filter(Boolean)
    : undefined, // Will use defaults from schema
}) satisfies IServerConfig;

// Database Configuration
export const dbConfig = DatabaseConfigSchema.parse({
  postgres: {
    url:
      process.env.DATABASE_URL || "postgres://postgres@localhost:5432/postgres",
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    url: process.env.REDIS_URL,
  },
}) satisfies IDatabaseConfig;

export const infraConfig = InfraConfigSchema.parse({
  loki: {
    host: process.env.LOKI_HOST ?? "http://127.0.0.1:3100",
    labels: { app: "my-api" },
    batching: process.env.LOKI_BATCHING !== "false",
  },
}) satisfies IInfraConfig;

export const cookieConfig = CookieConfigSchema.parse({
  cookieDomains: process.env.COOKIE_DOMAINS
    ? process.env.COOKIE_DOMAINS.split(",").map((s) => s.trim())
    : undefined,
  cookieSecure:
    process.env.COOKIE_SECURE === "true"
      ? true
      : process.env.COOKIE_SECURE === "false"
        ? false
        : undefined,
  cookieSameSite: process.env.COOKIE_SAME_SITE as
    "lax" | "strict" | "none" | undefined,
}) satisfies ICookieconfig;

export const authConfig = AuthConfigSchema.parse({
  isProduction: process.env.NODE_ENV === "production",
  cookieDomains: serverConfig.cookieDomains,
  issuer: process.env.AUTH_ISSUER || "auth-service",
  secrets: {
    jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
    jwtRefreshSecret:
      process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? "dev-secret",
    joseSecret: new TextEncoder().encode(
      process.env.JWT_JOSE_SECRET ?? process.env.JWT_SECRET ?? "dev-secret",
    ),
  },
  audience: {
    USER: process.env.AUDIENCE_USER || "app-user",
    ADMIN: process.env.AUDIENCE_ADMIN || "app-admin",
  },
  tokens: {
    access: "access",
    refresh: "refresh",
  },
  timing: {
    accessExpiration: 60 * 60 * 1000,
    refreshExpiration: 30 * 24 * 60 * 60 * 1000,
  },
}) satisfies IAuthConfig;

export const alertsConfig = AlertsConfigSchema.parse({
  senderEmail: process.env.ALERTS_SENDER_EMAIL ?? "alerts@yourdomain.com",
  senderName: process.env.ALERTS_SENDER_NAME ?? "System Monitor",
  engineeringEmail:
    process.env.ENGINEERING_ALERTS_EMAIL ?? "engineering-alerts@yourdomain.com",
}) satisfies IAlertsConfig;

const config = {
  alerts: alertsConfig,
  auth: authConfig,
  db: dbConfig,
  infrastructure: infraConfig,
  server: serverConfig,
};

// Export everything
export { config };
export default config;

// Environment
export const isDev = process.env.NODE_ENV !== "production";

// API Servers
export const standoutServers = [
  {
    url: `http://localhost:${serverConfig.port}${serverConfig.endpoints.api}`,
    description: "Local development server",
  },
];
