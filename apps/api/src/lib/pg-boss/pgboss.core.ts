import { PgBoss } from "pg-boss";

import { logger } from "@/lib/logger";

import { processBossJob } from "./pgboss.jobs";
import type {
  BaseJobPayload,
  BossEventOptions,
  BossJobContext,
  EnqueueOptions,
  EnqueuePayload,
  JobHandlerMap,
  JobPayload,
  ScheduleJobOptions,
} from "./pgboss.types";

export const createPgBossQueue = <TEventMap>(name: string, boss: PgBoss) => {
  return {
    enqueue: async <TEvent extends keyof TEventMap>(
      event: TEvent,
      payload: EnqueuePayload<TEventMap[TEvent]>,
      options?: EnqueueOptions<TEventMap[TEvent]>,
    ) => {
      const decoratedPayload: JobPayload<TEventMap[TEvent]> = {
        ...(payload as any),
        correlationId: payload.correlationId ?? crypto.randomUUID(),
        createdAt: payload.createdAt ?? new Date().toISOString(),
      };

      const id = await boss.send(
        name,
        { event, payload: decoratedPayload },
        {
          singletonKey: options?.singletonKey,
          retryLimit: options?.retryLimit ?? 5,
          retryDelay: options?.retryDelay ?? 30,
          retryBackoff: true,
          startAfter: options?.startAfter
            ? Math.floor((options.startAfter.getTime() - Date.now()) / 1000)
            : undefined,
        },
      );

      return { id, event, payload: decoratedPayload };
    },
  };
};

export const createPgBossWorker = <TEventMap>(
  boss: PgBoss,
  queueName: string,
  handlers: JobHandlerMap<TEventMap>,
) => {
  const start = async () => {
    await boss.work(queueName, async (jobs) => {
      if (!jobs || jobs.length === 0) return;

      const job = jobs[0];

      const { event, payload } = job.data as {
        event: keyof TEventMap;
        payload: TEventMap[keyof TEventMap] & BaseJobPayload;
      };

      const handler = handlers[event];

      if (!handler) {
        logger.warn({ event, queue: queueName }, "Unhandled event received");
        return;
      }

      return await processBossJob(
        {
          label: `${queueName}:${String(event)}`,
          entityId: job.id,
        },
        () => handler(payload),
        {
          metadata: {
            jobId: job.id,
            event: String(event),
            queue: queueName,
          },
        },
      );
    });
  };

  return { start };
};
