import { jobSearchService } from "@/feature/jobs/jobs.service";
import { logger } from "@/lib/logger";
import type { JobPayload } from "@/lib/pg-boss/pgboss.types";

import type { IntentDerivedPayload } from "../intent.types";

export class IntentJobHandler {
  static async derivedEvent(payload: JobPayload<IntentDerivedPayload>) {
    const { intent } = payload;

    logger.info({ intent }, "Intent derived — dispatching job search adapters");

    const jobListings = await jobSearchService.findMatchingJobs(intent);

    logger.info(
      {
        jobCount: jobListings.length,
        sources: jobListings.map((job) => job.source),
      },
      "Job search adapters completed",
    );
  }
}
