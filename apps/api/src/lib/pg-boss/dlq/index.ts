import { boss, PgBossQueueName } from "@/lib/pg-boss";

import { createPgBossQueue } from "../pgboss.core";
import type { DLQJobMap } from "../pgboss.types";

export const DLQJobs = {
  DeadLetter: "dead-letter",
} as const;

export const dlqQueue = createPgBossQueue<DLQJobMap>(
  PgBossQueueName.DeadLetterQueue,
  boss,
);

export { buildDeadLetterPayload } from "./dlq.utils";
