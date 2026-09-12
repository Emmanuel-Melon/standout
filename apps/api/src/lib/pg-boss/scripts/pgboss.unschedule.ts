import { PgBoss } from "pg-boss";

import { dbConfig } from "@/config";
import { logger } from "@/lib/logger";

async function run() {
  const boss = new PgBoss(dbConfig.postgres.url);
  const args = process.argv.slice(2); // get all arguments after the script name

  if (args.length === 0) {
    logger.error(
      "Please provide schedule name(s) or --all: npm run pgboss:unschedule -- <name1> <name2> ... | --all",
    );
    process.exit(1);
  }

  await boss.start();

  try {
    // Check for --all flag
    if (args.includes("--all")) {
      const schedules = await boss.getSchedules();
      if (schedules.length === 0) {
        logger.info("No schedules to clear.");
      } else {
        const names = schedules.map((s) => s.name);
        await Promise.all(names.map((name) => boss.unschedule(name)));
        logger.info(
          { count: names.length, names },
          "✅ All schedules unscheduled",
        );
      }
    } else {
      // Treat each argument as a schedule name
      const names = args;
      await Promise.all(names.map((name) => boss.unschedule(name)));
      logger.info(
        { count: names.length, names },
        "✅ Specified schedules unscheduled",
      );
    }
  } catch (err) {
    logger.error(err, "Failed to unschedule");
  } finally {
    await boss.stop();
    process.exit(0);
  }
}

run();
