import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import app from "@/app";
import { logger } from "@/lib/logger";
import { initPgBoss } from "@/lib/pg-boss";

import { serverConfig } from "./config";
import { runMigrations } from "./lib/drizzle/drizzle.migrations";
import { gracefulShutdown } from "./lib/express/express.server";
import { initPgBossQueues, initPgBossWorkers } from "./lib/pg-boss/pgboss.init";

extendZodWithOpenApi(z);

const startServer = async () => {
  try {
    // await runMigrations();
    await initPgBoss(); // Ensure tables exist first
    await Promise.all([initPgBossWorkers(), initPgBossQueues()]);

    const server = app.listen(serverConfig.port, serverConfig.hostname, () => {
      const baseUrl = `http://${serverConfig.hostname}:${serverConfig.port}`;
      logger.info("\n🔗 Available Endpoints:");
      logger.info(`  🌐 API: ${baseUrl}`);
      logger.info(`  📚 Documentation: ${baseUrl}/api-docs`);
      logger.info(`  📄 OpenAPI Spec: ${baseUrl}/api-docs.json`);
    });
  } catch (err) {
    logger.error({ err }, "Failed to start:");
    process.exit(1);
  }
};

startServer();

export default app;

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
