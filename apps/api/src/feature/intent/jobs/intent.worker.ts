import { boss, PgBossQueueName } from "@/lib/pg-boss";
import { createPgBossWorker } from "@/lib/pg-boss/pgboss.core";
import type { JobHandlerMap } from "@/lib/pg-boss/pgboss.types";

import { IntentJobs } from "../intent.config";
import type { IntentJobMap } from "../intent.types";
import { IntentJobHandler } from "./intent.jobs";

const intentHandlers: JobHandlerMap<IntentJobMap> = {
  [IntentJobs.Derived]: async (payload) =>
    IntentJobHandler.derivedEvent(payload),
};

export const initIntentWorker = () =>
  createPgBossWorker<IntentJobMap>(
    boss,
    PgBossQueueName.IntentQueue,
    intentHandlers,
  );
