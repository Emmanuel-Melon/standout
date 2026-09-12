import path from "path";
import { glob } from "glob";

import { logger } from "@/lib/logger";

import { runMigrations } from "./drizzle.migrations";

export const randomElement = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

// 👇 Define the exact execution order for foundational tables
const SEED_PRIORITY = [
  "gifts.seed.ts",
  "classifier.seed.ts",
  "partners.seed.ts",
];

async function main() {
  try {
    logger.info("🚀 Starting Global Database Seed...");

    await runMigrations();

    const seedFiles = await glob(
      "{src/feature/**,src/workflows/**}/*.seed.ts",
      {
        absolute: true,
      },
    );

    const sortedSeeds = seedFiles.sort((a, b) => {
      const aBase = path.basename(a);
      const bBase = path.basename(b);

      const aIndex = SEED_PRIORITY.indexOf(aBase);
      const bIndex = SEED_PRIORITY.indexOf(bBase);

      // If both are in the priority list, sort by their priority position
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      // If only 'a' is prioritized, it goes first
      if (aIndex !== -1) return -1;
      // If only 'b' is prioritized, it goes first
      if (bIndex !== -1) return 1;

      // Fallback to standard alphabetical sort for everything else
      return aBase.localeCompare(bBase);
    });

    for (const filePath of sortedSeeds) {
      const module = await import(`file://${filePath}`);

      const seedFunctionName = Object.keys(module).find((key) =>
        key.startsWith("seed"),
      );

      if (seedFunctionName && typeof module[seedFunctionName] === "function") {
        await module[seedFunctionName]();
      } else {
        logger.warn(`⚠️ No seed function found in ${path.basename(filePath)}`);
      }
    }

    logger.info("\n🎉 All seeds completed successfully!");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "\n💥 Global seeding failed:");
    process.exit(1);
  }
}

main();
