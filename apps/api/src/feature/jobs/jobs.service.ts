import { RedditJobAdapter } from "./adapters/reddit.adapter";
import { TwitterJobAdapter } from "./adapters/twitter.adapter";
import type { JobListing, JobSearchAdapter, QueryIntent } from "./jobs.types";

export class JobSearchService {
  private adapters: JobSearchAdapter[];

  constructor(
    adapters: JobSearchAdapter[] = [
      new TwitterJobAdapter(),
      new RedditJobAdapter(),
    ],
  ) {
    this.adapters = adapters;
  }

  public async findMatchingJobs(intent: QueryIntent): Promise<JobListing[]> {
    const searchPromises = this.adapters.map(async (adapter) => {
      try {
        return await adapter.search(intent);
      } catch (error) {
        console.error(
          `Failed to fetch jobs from adapter [${adapter.name}]:`,
          error,
        );
        return [];
      }
    });

    const results = (await Promise.all(searchPromises)).flat();

    return this.filterAndRankJobs(results, intent);
  }

  private filterAndRankJobs(
    jobs: JobListing[],
    intent: QueryIntent,
  ): JobListing[] {
    if (intent.excludeKeywords.length === 0) {
      return jobs;
    }

    const lowerExclusions = intent.excludeKeywords.map((k) => k.toLowerCase());

    return jobs.filter((job) => {
      const textToScan = `${job.title} ${job.description}`.toLowerCase();
      const hasExcludedKeyword = lowerExclusions.some((keyword) =>
        textToScan.includes(keyword),
      );
      return !hasExcludedKeyword;
    });
  }
}

export const jobSearchService = new JobSearchService();
