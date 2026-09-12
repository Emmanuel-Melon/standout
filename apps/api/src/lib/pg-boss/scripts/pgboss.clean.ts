import { PgBoss } from "pg-boss";

import { dbConfig } from "@/config";
import { logger } from "@/lib/logger";

async function clearAll() {
  const boss = new PgBoss(dbConfig.postgres.url);

  try {
    await boss.start();

    // 1. Wipe all jobs
    await boss.deleteAllJobs();

    // 2. Wipe all schedules
    const schedules = await boss.getSchedules();
    await Promise.all(schedules.map((s) => boss.unschedule(s.name)));

    logger.info("💥 All PgBoss jobs and schedules cleared successfully");
  } catch (err) {
    logger.error(err, "Failed to clear PgBoss data");
  } finally {
    await boss.stop();
    process.exit(0);
  }
}

clearAll();
