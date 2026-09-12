import { PgBoss } from "pg-boss";

import { dbConfig } from "@/config";
import { logger } from "@/lib/logger";

async function inspect(target: string) {
  const boss = new PgBoss(dbConfig.postgres.url);

  try {
    await boss.start();

    if (target === "queues") {
      const queues = await boss.getQueues();
      logger.info({ queues }, "📋 Current queues");
      console.log(queues); // also plain output for easy reading
    } else if (target === "schedules") {
      const schedules = await boss.getSchedules();
      logger.info({ schedules }, "📅 Current schedules");
      console.log(schedules);
    } else {
      console.error('Please specify "queues" or "schedules".');
      process.exit(1);
    }
  } catch (err) {
    logger.error(err, `Failed to inspect ${target}`);
  } finally {
    await boss.stop();
    process.exit(0);
  }
}

// Get the target from command line arguments
const target = process.argv[2];
if (!target) {
  console.error("Usage: npm run inspect <queues|schedules>");
  process.exit(1);
}

inspect(target);
