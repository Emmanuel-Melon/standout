import type { PgBossQueueName } from "@/lib/pg-boss";

import type { DeadLetterPayload } from "../pgboss.types";

interface MoveToDLQParams {
  queueName: PgBossQueueName;
  jobId: string;
  event: string;
  payload: unknown;
  error: Error;
  correlationId?: string;
  // Inject the enqueue function to avoid circular deps
  enqueue: (payload: DeadLetterPayload) => Promise<void>;
}

export const buildDeadLetterPayload = ({
  queueName,
  jobId,
  event,
  payload,
  error,
  correlationId,
}: Omit<MoveToDLQParams, "enqueue">): DeadLetterPayload => ({
  originalQueue: queueName,
  originalJobId: jobId,
  event,
  payload,
  error: {
    message: error.message,
    name: error.name,
    stack: error.stack,
  },
  retryCount: 0,
  failedAt: new Date().toISOString(),
  correlationId,
});
