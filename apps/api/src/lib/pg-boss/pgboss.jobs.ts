import { performance } from "perf_hooks";

import { logger } from "@/lib/logger";
import { boss } from "@/lib/pg-boss";

import { buildDeadLetterPayload } from "./dlq/dlq.utils";
import { JobError } from "./pgboss.error";
import type {
  BossEventOptions,
  BossJobContext,
  ScheduleJobOptions,
} from "./pgboss.types";

export async function processBossJob<T>(
  context: BossJobContext,
  action: () => Promise<T>,
  options: BossEventOptions = {},
) {
  const { metadata = {} } = options;
  const { label, entityId } = context;
  const startTime = performance.now();

  logger.info({ ...metadata, entityId, label }, `[JOB START] ${label}`);

  try {
    const result = await action();
    const duration = Math.round(performance.now() - startTime);

    logger.info(
      { ...metadata, entityId, label, durationMs: duration },
      `[JOB SUCCESS] ${label} completed in ${duration}ms`,
    );
    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    const isJobError = error instanceof JobError;

    // Extract structured data from our custom error
    const shouldRetry = isJobError ? error.shouldRetry : true;
    const errorMeta = isJobError ? error.meta : {};

    logger.error(
      {
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : error,
        ...metadata,
        ...errorMeta,
        entityId,
        label,
        durationMs: duration,
        shouldRetry,
        isPermanentFailure: !shouldRetry,
      },
      `[JOB FAILURE] ${label} failed after ${duration}ms`,
    );

    // Permanent failure — move to DLQ immediately, don't waste retries
    if (isJobError && !shouldRetry) {
      // Dynamic import breaks top-level circular dependency with ./dlq
      const { dlqQueue, DLQJobs } = await import("./dlq/index.js");

      const payload = buildDeadLetterPayload({
        queueName: label.split(":")[0] as any,
        jobId: entityId,
        event: label.split(":")[1] || "unknown",
        payload: metadata,
        error: error instanceof Error ? error : new Error(String(error)),
        correlationId:
          typeof metadata.correlationId === "string"
            ? metadata.correlationId
            : undefined,
      });

      await dlqQueue.enqueue(DLQJobs.DeadLetter, payload);
      return;
    }

    // Transient failure — let pg-boss handle retries
    throw error;
  }
}
export const scheduleJob = async <T>({
  queueName,
  cronPattern,
  getData,
  buildPayload,
  emptyMessage,
}: ScheduleJobOptions<T>) => {
  const data = await getData();

  if (!data) {
    logger.warn(emptyMessage);
    return;
  }

  logger.info(`Scheduling ${queueName} via pg-boss...`);

  await boss.schedule(queueName, cronPattern, buildPayload(data));
};
