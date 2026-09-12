import { compileEmailBlocks } from "@/feature/notifications/notifications.emails";

import { createAlertGenerators } from "../alerts.core";
import { deadLetterPayloadSchema } from "../alerts.types";

export const QueueAlertTemplates = {
  DEAD_LETTER: {
    key: "DEAD_LETTER",
    schema: deadLetterPayloadSchema,
  },
} as const;

export const queueAlertGenerators = createAlertGenerators(QueueAlertTemplates)({
  DEAD_LETTER: (data) => ({
    subject: `🚨 Critical: Permanent Job Failure in ${data.originalQueue}`,
    bodyHtml: compileEmailBlocks([
      { heading: "Job Permanently Failed" },
      {
        paragraph: `A job has exhausted all retries and moved to the dead letter queue.`,
      },
      {
        kvList: {
          Queue: data.originalQueue,
          "Job ID": data.originalJobId,
          Event: data.event,
          Retries: data.retryCount,
          "Failed At": new Date(data.failedAt).toLocaleString(),
          ...(data.correlationId && { "Correlation ID": data.correlationId }),
        },
      },
      {
        hint: data.error.stack
          ? `Stack: ${data.error.stack.slice(0, 500)}...`
          : `Error: ${data.error.message}`,
      },
    ]),
    metadata: {
      queue: data.originalQueue,
      jobId: data.originalJobId,
    },
  }),
});
