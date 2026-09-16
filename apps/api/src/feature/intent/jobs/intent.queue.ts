import { boss, PgBossQueueName } from "@/lib/pg-boss";
import { createPgBossQueue } from "@/lib/pg-boss/pgboss.core";

import type { IntentJobMap } from "../intent.types";

export const intentQueue = createPgBossQueue<IntentJobMap>(
  PgBossQueueName.IntentQueue,
  boss,
);
