import { logger } from "@/lib/logger";

import { initDLQWorker } from "./dlq/dlq.worker";
import { boss, PgBossQueueName } from "./index";

export const initPgBossQueues = async () => {
  await Promise.all([
    // Dead Letter Queue
    boss.createQueue(PgBossQueueName.DeadLetterQueue),
  ]);

  logger.info("📋 All PgBoss queues have been created.");
};

export const initPgBossWorkers = async () => {
  const workers = [
    // Dead Letter Queue
    initDLQWorker(),
  ];

  await Promise.all(workers.map((worker) => worker.start()));

  logger.info("👷 All PgBoss workers have been initialized.");
};
