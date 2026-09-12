import fs from "fs";
import path from "path";
import { db } from ".";
import { migrate } from "drizzle-orm/node-postgres/migrator";

import { logger } from "@/lib/logger";

export const runMigrations = async () => {
  logger.info(`process.cwd(): ${process.cwd()}`);
  logger.info(
    `Looking for migrations in: ${path.join(process.cwd(), "drizzle")}`,
  );
  if (process.env.NODE_ENV === "production") {
    logger.warn(
      "Skipping auto-migration in production. Run migrations manually during deploy.",
    );
    return;
  }

  try {
    logger.info("Running migrations...");
    const migrationsPath = path.join(process.cwd(), "drizzle");
    logger.info(`Migrations folder exists: ${fs.existsSync(migrationsPath)}`);
    logger.info(`Files: ${fs.readdirSync(migrationsPath)}`);
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });
    logger.info("Migrations complete.");
  } catch (error) {
    logger.error({ error }, "Migrations failed:");
    throw error;
  }
};
