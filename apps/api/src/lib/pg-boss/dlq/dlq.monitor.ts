import { DLQJobs, dlqQueue } from ".";
import { boss } from "..";

import { logger } from "@/lib/logger";

import type { DeadLetterPayload } from "../pgboss.types";

export const initPgBossMonitor = () => {
  boss.on("error", (error) => {
    logger.error({ error }, "🚨 Global PgBoss Error");
  });

  boss.on("failed", async (job) => {
    // Skip intermediate retry failures — only handle permanent DLQ events
    const DEFAULT_RETRY_LIMIT = 5; // Must match createPgBossQueue default
    const isPermanentlyFailed = job.retryCount >= DEFAULT_RETRY_LIMIT;

    if (!isPermanentlyFailed) {
      logger.warn(
        { jobId: job.id, name: job.name, retryCount: job.retryCount },
        `⚠️ Job failed (retry ${job.retryCount}/${DEFAULT_RETRY_LIMIT})`,
      );
      return;
    }

    logger.error(
      {
        jobId: job.id,
        name: job.name,
        data: job.data,
        retryCount: job.retryCount,
        maxRetries: job.maxRetries,
        error: job.error,
      },
      `❌ JOB PERMANENTLY FAILED: ${job.name} (${job.id})`,
    );

    const { event, payload } = (job.data ?? {}) as {
      event: string;
      payload: any;
    };

    const dlqPayload: DeadLetterPayload = {
      originalQueue: job.name as any,
      originalJobId: job.id,
      event: event ?? "unknown",
      payload,
      error: {
        message: job.error?.message || "Unknown error",
        name: job.error?.name,
        stack: job.error?.stack,
      },
      retryCount: job.retryCount ?? 0,
      failedAt: new Date().toISOString(),
      correlationId: payload?.correlationId,
    };

    try {
      await dlqQueue.enqueue(DLQJobs.DeadLetter, dlqPayload, { retryLimit: 3 });
      logger.info({ jobId: job.id }, "📨 Moved dead job to DLQ");
    } catch (dlqError) {
      logger.fatal(
        { jobId: job.id, error: dlqError },
        "💀 Failed to move job to DLQ",
      );
    }
  });

  boss.on("completed", (job) => {
    logger.debug({ jobId: job.id, name: job.name }, "✅ Job Completed");
  });
};
