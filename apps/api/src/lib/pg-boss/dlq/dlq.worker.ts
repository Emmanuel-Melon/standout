import { DLQJobs } from ".";

import { logger } from "@/lib/logger";
import { boss, PgBossQueueName } from "@/lib/pg-boss";

import { createPgBossWorker } from "../pgboss.core";
import type { DLQJobMap, JobHandlerMap } from "../pgboss.types";

const dlqHandlers: JobHandlerMap<DLQJobMap> = {
  [DLQJobs.DeadLetter]: async (payload) => {
    logger.fatal(
      {
        originalQueue: payload.originalQueue,
        originalJobId: payload.originalJobId,
        event: payload.event,
        error: payload.error,
        retryCount: payload.retryCount,
      },
      "🚨 JOB PERMANENTLY FAILED – moved to DLQ",
    );
  },
};

export const initDLQWorker = () =>
  createPgBossWorker<DLQJobMap>(
    boss,
    PgBossQueueName.DeadLetterQueue,
    dlqHandlers,
  );
