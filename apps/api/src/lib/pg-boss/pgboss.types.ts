import { DbResult } from "../drizzle/drizzle.types";
import { DLQJobs } from "./dlq";
import type { PgBossQueueName } from "./index";

/*
 * ==========================================
 * CORE JOB PAYLOAD TYPES
 * ==========================================
 */

export interface BaseJobPayload {
  correlationId: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export type JobPayload<T> = T & BaseJobPayload;

export type EnqueuePayload<T> = T & Partial<BaseJobPayload>;

export type ActionResult<T, E = Error> =
  | { ok: true; data: T; error?: null }
  | { ok: false; data: null | undefined; error?: E };

export type JobUnwrapOptions<T> = {
  message: string;
  shouldRetry?: boolean;
  fallback?: T;
  onFailure?: (
    result: DbResult<any> | ActionResult<any>,
  ) => void | Promise<void>;
};

/*
 * ==========================================
 * QUEUE ENQUEUE & HANDLER TYPES
 * ==========================================
 * Options passed when sending a job, and the shape a queue's
 * event-to-handler map must satisfy.
 */

export interface EnqueueOptions<T> {
  startAfter?: Date; // one-off future job
  singletonKey?: string; // prevents duplicate jobs for same entity
  retryLimit?: number;
  retryDelay?: number;
}

export type JobHandlerMap<TJobMap> = {
  [K in keyof TJobMap]: (payload: JobPayload<TJobMap[K]>) => Promise<void>;
};

/*
 * ==========================================
 * WORKER EXECUTION CONTEXT TYPES
 * ==========================================
 * Used by processBossJob to label and enrich logs/metrics for a
 * single job execution.
 */

export interface BossJobContext {
  label: string;
  entityId: string;
}

export interface BossEventOptions {
  metadata?: Record<string, string | number | boolean | null>;
}

/*
 * ==========================================
 * SCHEDULED (CRON) JOB TYPES
 * ==========================================
 */

export type ScheduleJobOptions<T> = {
  queueName: string;
  cronPattern: string;
  getData: () => Promise<T | null>;
  buildPayload: (data: T) => any;
  emptyMessage: string;
};

/*
 * ==========================================
 * DEAD LETTER QUEUE TYPES
 * ==========================================
 */

export interface DeadLetterPayload {
  originalQueue: PgBossQueueName;
  originalJobId: string;
  event: string;
  payload: unknown;
  error: {
    message: string;
    name?: string;
    stack?: string;
  };
  retryCount: number;
  failedAt: string; // ISO timestamp
  correlationId?: string;
}

export interface DLQJobMap {
  [DLQJobs.DeadLetter]: DeadLetterPayload;
}

export type DlqHandler = (payload: DeadLetterPayload) => Promise<void>;

export interface MoveToDLQParams {
  queueName: PgBossQueueName;
  jobId: string;
  event: string;
  payload: unknown;
  error: Error;
  correlationId?: string;
}
